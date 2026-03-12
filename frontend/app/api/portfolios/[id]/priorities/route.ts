import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePriorityScore, getPriorityTier } from '@/lib/priority';

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

        // Calculate priority for each initiative using centralized logic
        const initiativesWithPriority = initiatives.map((initiative: any) => {
            const priorityScore = calculatePriorityScore({
                estimatedValue: initiative.estimatedValue,
                strategicAlignmentScore: initiative.strategicAlignmentScore,
                strategyScore: initiative.strategyScore ?? 0,
                costOfDelay: initiative.costOfDelay ?? 0,
                riskScore: initiative.riskScore,
                capacityDemands: initiative.capacityDemands
            });
            
            const priorityTier = getPriorityTier(priorityScore);
            
            return {
                ...initiative,
                priorityScore,
                priorityTier
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
