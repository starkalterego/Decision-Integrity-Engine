import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/scenarios - Create new scenario
// Per API_CONTRACTS.md lines 192-204
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation: Name is required
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

        // Assumptions can be empty initially, but are mandatory for finalization
        // (validation happens in finalize endpoint)
        const assumptions = body.assumptions?.trim() || '';

        // Create scenario
        const scenario = await prisma.scenario.create({
            data: {
                portfolioId: body.portfolioId,
                name: body.name,
                assumptions: assumptions,
                isBaseline: false,
                isFinalized: false
            }
        });

        // Initialize scenario with default PAUSE decisions for all complete initiatives
        const initiatives = await prisma.initiative.findMany({
            where: {
                portfolioId: body.portfolioId,
                isComplete: true
            }
        });

        // Create default PAUSE decisions for all initiatives
        if (initiatives.length > 0) {
            await prisma.scenarioDecision.createMany({
                data: initiatives.map(initiative => ({
                    scenarioId: scenario.id,
                    initiativeId: initiative.id,
                    decision: 'PAUSE'
                }))
            });
        }

        // Create governance record
        await prisma.governanceDecisionRecord.create({
            data: {
                portfolioId: body.portfolioId,
                actionType: 'SCENARIO_CREATION',
                entityId: scenario.id,
                entityType: 'SCENARIO',
                rationale: `Created scenario: ${scenario.name}`,
                metadata: JSON.stringify({ 
                    assumptions: scenario.assumptions,
                    initiativeCount: initiatives.length
                })
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
