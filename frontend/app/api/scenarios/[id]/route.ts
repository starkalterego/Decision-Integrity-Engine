import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/scenarios/[id] - Get scenario by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const scenario = await prisma.scenario.findUnique({
            where: { id },
            include: {
                decisions: {
                    include: {
                        initiative: {
                            include: {
                                capacityDemands: true
                            }
                        }
                    }
                },
                portfolio: true
            }
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

        return NextResponse.json({
            success: true,
            data: scenario,
            errors: []
        });

    } catch (error) {
        console.error('Error fetching scenario:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch scenario'
                }]
            },
            { status: 500 }
        );
    }
}

// PATCH /api/scenarios/[id] - Update scenario (assumptions only)
// Per decision-logic.md lines 150-156: Scenarios must maintain assumptions
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if scenario exists
        const scenario = await prisma.scenario.findUnique({
            where: { id }
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

        // Cannot modify finalized scenarios
        if (scenario.isFinalized) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'INVALID_LIFECYCLE_TRANSITION',
                        message: 'Cannot modify finalized scenario'
                    }]
                },
                { status: 400 }
            );
        }

        // Validate assumptions if provided
        if (body.assumptions !== undefined) {
            if (!body.assumptions || !body.assumptions.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        data: null,
                        errors: [{
                            code: 'VALIDATION_ERROR',
                            message: 'Scenario assumptions cannot be empty per governance rules'
                        }]
                    },
                    { status: 400 }
                );
            }
        }

        // Update scenario
        const updatedScenario = await prisma.scenario.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.assumptions && { assumptions: body.assumptions })
            },
            include: {
                decisions: {
                    include: {
                        initiative: {
                            include: {
                                capacityDemands: true
                            }
                        }
                    }
                },
                portfolio: true
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedScenario,
            errors: []
        });

    } catch (error) {
        console.error('Error updating scenario:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update scenario'
                }]
            },
            { status: 500 }
        );
    }
}
