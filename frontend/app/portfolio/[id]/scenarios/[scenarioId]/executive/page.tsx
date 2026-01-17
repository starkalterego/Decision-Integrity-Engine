'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExecutiveSummaryData {
    portfolio: {
        name: string;
        fiscalPeriod: string;
        totalBudget: number;
        totalCapacity: number;
    };
    scenario: {
        id: string;
        name: string;
        assumptions: string;
        isFinalized: boolean;
        createdAt: Date;
        decisionOwner: string;
        status: string;
    };
    decisionAsk: string;
    metrics: {
        investment: number;
        expectedValue: number;
        capacityUse: number;
        riskExposure: string;
        fundedCount: number;
    };
    deltas: {
        investment: number;
        value: number;
        capacity: number;
        risk: number;
    };
    baseline: {
        investment: number;
        value: number;
        capacityUse: number;
        risk: string;
    };
    executiveSnapshot: {
        portfolioValue: number;
        totalCost: number;
        capacityUtilization: number;
        riskLevel: string;
    };
    tradeOffSummary: {
        whatChanged: string[];
        whatGained: string[];
    };
    decisions: {
        fund: any[];
        pause: any[];
        stop: any[];
    };
    unfundedInitiatives: any[];
    keyRisks: string[];
    scenarioComparison: {
        baseline: any;
        current: any;
    };
}

