/**
 * Governance Engine — Single source of truth for all portfolio governance rules.
 * All API routes must call these functions instead of inlining logic.
 */

import { PrismaClient } from '@prisma/client'

// ─────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────

export class GovernanceViolation extends Error {
    constructor(
        public readonly code: string,
        message: string
    ) {
        super(message)
        this.name = 'GovernanceViolation'
    }
}

// ─────────────────────────────────────────────
// A. Lifecycle State Machine
// ─────────────────────────────────────────────

export const LIFECYCLE_STATES = [
    'IDEA',
    'CONCEPT_APPROVED',
    'PLANNED',
    'EXECUTION',
    'CLOSED',
    'TERMINATED',
] as const

export type LifecycleState = typeof LIFECYCLE_STATES[number]

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    IDEA:             ['CONCEPT_APPROVED', 'TERMINATED'],
    CONCEPT_APPROVED: ['PLANNED', 'TERMINATED'],
    PLANNED:          ['EXECUTION', 'TERMINATED'],
    EXECUTION:        ['CLOSED', 'TERMINATED'],
    CLOSED:           [],
    TERMINATED:       [],
}

/**
 * Validates that a lifecycle transition is allowed.
 * Throws GovernanceViolation if not.
 */
export function validateLifecycleTransition(
    current: string,
    target: string
): void {
    const allowed = ALLOWED_TRANSITIONS[current]

    if (!allowed) {
        throw new GovernanceViolation(
            'INVALID_LIFECYCLE_STATE',
            `Unknown lifecycle state: "${current}"`
        )
    }

    if (!ALLOWED_TRANSITIONS[target] && target !== 'TERMINATED') {
        throw new GovernanceViolation(
            'INVALID_LIFECYCLE_STATE',
            `Unknown target state: "${target}"`
        )
    }

    if (!allowed.includes(target)) {
        throw new GovernanceViolation(
            'INVALID_LIFECYCLE_TRANSITION',
            `Cannot transition from ${current} to ${target}. Allowed: ${allowed.length ? allowed.join(', ') : 'none'}`
        )
    }
}

// ─────────────────────────────────────────────
// B. Initiative Completeness Gate
// ─────────────────────────────────────────────

export interface CompletenessResult {
    isComplete: boolean
    errors: string[]
}

/**
 * Validates that an initiative has all required fields.
 * Returns a result object — does NOT throw (routes decide how to handle).
 */
export function validateInitiativeCompleteness(data: {
    name?: string
    sponsor?: string
    deliveryOwner?: string
    strategicAlignmentScore?: number
    estimatedValue?: number
    riskScore?: number
    costOfDelay?: number
    capacityDemands?: Array<{ role?: string; units?: number }>
}): CompletenessResult {
    const errors: string[] = []

    if (!data.name?.trim())
        errors.push('Initiative name is required')

    if (!data.sponsor?.trim())
        errors.push('Sponsor is required')

    if (!data.deliveryOwner?.trim())
        errors.push('Delivery owner is required')

    if (
        data.strategicAlignmentScore == null ||
        data.strategicAlignmentScore < 1 ||
        data.strategicAlignmentScore > 5
    )
        errors.push('Strategic alignment score must be between 1 and 5')

    if (!data.estimatedValue || data.estimatedValue <= 0)
        errors.push('Estimated value must be greater than 0')

    if (
        data.riskScore == null ||
        data.riskScore < 1 ||
        data.riskScore > 5
    )
        errors.push('Risk score must be between 1 and 5')

    if (
        data.costOfDelay == null ||
        data.costOfDelay < 0
    )
        errors.push('Cost of delay is required and must be ≥ 0')

    if (!data.capacityDemands || data.capacityDemands.length === 0)
        errors.push('At least one capacity demand is required')
    else {
        data.capacityDemands.forEach((cd, i) => {
            if (!cd.role?.trim())
                errors.push(`Capacity demand #${i + 1}: role name is required`)
            if (cd.units == null || cd.units <= 0)
                errors.push(`Capacity demand #${i + 1}: units must be > 0`)
        })
    }

    return { isComplete: errors.length === 0, errors }
}

// ─────────────────────────────────────────────
// C. Execution Approval Gate
// ─────────────────────────────────────────────

