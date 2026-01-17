import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Delete existing decisions and create new ones
        await prisma.scenarioDecision.deleteMany({
            where: { scenarioId }
        });

        // Create new decisions
        const decisions = await prisma.scenarioDecision.createMany({
            data: body.decisions.map((d: any) => ({
                scenarioId,
                initiativeId: d.initiativeId,
                decision: d.decision
            }))
        });

        // Fetch updated scenario with decisions
        const updatedScenario = await prisma.scenario.findUnique({
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