export default function ExecutiveOnePagerPage({
    params
}: {
    params: Promise<{ id: string; scenarioId: string }>;
}) {
    const resolvedParams = React.use(params);
    const router = useRouter();
    const [data, setData] = useState<ExecutiveSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadExecutiveSummary();
    }, [resolvedParams.scenarioId]);

    const loadExecutiveSummary = async () => {
        try {
            const res = await fetch(`/api/scenarios/${resolvedParams.scenarioId}/executive-summary`);
            const result = await res.json();

            if (!result.success) {
                setError(result.errors[0]?.message || 'Failed to load executive summary');
                return;
            }

            setData(result.data);
        } catch (err) {
            console.error('Error loading executive summary:', err);
            setError('Failed to load executive summary');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return `₹${(value / 10000000).toFixed(0)} Cr`;
    };

    const formatDelta = (delta: number) => {
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta.toFixed(0)}%`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-neutral-600">Loading executive summary...</div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800 font-medium">{error || 'Failed to load data'}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 pb-4 border-b border-neutral-200">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Executive One-Pager</h1>
                        <p className="text-sm text-neutral-500 mt-1">Board-Ready Decision Artifact</p>
                    </div>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded hover:bg-blue-50">
                        Download PDF
                    </button>
                </div>

                {/* Portfolio Decision Artifact */}
                <div className="mb-8">
                    <div className="text-xs text-blue-600 font-semibold mb-2">PORTFOLIO DECISION ARTIFACT</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-lg font-bold text-neutral-900">{data.portfolio.name}</div>
                            <div className="text-sm text-neutral-600">{data.scenario.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-blue-600 font-semibold mb-1">DECISION OWNER</div>
                            <div className="text-sm font-medium text-neutral-900">{data.scenario.decisionOwner}</div>
                            <div className="text-xs text-neutral-500 mt-1">
                                {new Date(data.scenario.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="border-l-4 border-blue-600 pl-3">
                        <div className="text-xs text-neutral-600 mb-1">INVESTMENT</div>
                        <div className="text-2xl font-bold text-neutral-900">{formatCurrency(data.metrics.investment)}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {formatDelta(data.deltas.investment)} vs Baseline
                        </div>
                    </div>
                    <div className="border-l-4 border-blue-600 pl-3">
                        <div className="text-xs text-neutral-600 mb-1">EXPECTED VALUE</div>
                        <div className="text-2xl font-bold text-neutral-900">{formatCurrency(data.metrics.expectedValue)}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">
                            {formatDelta(data.deltas.value)} vs Baseline
                        </div>
                    </div>
                    <div className="border-l-4 border-blue-600 pl-3">
                        <div className="text-xs text-neutral-600 mb-1">CAPACITY USE</div>
                        <div className="text-2xl font-bold text-neutral-900">{data.metrics.capacityUse.toFixed(0)}%</div>
                        <div className="text-xs text-neutral-500 mt-1">
                            Optimal Tolerance {formatDelta(data.deltas.capacity)}
                        </div>
                    </div>
                    <div className="border-l-4 border-blue-600 pl-3">
                        <div className="text-xs text-neutral-600 mb-1">RISK EXPOSURE</div>
                        <div className="text-2xl font-bold text-neutral-900">{data.metrics.riskExposure}</div>
                        <div className="text-xs text-green-600 font-medium mt-1">
                            {data.deltas.risk < 0 ? 'Reduced' : 'Managed'} vs {data.baseline.risk}
                        </div>
                    </div>
                </div>

                {/* The Decision Ask */}
                <div className="bg-neutral-50 border border-neutral-200 rounded p-6 mb-8">
                    <div className="text-xs text-neutral-600 font-semibold mb-2">THE DECISION ASK</div>
                    <p className="text-lg text-neutral-900 leading-relaxed">{data.decisionAsk}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-green-600 font-semibold">{data.scenario.status}</div>
                        <div className="text-xs text-blue-600 font-semibold">Recommended</div>
                    </div>
                </div>

                {/* Executive Snapshot */}
                <div className="mb-8">
                    <div className="text-xs text-neutral-600 font-semibold mb-3">EXECUTIVE SNAPSHOT</div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-neutral-600">Portfolio Value</div>
                            <div className="font-bold text-neutral-900">{formatCurrency(data.executiveSnapshot.portfolioValue)}</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">Total Cost</div>
                            <div className="font-bold text-neutral-900">{formatCurrency(data.executiveSnapshot.totalCost)}</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">Capacity Utilization</div>
                            <div className="font-bold text-neutral-900">{data.executiveSnapshot.capacityUtilization.toFixed(0)}%</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">Risk Level</div>
                            <div className="font-bold text-neutral-900">{data.executiveSnapshot.riskLevel}</div>
                        </div>
                    </div>
                </div>

                {/* Trade-Off Summary */}
                <div className="mb-8">
                    <div className="text-xs text-neutral-600 font-semibold mb-3">TRADE-OFF SUMMARY</div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-neutral-600 font-semibold mb-2">WHAT CHANGED</div>
                            <ul className="space-y-1 text-sm text-neutral-700">
                                {data.tradeOffSummary.whatChanged.map((item, idx) => (
                                    <li key={idx}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-600 font-semibold mb-2">WHAT GAINED</div>
                            <ul className="space-y-1 text-sm text-neutral-700">
                                {data.tradeOffSummary.whatGained.map((item, idx) => (
                                    <li key={idx}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Scenario Comparison */}
                <div className="mb-8">
                    <div className="text-xs text-neutral-600 font-semibold mb-3">SCENARIO COMPARISON</div>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-300">
                                <th className="text-left py-2 font-semibold text-neutral-600">METRIC</th>
                                <th className="text-right py-2 font-semibold text-neutral-600">BASELINE</th>
                                <th className="text-right py-2 font-semibold text-blue-600 bg-blue-50">{data.scenario.name.split(' ')[0]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-neutral-200">
                                <td className="py-2 text-neutral-700">Investment</td>
                                <td className="text-right text-neutral-900">{formatCurrency(data.scenarioComparison.baseline.investment)}</td>
                                <td className="text-right font-bold text-neutral-900 bg-blue-50">{formatCurrency(data.scenarioComparison.current.investment)}</td>
                            </tr>
                            <tr className="border-b border-neutral-200">
                                <td className="py-2 text-neutral-700">Value</td>
                                <td className="text-right text-neutral-900">{formatCurrency(data.scenarioComparison.baseline.value)}</td>
                                <td className="text-right font-bold text-neutral-900 bg-blue-50">{formatCurrency(data.scenarioComparison.current.value)}</td>
                            </tr>
                            <tr className="border-b border-neutral-200">
                                <td className="py-2 text-neutral-700">Cap. Used</td>
                                <td className="text-right text-neutral-900">{data.scenarioComparison.baseline.capacityUsed.toFixed(0)}%</td>
                                <td className="text-right font-bold text-neutral-900 bg-blue-50">{data.scenarioComparison.current.capacityUsed.toFixed(0)}%</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-neutral-700">Risk</td>
                                <td className="text-right text-neutral-900">{data.scenarioComparison.baseline.risk}</td>
                                <td className="text-right font-bold text-neutral-900 bg-blue-50">{data.scenarioComparison.current.risk}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Key Risks */}
                <div className="mb-8">
                    <div className="text-xs text-neutral-600 font-semibold mb-3">KEY RISKS</div>
                    <ul className="space-y-1 text-sm text-neutral-700">
                        {data.keyRisks.map((risk, idx) => (
                            <li key={idx}>
                                <span className="text-neutral-500 mr-2">•</span>
                                {risk}
                                <span className="ml-2 text-xs text-neutral-500">
                                    {idx === 0 ? 'MEDIUM' : idx === 1 ? 'MEDIUM' : 'LOW'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What We Are Not Funding */}
                {data.unfundedInitiatives.length > 0 && (
                    <div className="mb-8">
                        <div className="text-xs text-neutral-600 font-semibold mb-3">WHAT WE ARE NOT FUNDING</div>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-300">
                                    <th className="text-left py-2 font-semibold text-neutral-600">INITIATIVE</th>
                                    <th className="text-right py-2 font-semibold text-neutral-600">INVESTMENT</th>
                                    <th className="text-right py-2 font-semibold text-neutral-600">CAPACITY RELEASED</th>
                                    <th className="text-center py-2 font-semibold text-neutral-600">DECISION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.unfundedInitiatives.slice(0, 5).map((init: any) => (
                                    <tr key={init.id} className="border-b border-neutral-200">
                                        <td className="py-2 text-neutral-700">{init.name}</td>
                                        <td className="text-right text-neutral-900">{formatCurrency(init.estimatedValue)}</td>
                                        <td className="text-right text-neutral-900">{init.capacityReleased} FTE</td>
                                        <td className="text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${init.decision === 'STOP'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {init.decision}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-4 border-t border-neutral-200 text-xs text-neutral-500 text-center">
                    <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    <p className="mt-1">Scenario ID: {data.scenario.id}</p>
                </div>
            </div>
        </div>
    );
}
