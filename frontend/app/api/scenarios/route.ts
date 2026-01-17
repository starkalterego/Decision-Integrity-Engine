import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/scenarios - Create new scenario
// Per API_CONTRACTS.md lines 192-204
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation per decision-logic.md lines 150-156: Assumptions are mandatory
        if (!body.assumptions || !body.assumptions.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'Scenario assumptions are mandatory per governance rules'
                    }]
                },
                { status: 400 }
            );
        }

        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'Scenario name is required'
                    }]
                },
                { status: 400 }
            );
        }

        // Create scenario
        const scenario = await prisma.scenario.create({
            data: {
                portfolioId: body.portfolioId,
                name: body.name,
                assumptions: body.assumptions,
                isBaseline: false,
                isFinalized: false
            }
        });

        // Create governance record
        await prisma.governanceDecisionRecord.create({
            data: {
                portfolioId: body.portfolioId,
                actionType: 'SCENARIO_CREATION',
                entityId: scenario.id,
                entityType: 'SCENARIO',
                rationale: `Created scenario: ${scenario.name}`,
                metadata: JSON.stringify({ assumptions: scenario.assumptions })
            }
        });

        return NextResponse.json({
            success: true,
            data: scenario,
            errors: []
        });

    } catch (error) {
        console.error('Error creating scenario:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create scenario'
                }]
            },
            { status: 500 }
        );
    }
}

// GET /api/scenarios?portfolioId=xxx - Get all scenarios
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const portfolioId = searchParams.get('portfolioId');

        if (!portfolioId) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'portfolioId query parameter is required'
                    }]
                },
                { status: 400 }
            );
        }

        const scenarios = await prisma.scenario.findMany({
            where: { portfolioId },
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: scenarios,
            errors: []
        });

    } catch (error) {
        console.error('Error fetching scenarios:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch scenarios'
                }]
            },
            { status: 500 }
        );
    }
}