/**
 * Additional checks required before PLANNED → EXECUTION.
 * Throws GovernanceViolation on any failure.
 */
export async function validateExecutionApproval(
    initiativeId: string,
    db: PrismaClient
): Promise<void> {
    const initiative = await db.initiative.findUnique({
        where: { id: initiativeId },
        include: {
            capacityDemands: true,
            portfolio: true,
        },
    })

    if (!initiative) {
        throw new GovernanceViolation('NOT_FOUND', `Initiative ${initiativeId} not found`)
    }

    // 1. Must be complete
    if (!initiative.isComplete) {
        throw new GovernanceViolation(
            'INITIATIVE_INCOMPLETE',
            'Initiative must be marked complete before advancing to EXECUTION'
        )
    }

    // 2. Portfolio must exist and not be over total capacity
    const portfolio = initiative.portfolio
    const totalDemanded = initiative.capacityDemands.reduce((sum, cd) => sum + cd.units, 0)

    if (totalDemanded > portfolio.totalCapacity) {
        throw new GovernanceViolation(
            'CAPACITY_EXCEEDED',
            `Initiative capacity demand (${totalDemanded}) exceeds portfolio total capacity (${portfolio.totalCapacity})`
        )
    }

    // 3. Portfolio budget: capexCost + opexCost must fit within totalBudget
    const totalCost = initiative.capexCost + initiative.opexCost
    if (totalCost > portfolio.totalBudget) {
        throw new GovernanceViolation(
            'BUDGET_EXCEEDED',
            `Initiative total cost (${totalCost}) exceeds portfolio budget (${portfolio.totalBudget})`
        )
    }
}

// ─────────────────────────────────────────────
// D. Role-Based Capacity Validation
// ─────────────────────────────────────────────

export interface CapacityRoleRow {
    roleId: string | null
    roleName: string
    demanded: number
    available: number      // 0 if no RoleCapacity rows defined (falls back to aggregate)
    breached: boolean
}

export interface CapacityReport {
    perRole: CapacityRoleRow[]
    totalDemanded: number
    totalAvailable: number
    aggregateBreached: boolean
    hasRoleData: boolean   // false → only aggregate check possible
}

/**
 * Validates capacity for a given scenario.
 * Checks per-role if RoleCapacity rows exist, otherwise falls back to portfolio aggregate.
 */
export async function validateRoleCapacity(
    portfolioId: string,
    scenarioId: string,
    db: PrismaClient
): Promise<CapacityReport> {
    const [portfolio, fundedDecisions, roleCapacities] = await Promise.all([
        db.portfolio.findUnique({ where: { id: portfolioId } }),
        db.scenarioDecision.findMany({
            where: { scenarioId, decision: 'FUND' },
            include: {
                initiative: {
                    include: { capacityDemands: true },
                },
            },
        }),
        db.roleCapacity.findMany({
            where: { portfolioId },
            include: { role: true },
        }),
    ])

    if (!portfolio) {
        throw new GovernanceViolation('NOT_FOUND', `Portfolio ${portfolioId} not found`)
    }

    // Flatten all capacity demands from FUND decisions
    const allDemands = fundedDecisions.flatMap(d => d.initiative.capacityDemands)
    const totalDemanded = allDemands.reduce((sum, cd) => sum + cd.units, 0)
    const hasRoleData = roleCapacities.length > 0

    let perRole: CapacityRoleRow[] = []

    if (hasRoleData) {
        // Build per-role demanded map (keyed by roleId)
        const demandByRoleId = new Map<string, { roleName: string; demanded: number }>()

        for (const cd of allDemands) {
            if (cd.roleId) {
                const existing = demandByRoleId.get(cd.roleId)
                if (existing) {
                    existing.demanded += cd.units
                } else {
                    demandByRoleId.set(cd.roleId, { roleName: cd.role, demanded: cd.units })
                }
            }
        }

        // Map against RoleCapacity (summed available per role)
        const availableByRoleId = new Map<string, { roleName: string; available: number }>()
        for (const rc of roleCapacities) {
            const existing = availableByRoleId.get(rc.roleId)
            if (existing) {
                existing.available += rc.availableUnits
            } else {
                availableByRoleId.set(rc.roleId, {
                    roleName: rc.role.name,
                    available: rc.availableUnits,
                })
            }
        }

        // Build report rows for every role that appears in either side
        const allRoleIds = new Set([
            ...demandByRoleId.keys(),
            ...availableByRoleId.keys(),
        ])

        for (const roleId of allRoleIds) {
            const demand = demandByRoleId.get(roleId)
            const avail = availableByRoleId.get(roleId)
            const demanded = demand?.demanded ?? 0
            const available = avail?.available ?? 0
            const roleName = demand?.roleName ?? avail?.roleName ?? roleId

            perRole.push({
                roleId,
                roleName,
                demanded,
                available,
                breached: demanded > available,
            })
        }
    }

    return {
        perRole,
        totalDemanded,
        totalAvailable: portfolio.totalCapacity,
        aggregateBreached: totalDemanded > portfolio.totalCapacity,
        hasRoleData,
    }
}

