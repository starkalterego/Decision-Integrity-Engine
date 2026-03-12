import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { recalculateScenarioMetrics } from '@/lib/governance';

// POST /api/scenarios/[id]/decisions - Update scenario decisions
// Per API_CONTRACTS.md lines 208-224
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: scenarioId } = await params;
        const body = await request.json();

        // Check if scenario exists and is not finalized
        const scenario = await withRetry(() => prisma.scenario.findUnique({
            where: { id: scenarioId }
        }));

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

        if (scenario.isFinalized) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'INVALID_LIFECYCLE_TRANSITION',
                        message: 'Cannot modify decisions for finalized scenario'
                    }]
                },
                { status: 400 }
            );
        }

        // Delete existing decisions, create new ones, and fetch result — all in one connection
        const updatedScenario = await withRetry(() => prisma.$transaction(async (tx) => {
            await tx.scenarioDecision.deleteMany({
                where: { scenarioId }
            });

            await tx.scenarioDecision.createMany({
                data: body.decisions.map((d: any) => ({
                    scenarioId,
                    initiativeId: d.initiativeId,
                    decision: d.decision
                }))
            });

            return tx.scenario.findUnique({
                where: { id: scenarioId },
                include: {
                    decisions: {
                        include: {
                            initiative: {
                                include: {
                                    capacityDemands: true
                                }
                            }
                        }
                    }
                }
            });
        }));

        // Keep ScenarioMetrics table in sync after every decision change
        await recalculateScenarioMetrics(scenarioId, prisma);

        return NextResponse.json({
            success: true,
            data: updatedScenario,
            errors: []
        });

    } catch (error) {
        console.error('Error updating scenario decisions:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update scenario decisions'
                }]
            },
            { status: 500 }
        );
    }
}
