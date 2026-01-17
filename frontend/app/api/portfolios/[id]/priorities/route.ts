import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Priority calculation per BACKEND.md lines 104-120
function calculatePriority(initiative: any): number {
    const weights = {
        value: 0.3,
        alignment: 0.25,
        costOfDelay: 0.2,
        risk: 0.15,
        capacity: 0.1
    };

    // Normalize values for calculation
    const normalizedValue = initiative.estimatedValue / 100000000; // Normalize to 0-1 range
    const normalizedAlignment = initiative.strategicAlignmentScore / 5; // Already 1-5
    const normalizedRisk = initiative.riskScore / 5; // Already 1-5
    const totalCapacity = initiative.capacityDemands.reduce((sum: number, cd: any) => sum + cd.units, 0);
    const normalizedCapacity = totalCapacity / 100; // Normalize capacity

    const score =
        (normalizedValue * weights.value) +
        (normalizedAlignment * weights.alignment) +
        (0 * weights.costOfDelay) - // MVP: Cost of delay = 0
        (normalizedRisk * weights.risk) -
        (normalizedCapacity * weights.capacity);

    return score;
}

// GET /api/portfolios/[id]/priorities - Get priority ranking
// Per API_CONTRACTS.md lines 164-170
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: portfolioId } = await params;

        // Get all complete initiatives per BACKEND.md lines 115-117
        const initiatives = await prisma.initiative.findMany({
            where: {
                portfolioId,
                isComplete: true
            },
            include: {
                capacityDemands: true
            }
        });

        // Calculate priority for each initiative
        const initiativesWithPriority = initiatives.map((initiative: any) => {
            const priorityScore = calculatePriority(initiative);
            return {
                ...initiative,
                priorityScore
            };
        });

        // Sort by priority score (highest first)
        const sortedInitiatives = initiativesWithPriority.sort((a: any, b: any) => b.priorityScore - a.priorityScore);

        // Update priority scores in database
        await Promise.all(
            sortedInitiatives.map((init: any) =>
                prisma.initiative.update({
                    where: { id: init.id },
                    data: { priorityScore: init.priorityScore }
                })
            )
        );

        return NextResponse.json({
            success: true,
            data: sortedInitiatives,
            errors: []
        });

    } catch (error) {
        console.error('Error calculating priorities:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to calculate priorities'
                }]
            },
            { status: 500 }
        );
    }
}