// ─────────────────────────────────────────────
// E. Budget Validation
// ─────────────────────────────────────────────

export interface BudgetReport {
    totalCapex: number
    totalOpex: number
    totalCost: number
    budgetLimit: number
    isBreached: boolean
    utilizationPct: number
}

/**
 * Computes total capex+opex for FUND decisions in a scenario vs portfolio budget.
 */
export async function validateBudget(
    portfolioId: string,
    scenarioId: string,
    db: PrismaClient
): Promise<BudgetReport> {
    const [portfolio, fundedDecisions] = await Promise.all([
        db.portfolio.findUnique({ where: { id: portfolioId } }),
        db.scenarioDecision.findMany({
            where: { scenarioId, decision: 'FUND' },
            include: { initiative: true },
        }),
    ])

    if (!portfolio) {
        throw new GovernanceViolation('NOT_FOUND', `Portfolio ${portfolioId} not found`)
    }

    const totalCapex = fundedDecisions.reduce((sum, d) => sum + d.initiative.capexCost, 0)
    const totalOpex = fundedDecisions.reduce((sum, d) => sum + d.initiative.opexCost, 0)
    const totalCost = totalCapex + totalOpex

    return {
        totalCapex,
        totalOpex,
        totalCost,
        budgetLimit: portfolio.totalBudget,
        isBreached: totalCost > portfolio.totalBudget,
        utilizationPct: portfolio.totalBudget > 0
            ? (totalCost / portfolio.totalBudget) * 100
            : 0,
    }
}

// ─────────────────────────────────────────────
// F. Scenario Metrics Recalculation
// ─────────────────────────────────────────────

/**
 * Recomputes and upserts ScenarioMetrics for a given scenario.
 * Must be called after every decision change (Fund/Pause/Stop).
 */
export async function recalculateScenarioMetrics(
    scenarioId: string,
    db: PrismaClient
): Promise<void> {
    const decisions = await db.scenarioDecision.findMany({
        where: { scenarioId },
        include: { initiative: { include: { capacityDemands: true } } },
    })

    const funded  = decisions.filter(d => d.decision === 'FUND')
    const paused  = decisions.filter(d => d.decision === 'PAUSE')
    const stopped = decisions.filter(d => d.decision === 'STOP')

    const totalValue    = funded.reduce((s, d) => s + d.initiative.estimatedValue, 0)
    const totalCapex    = funded.reduce((s, d) => s + d.initiative.capexCost, 0)
    const totalOpex     = funded.reduce((s, d) => s + d.initiative.opexCost, 0)
    const totalCost     = totalCapex + totalOpex
    const totalCapacity = funded.reduce((s, d) =>
        s + d.initiative.capacityDemands.reduce((cs, cd) => cs + cd.units, 0), 0)
    const avgRiskScore  = funded.length > 0
        ? funded.reduce((s, d) => s + d.initiative.riskScore, 0) / funded.length
        : 0

    await db.scenarioMetrics.upsert({
        where: { scenarioId },
        update: {
            totalValue,
            totalCapex,
            totalOpex,
            totalCost,
            totalCapacity,
            avgRiskScore,
            fundedCount:   funded.length,
            pausedCount:   paused.length,
            stoppedCount:  stopped.length,
        },
        create: {
            scenarioId,
            totalValue,
            totalCapex,
            totalOpex,
            totalCost,
            totalCapacity,
            avgRiskScore,
            fundedCount:   funded.length,
            pausedCount:   paused.length,
            stoppedCount:  stopped.length,
        },
    })
}
