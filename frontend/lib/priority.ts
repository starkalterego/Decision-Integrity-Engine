// Priority Score Calculation Engine
// Per Architecture_code_snippet.md Phase 1 formula

// Weights per governance formula (Architecture Phase 1)
const WEIGHTS = {
    VALUE: 0.40,              // W1: Value contribution (increased — value is primary driver)
    STRATEGY: 0.30,           // W2: Strategic alignment (continuous 0-100 strategyScore)
    COST_OF_DELAY: 0.30,      // W3: Urgency/timing (actual weekly cost-of-delay in £)
    RISK_PENALTY: 0.20,       // W4: Risk reduction factor
    CAPACITY_PENALTY: 0.10    // W5: Capacity consumption penalty
};

// Max cost-of-delay reference value for normalisation (£2M/week = 100 normalised)
const COD_REFERENCE = 2_000_000;

export interface InitiativeData {
    estimatedValue: number;         // Raw £ value
    strategicAlignmentScore: number; // 1-5 integer (for completeness gate)
    strategyScore: number;           // 0-100 continuous (used in priority formula)
    costOfDelay: number;             // Weekly business cost of not starting (£)
    riskScore: number;               // 1-5
    capacityDemands: Array<{ units: number }>;
}

/**
 * Calculate priority score using deterministic weighted formula.
 * Higher score = Higher priority.
 *
 * Priority = (NormValue × W1) + (strategyScore × W2) + (NormCoD × W3)
 *           - (NormRisk × W4) - (NormCapacity × W5)
 *
 * All inputs are normalised to 0–100 before weighting.
 */
export function calculatePriorityScore(initiative: InitiativeData): number {
    // Normalise value: £1M → 1, £100M → 100 (cap at 100)
    const normalizedValue = Math.min(initiative.estimatedValue / 1_000_000, 100);

    // strategyScore is already 0-100
    const normalizedStrategy = Math.max(0, Math.min(initiative.strategyScore, 100));

    // Normalise cost-of-delay against reference max (£2M/week = 100)
    const normalizedCoD = Math.min((initiative.costOfDelay / COD_REFERENCE) * 100, 100);

    // Risk penalty: 1-5 scale → 0-100 (higher score = more penalty)
    const riskPenalty = ((initiative.riskScore - 1) / 4) * 100;

    // Capacity penalty: total units, cap at 100
    const totalCapacity = initiative.capacityDemands.reduce((sum, cd) => sum + cd.units, 0);
    const normalizedCapacity = Math.min(totalCapacity, 100);

    // Weighted priority score
    const priorityScore =
        (normalizedValue * WEIGHTS.VALUE) +
        (normalizedStrategy * WEIGHTS.STRATEGY) +
        (normalizedCoD * WEIGHTS.COST_OF_DELAY) -
        (riskPenalty * WEIGHTS.RISK_PENALTY) -
        (normalizedCapacity * WEIGHTS.CAPACITY_PENALTY);

    return Math.round(priorityScore * 100) / 100;
}

/**
 * Validate if priority score needs recalculation
 */
export function shouldRecalculatePriority(
    oldData: InitiativeData,
    newData: InitiativeData
): boolean {
    return (
        oldData.estimatedValue !== newData.estimatedValue ||
        oldData.strategyScore !== newData.strategyScore ||
        oldData.costOfDelay !== newData.costOfDelay ||
        oldData.strategicAlignmentScore !== newData.strategicAlignmentScore ||
        oldData.riskScore !== newData.riskScore ||
        JSON.stringify(oldData.capacityDemands) !== JSON.stringify(newData.capacityDemands)
    );
}

/**
 * Get priority score tier for display
 */
export function getPriorityTier(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
}
