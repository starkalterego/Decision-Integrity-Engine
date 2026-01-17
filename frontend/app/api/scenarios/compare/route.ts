import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/scenarios/compare?baselineId=xxx&scenarioId=xxx
// Per API_CONTRACTS.md lines 235-249
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const baselineId = searchParams.get('baselineId');
        const scenarioId = searchParams.get('scenarioId');

        if (!baselineId || !scenarioId) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'VALIDATION_ERROR',
                        message: 'Both baselineId and scenarioId query parameters are required'
                    }]
                },
                { status: 400 }
            );
        }

        // Fetch both scenarios with decisions
        const [baseline, scenario] = await Promise.all([
            prisma.scenario.findUnique({
                where: { id: baselineId },
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
                    },
                    portfolio: true
                }
            }),
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
                    },
                    portfolio: true
                }
            })
        ]);

        if (!baseline || !scenario) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'NOT_FOUND',
                        message: 'Baseline or scenario not found'
                    }]
                },
                { status: 404 }
            );
        }

        // Calculate metrics for baseline
        const baselineMetrics = calculateScenarioMetrics(baseline);
        const scenarioMetrics = calculateScenarioMetrics(scenario);

        // Calculate deltas per BACKEND.md lines 157-166
        const comparison = {
            baseline: {
                name: baseline.name,
                ...baselineMetrics
            },
            scenario: {
                name: scenario.name,
                ...scenarioMetrics
            },
            deltas: {
                valueDelta: scenarioMetrics.totalValue - baselineMetrics.totalValue,
                riskDelta: scenarioMetrics.avgRisk - baselineMetrics.avgRisk,
                capacityDelta: scenarioMetrics.capacityUtilization - baselineMetrics.capacityUtilization
            }
        };

        return NextResponse.json({
            success: true,
            data: comparison,
            errors: []
        });

    } catch (error) {
        console.error('Error comparing scenarios:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to compare scenarios'
                }]
            },
            { status: 500 }
        );
    }
}

// Helper function to calculate scenario metrics
function calculateScenarioMetrics(scenario: any) {
    const fundedInitiatives = scenario.decisions.map((d: any) => d.initiative);

    const totalValue = fundedInitiatives.reduce(
        (sum: number, init: any) => sum + init.estimatedValue,
        0
    );

    const totalCapacity = fundedInitiatives.reduce((sum: number, init: any) => {
        return sum + init.capacityDemands.reduce((s: number, cd: any) => s + cd.units, 0);
    }, 0);

    const avgRisk = fundedInitiatives.length > 0
        ? fundedInitiatives.reduce((sum: number, init: any) => sum + init.riskScore, 0) / fundedInitiatives.length
        : 0;

    const capacityUtilization = totalCapacity / scenario.portfolio.totalCapacity;

    return {
        totalValue,
        totalCapacity,
        avgRisk,
        capacityUtilization,
        fundedCount: fundedInitiatives.length
    };
}
