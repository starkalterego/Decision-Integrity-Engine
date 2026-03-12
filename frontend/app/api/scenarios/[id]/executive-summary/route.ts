import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Decision = {
    decision: string;
    initiative: {
        id: string;
        name: string;
        sponsor: string;
        estimatedValue: number;
        capexCost: number;
        opexCost: number;
        riskScore: number;
        strategicAlignmentScore: number;
        capacityDemands: { units: number }[];
    };
};

type Initiative = {
    id: string;
    name: string;
    sponsor: string;
    estimatedValue: number;
    capexCost: number;
    opexCost: number;
    riskScore: number;
    strategicAlignmentScore: number;
    capacityDemands: { units: number }[];
};

// GET /api/scenarios/[id]/executive-summary - Get executive summary for finalized scenario
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: scenarioId } = await params;

        // Get scenario with all related data
        const scenario = await prisma.scenario.findUnique({
            where: { id: scenarioId },
            include: {
                portfolio: true,
                metrics: true,
                decisions: {
                    include: {
                        initiative: {
                            include: {
                                capacityDemands: true,
                                risks: {
                                    where: { status: 'OPEN' },
                                    orderBy: { exposure: 'desc' },
                                    take: 3,
                                }
                            }
                        }
                    }
                }
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

        // Validate scenario is finalized
        if (!scenario.isFinalized) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    errors: [{
                        code: 'INVALID_STATE',
                        message: 'Executive summary only available for finalized scenarios'
                    }]
                },
                { status: 400 }
            );
        }

        // Separate decisions by type
        const fundedInitiatives = scenario.decisions
            .filter((d: Decision) => d.decision === 'FUND')
            .map((d: Decision) => d.initiative);

        const pausedInitiatives = scenario.decisions
            .filter((d: Decision) => d.decision === 'PAUSE')
            .map((d: Decision) => d.initiative);

        const stoppedInitiatives = scenario.decisions
            .filter((d: Decision) => d.decision === 'STOP')
            .map((d: Decision) => d.initiative);

        // Use ScenarioMetrics if available (pre-computed), else compute inline
        const metrics = scenario.metrics;
        const totalCost = metrics
            ? metrics.totalCost
            : fundedInitiatives.reduce((sum: number, init: Initiative) => sum + (init.capexCost || 0) + (init.opexCost || 0), 0);

        const totalCapex = fundedInitiatives.reduce((sum: number, init: Initiative) => sum + (init.capexCost || 0), 0);
        const totalOpex  = fundedInitiatives.reduce((sum: number, init: Initiative) => sum + (init.opexCost || 0), 0);

        // Investment = total committed cost (not portfolio budget)
        const totalInvestment = totalCost;
        const totalValue = fundedInitiatives.reduce((sum: number, init: Initiative) => sum + init.estimatedValue, 0);
        const fundedCount = fundedInitiatives.length;

        const totalCapacity = fundedInitiatives.reduce((sum: number, init: Initiative) => {
            return sum + init.capacityDemands.reduce((s: number, cd: { units: number }) => s + cd.units, 0);
        }, 0);

        const capacityUtilization = (totalCapacity / scenario.portfolio.totalCapacity) * 100;

        const avgRisk = fundedInitiatives.length > 0
            ? fundedInitiatives.reduce((sum: number, init: Initiative) => sum + init.riskScore, 0) / fundedInitiatives.length
            : 0;

        // Get baseline metrics by querying all initiatives directly
        const allInitiativesForBaseline = await prisma.initiative.findMany({
            where: {
                portfolioId: scenario.portfolioId,
                isComplete: true
            },
            include: {
                capacityDemands: true
            }
        });

        const baselineTotalValue = allInitiativesForBaseline.reduce((sum: number, init: Initiative) => sum + init.estimatedValue, 0);
        const baselineTotalCost  = allInitiativesForBaseline.reduce((sum: number, init: Initiative) => sum + (init.capexCost || 0) + (init.opexCost || 0), 0);
        const baselineTotalCapacity = allInitiativesForBaseline.reduce((sum: number, init: Initiative) => {
            return sum + init.capacityDemands.reduce((s: number, cd: { units: number }) => s + cd.units, 0);
        }, 0);
        const baselineCapacityUtilization = baselineTotalCapacity / scenario.portfolio.totalCapacity;
        const baselineRiskExposure = allInitiativesForBaseline.length > 0
            ? allInitiativesForBaseline.reduce((sum: number, init: Initiative) => sum + init.riskScore, 0) / allInitiativesForBaseline.length
            : 0;

        const baseline = {
            totalValue: baselineTotalValue,
            totalCost: baselineTotalCost,
            initiativeCount: allInitiativesForBaseline.length,
            capacityUtilization: baselineCapacityUtilization,
            riskExposure: baselineRiskExposure
        };

        // Calculate deltas
        const valueDelta = baseline.totalValue > 0
            ? ((totalValue - baseline.totalValue) / baseline.totalValue) * 100
            : 0;

        const investmentDelta = baseline.totalCost > 0
            ? ((totalCost - baseline.totalCost) / baseline.totalCost) * 100
            : 0;

        const capacityDelta = baseline.capacityUtilization > 0
            ? ((capacityUtilization / 100 - baseline.capacityUtilization) / baseline.capacityUtilization) * 100
            : 0;

        // Calculate trade-offs
        const stoppedValue = stoppedInitiatives.reduce((sum: number, init: Initiative) => sum + init.estimatedValue, 0);

        const tradeOffSummary = {
            whatChanged: [
                `Stopped ${stoppedInitiatives.length} initiatives (freed ₹${(stoppedValue / 10000000).toFixed(0)} Cr)`,
                `Delayed ${pausedInitiatives.length} initiatives (protects capacity)`,
                `Shifted funding to high-value programs`
            ],
            whatGained: [
                valueDelta > 0 ? `+₹${(valueDelta * baseline.totalValue / 100 / 10000000).toFixed(0)} Cr incremental value` : 'Optimized portfolio value',
                avgRisk < baseline.riskExposure ? 'Lower delivery risk profile' : 'Managed risk exposure',
                capacityUtilization < 100 ? 'Improved capacity headroom' : 'Optimized capacity utilization'
            ]
        };

        // Risk level determination
        const getRiskLevel = (score: number) => {
            if (score <= 2) return 'Low';
            if (score <= 3.5) return 'Medium';
            return 'High';
        };

        const riskLevel = getRiskLevel(avgRisk);
        const baselineRiskLevel = getRiskLevel(baseline.riskExposure);

        // Real key risks from InitiativeRisk records on funded initiatives
        type InitRisk = { description: string; exposure: number; initiative?: { name: string } };
        const riskRecords: InitRisk[] = scenario.decisions
            .filter((d: { decision: string; initiative: { risks?: InitRisk[] } }) => d.decision === 'FUND' && d.initiative.risks?.length)
            .flatMap((d: { decision: string; initiative: { name: string; risks?: InitRisk[] } }) =>
                (d.initiative.risks || []).map((r: InitRisk) => ({ ...r, initiative: { name: d.initiative.name } }))
            )
            .sort((a: InitRisk, b: InitRisk) => b.exposure - a.exposure);

        const keyRisks = riskRecords.length > 0
            ? riskRecords.slice(0, 4).map((r: InitRisk) => `${r.initiative?.name ?? ''}: ${r.description} (exposure ${(r.exposure * 100).toFixed(0)}%)`)
            : [
                'Resource reallocation planned',
                'Vendor dependencies identified',
                'Capacity constraints monitored',
                'Timeline dependencies tracked'
            ];

        // Risk concentration: flag if top-2 initiatives hold >50% of total risk exposure
        const totalExposure = riskRecords.reduce((s: number, r: InitRisk) => s + r.exposure, 0);
        const top2Exposure  = riskRecords.slice(0, 2).reduce((s: number, r: InitRisk) => s + r.exposure, 0);
        const riskConcentrated = totalExposure > 0 && (top2Exposure / totalExposure) > 0.5;

        // Unfunded initiatives (PAUSE + STOP)
        const unfundedInitiatives = [...pausedInitiatives, ...stoppedInitiatives].map((init: Initiative) => ({
            ...init,
            decision: pausedInitiatives.includes(init) ? 'PAUSE' : 'STOP',
            capacityReleased: init.capacityDemands.reduce((s: number, cd: { units: number }) => s + cd.units, 0)
        }));

        // Generate decision ask statement
        const decisionAsk = `Approve ${scenario.name} — a ₹${(totalInvestment / 10000000).toFixed(0)} Cr funded portfolio delivering ₹${(totalValue / 10000000).toFixed(0)} Cr expected value with ${capacityUtilization < 95 ? 'controlled' : 'optimized'} capacity utilization (${capacityUtilization.toFixed(0)}%) and ${riskLevel.toLowerCase()} risk exposure.`;

        const executiveSummary = {
            portfolio: {
                name: scenario.portfolio.name,
                fiscalPeriod: scenario.portfolio.fiscalPeriod,
                totalBudget: scenario.portfolio.totalBudget,
                totalCapacity: scenario.portfolio.totalCapacity
            },
            scenario: {
                id: scenario.id,
                name: scenario.name,
                assumptions: scenario.assumptions,
                isFinalized: scenario.isFinalized,
                createdAt: scenario.createdAt,
                decisionOwner: 'Portfolio Lead',
                status: 'Recommended'
            },
            decisionAsk,
            metrics: {
                investment: totalInvestment,
                capex: totalCapex,
                opex: totalOpex,
                expectedValue: totalValue,
                capacityUse: capacityUtilization,
                riskExposure: riskLevel,
                fundedCount,
                pausedCount: pausedInitiatives.length,
                stoppedCount: stoppedInitiatives.length,
            },
            deltas: {
                investment: investmentDelta,
                value: valueDelta,
                capacity: capacityDelta,
                risk: avgRisk - baseline.riskExposure
            },
            baseline: {
                investment: baseline.totalCost,
                value: baseline.totalValue,
                capacityUse: baseline.capacityUtilization * 100,
                risk: baselineRiskLevel
            },
            executiveSnapshot: {
                portfolioValue: totalValue,
                totalCost: totalInvestment,
                totalCapex,
                totalOpex,
                capacityUtilization,
                riskLevel,
                riskConcentrated,
            },
            tradeOffSummary,
            decisions: {
                fund: fundedInitiatives,
                pause: pausedInitiatives,
                stop: stoppedInitiatives
            },
            unfundedInitiatives,
            keyRisks,
            riskConcentrated,
            scenarioComparison: {
                baseline: {
                    investment: baseline.totalCost,
                    value: baseline.totalValue,
                    capacityUsed: baseline.capacityUtilization * 100,
                    risk: baselineRiskLevel
                },
                current: {
                    investment: totalInvestment,
                    value: totalValue,
                    capacityUsed: capacityUtilization,
                    risk: riskLevel
                }
            }
        };

        return NextResponse.json({
            success: true,
            data: executiveSummary,
            errors: []
        });

    } catch (error) {
        console.error('Error generating executive summary:', error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                errors: [{
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to generate executive summary'
                }]
            },
            { status: 500 }
        );
    }
}
