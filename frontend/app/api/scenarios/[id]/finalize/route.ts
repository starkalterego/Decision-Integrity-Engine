import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRoleCapacity, validateBudget } from '@/lib/governance';

// POST /api/scenarios/[id]/finalize - Finalize scenario
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: scenarioId } = await params;

        const scenario = await prisma.scenario.findUnique({ where: { id: scenarioId } });

        if (!scenario) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'NOT_FOUND', message: 'Scenario not found' }] },
                { status: 404 }
            );
        }

        if (scenario.isFinalized) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'ALREADY_FINALIZED', message: 'Scenario is already finalized' }] },
                { status: 400 }
            );
        }

        // Validation 1: Assumptions must exist
        if (!scenario.assumptions?.trim()) {
            return NextResponse.json(
                { success: false, data: null, errors: [{ code: 'VALIDATION_ERROR', message: 'Cannot finalize: Scenario assumptions are mandatory per governance rules' }] },
                { status: 400 }
            );
        }

        // Validation 2: Role-based capacity check (falls back to aggregate if no RoleCapacity rows)
        const capacityReport = await validateRoleCapacity(scenario.portfolioId, scenarioId, prisma);

        if (capacityReport.aggregateBreached) {
            return NextResponse.json(
                {
                    success: false, data: null,
                    errors: [{
                        code: 'CAPACITY_EXCEEDED',
                        message: `Cannot finalize: Total capacity demand (${capacityReport.totalDemanded}) exceeds portfolio limit (${capacityReport.totalAvailable})`
                    }]
                },
                { status: 400 }
            );
        }

        const breachedRoles = capacityReport.perRole.filter(r => r.breached);
        if (breachedRoles.length > 0) {
            const detail = breachedRoles.map(r => `${r.roleName}: ${r.demanded}/${r.available}`).join(', ');
            return NextResponse.json(
                {
                    success: false, data: null,
                    errors: [{ code: 'ROLE_CAPACITY_EXCEEDED', message: `Cannot finalize: Role capacity breached — ${detail}` }]
                },
                { status: 400 }
            );
        }

        // Validation 3: Budget check (capex + opex vs totalBudget)
        const budgetReport = await validateBudget(scenario.portfolioId, scenarioId, prisma);

        if (budgetReport.isBreached) {
            return NextResponse.json(
                {
                    success: false, data: null,
                    errors: [{
                        code: 'BUDGET_EXCEEDED',
                        message: `Cannot finalize: Total cost (${budgetReport.totalCost.toFixed(0)}) exceeds budget (${budgetReport.budgetLimit.toFixed(0)})`
                    }]
                },
                { status: 400 }
            );
        }

        // Finalize + write governance audit record atomically
        const finalizedScenario = await prisma.$transaction(async (tx) => {
            const updated = await tx.scenario.update({
                where: { id: scenarioId },
                data: { isFinalized: true }
            });

            await tx.governanceDecisionRecord.create({
                data: {
                    portfolioId: scenario.portfolioId,
                    actionType: 'FINALIZATION',
                    entityId: scenarioId,
                    entityType: 'SCENARIO',
                    rationale: `Finalized scenario: ${scenario.name}`,
                    metadata: JSON.stringify({
                        capacityDemanded: capacityReport.totalDemanded,
                        capacityAvailable: capacityReport.totalAvailable,
                        totalCost: budgetReport.totalCost,
                        totalCapex: budgetReport.totalCapex,
                        totalOpex: budgetReport.totalOpex,
                        budgetLimit: budgetReport.budgetLimit,
                        budgetUtilizationPct: budgetReport.utilizationPct,
                    })
                }
            });

            return updated;
        });

        return NextResponse.json({ success: true, data: finalizedScenario, errors: [] });

    } catch (error) {
        console.error('Error finalizing scenario:', error);
        return NextResponse.json(
            { success: false, data: null, errors: [{ code: 'INTERNAL_ERROR', message: 'Failed to finalize scenario' }] },
            { status: 500 }
        );
    }
}

