import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Capacity validation per BACKEND.md lines 122-138
async function validateCapacity(scenarioId: string, portfolioId: string) {
    const [scenario, portfolio] = await Promise.all([
        prisma.scenario.findUnique({
            where: { id: scenarioId },
            include: {
                decisions: {
                    where: { decision: 'FUND' },
                    include: {
                        initiative: {
                            include: {
                                capacityDemands: true
                            }
                        }
                    }
                }
            }
        }),
        prisma.portfolio.findUnique({
            where: { id: portfolioId }
        })
    ]);

    if (!scenario || !portfolio) {
        throw new Error('Scenario or portfolio not found');
    }

    // Calculate total capacity demand
    const totalCapacity = scenario.decisions.reduce((sum: number, decision: any) => {
        const initiativeCapacity = decision.initiative.capacityDemands.reduce(
            (iSum: number, cd: any) => iSum + cd.units,
            0
        );
        return sum + initiativeCapacity;
    }, 0);

    return {
        totalCapacity,
        limit: portfolio.totalCapacity,
        isBreached: totalCapacity > portfolio.totalCapacity,
        utilization: totalCapacity / portfolio.totalCapacity
    };
}

// POST /api/scenarios/[id]/finalize - Finalize scenario
// Per API_CONTRACTS.md lines 227-231
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: scenarioId } = await params;

        // Get scenario
        const scenario = await prisma.scenario.findUnique({
            where: { id: scenarioId }
        });

        if (!scenario) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Scenario not found'
                    }]
                },
                { status: 404 }
            );
        }

        // Validation 1: Assumptions must exist (decision-logic.md lines 150-156)
        if (!scenario.assumptions || !scenario.assumptions.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'Cannot finalize: Scenario assumptions are mandatory per governance rules'
                    }]
                },
                { status: 400 }
            );
        }

        // Validation 2: Capacity cannot be breached (BACKEND.md lines 134-137)
        const capacityCheck = await validateCapacity(scenarioId, scenario.portfolioId);

        if (capacityCheck.isBreached) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'CAPACITY_EXCEEDED',
                        message: `Cannot finalize: Capacity constraint breached. Total capacity demand (${capacityCheck.totalCapacity}) exceeds limit (${capacityCheck.limit})`
                    }]
                },
                { status: 400 }
            );
        }

        // Finalize scenario
        const finalizedScenario = await prisma.scenario.update({
            where: { id: scenarioId },
            data: { isFinalized: true }
        });

        // Create governance record
        await prisma.governanceDecisionRecord.create({
            data: {
                portfolioId: scenario.portfolioId,
                actionType: 'FINALIZATION',
                entityId: scenarioId,
                entityType: 'SCENARIO',
                rationale: `Finalized scenario: ${scenario.name}`,
                metadata: JSON.stringify({
                    capacityUtilization: capacityCheck.utilization,
                    totalCapacity: capacityCheck.totalCapacity
                })
            }
        });

        return NextResponse.json({
            success: true,
            data: finalizedScenario,
            errors: []
        });

    } catch (error) {
        console.error('Error finalizing scenario:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to finalize scenario'
                }]
            },
            { status: 500 }
        );
    }
}
