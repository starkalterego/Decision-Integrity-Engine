// Priority Score Calculation Engine
// Per BACKEND.md lines 100-117 and decision-logic.md lines 92-118

// Weights per governance formula
const WEIGHTS = {
    VALUE: 0.30,              // W1: Value contribution
    ALIGNMENT: 0.25,          // W2: Strategic alignment
    COST_OF_DELAY: 0.15,      // W3: Urgency/timing
    RISK_PENALTY: 0.20,       // W4: Risk reduction factor
    CAPACITY_PENALTY: 0.10    // W5: Capacity consumption penalty
};

interface InitiativeData {
    estimatedValue: number;
    strategicAlignmentScore: number;  // 1-5
    riskScore: number;                // 1-5
    capacityDemands: Array<{ units: number }>;
}

/**
 * Calculate priority score using deterministic weighted formula
 * Higher score = Higher priority
 * 
 * Priority = (Value × W1) + (Alignment × W2) + (CostOfDelay × W3) 
 *           - (Risk × W4) - (Capacity × W5)
 */
export function calculatePriorityScore(initiative: InitiativeData): number {
    // Normalize value (scale to 0-100 based on typical portfolio range)
    // MVP: Simple normalization - in production, this would be portfolio-relative
    const normalizedValue = Math.min(initiative.estimatedValue / 1000000, 100); // Scale to millions

    // Strategic alignment is already 1-5, scale to 0-100
    const normalizedAlignment = (initiative.strategicAlignmentScore / 5) * 100;

    // Cost of delay (MVP: derived from value and alignment)
    // High value + high alignment = high cost of delay
    const costOfDelay = (normalizedValue * 0.6 + normalizedAlignment * 0.4);

    // Risk penalty (1-5, higher = worse, scale to 0-100 for penalty)
    const riskPenalty = (initiative.riskScore / 5) * 100;

    // Capacity penalty (total capacity demand)
    const totalCapacity = initiative.capacityDemands.reduce((sum, cd) => sum + cd.units, 0);
    const normalizedCapacity = Math.min(totalCapacity / 10, 100); // Scale capacity units

    // Calculate weighted priority score
    const priorityScore = 
        (normalizedValue * WEIGHTS.VALUE) +
        (normalizedAlignment * WEIGHTS.ALIGNMENT) +
        (costOfDelay * WEIGHTS.COST_OF_DELAY) -
        (riskPenalty * WEIGHTS.RISK_PENALTY) -
        (normalizedCapacity * WEIGHTS.CAPACITY_PENALTY);

    // Return score rounded to 2 decimal places
    return Math.round(priorityScore * 100) / 100;
}

/**
 * Validate if priority score needs recalculation
 * Call this when initiative attributes change
 */
export function shouldRecalculatePriority(
    oldData: InitiativeData,
    newData: InitiativeData
): boolean {
    return (
        oldData.estimatedValue !== newData.estimatedValue ||
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
