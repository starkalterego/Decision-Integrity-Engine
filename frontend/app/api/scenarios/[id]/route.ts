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
