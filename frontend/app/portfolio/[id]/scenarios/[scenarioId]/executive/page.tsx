'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authGet } from '@/lib/api';

interface Initiative {
    id: string;
    name: string;
    sponsor: string;
    estimatedValue: number;
    riskScore: number;
    strategicAlignmentScore: number;
    capacityReleased?: number;
    decision?: string;
}

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
        fund: Initiative[];
        pause: Initiative[];
        stop: Initiative[];
    };
    unfundedInitiatives: Initiative[];
    keyRisks: string[];
    scenarioComparison: {
        baseline: {
            portfolioValue: number;
            fundedCount: number;
            capacityUsed: number;
            avgRisk: number;
            investment: number;
            value: number;
            risk: string;
        };
        current: {
            portfolioValue: number;
            fundedCount: number;
            capacityUsed: number;
            avgRisk: number;
            investment: number;
            value: number;
            risk: string;
        };
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

    // Memoize expensive formatting functions
    const formatCurrency = useCallback((value: number) => {
        return `₹${(value / 10000000).toFixed(0)} Cr`;
    }, []);

    const formatDelta = useCallback((value: number, isPercentage = false) => {
        const sign = value >= 0 ? '+' : '';
        return isPercentage 
            ? `${sign}${value.toFixed(1)}%`
            : `${sign}${formatCurrency(value)}`;
    }, [formatCurrency]);

    // Add caching to the API call
    useEffect(() => {
        const cacheKey = `executive-summary-${resolvedParams.scenarioId}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            // Use cache if less than 2 minutes old
            if (Date.now() - timestamp < 120000) {
                setData(cachedData);
                setIsLoading(false);
                return;
            }
        }

        loadExecutiveSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.scenarioId]);

    const loadExecutiveSummary = async () => {
        try {
            const res = await authGet(`/api/scenarios/${resolvedParams.scenarioId}/executive-summary`);
            const result = await res.json();

            if (!result.success) {
                setError(result.errors[0]?.message || 'Failed to load executive summary');
                return;
            }

            setData(result.data);
            
            // Cache the result
            const cacheKey = `executive-summary-${resolvedParams.scenarioId}`;
            sessionStorage.setItem(cacheKey, JSON.stringify({
                data: result.data,
                timestamp: Date.now()
            }));
        } catch (err) {
            console.error('Error loading executive summary:', err);
            setError('Failed to load executive summary');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading executive summary...</div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Executive One-Pager</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Board-Ready Decision Artifact</p>
                    </div>
                    <button className="px-4 py-2 border text-sm font-medium rounded transition-colors hover:bg-white/5"
                        style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                        Download PDF
                    </button>
                </div>

                {/* Portfolio Decision Artifact */}
                <div className="mb-8">
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>PORTFOLIO DECISION ARTIFACT</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{data.portfolio.name}</div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.scenario.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>DECISION OWNER</div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{data.scenario.decisionOwner}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
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
                    <div className="pl-3" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>INVESTMENT</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.metrics.investment)}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {formatDelta(data.deltas.investment)} vs Baseline
                        </div>
                    </div>
                    <div className="pl-3" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>EXPECTED VALUE</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.metrics.expectedValue)}</div>
                        <div className="text-xs font-medium mt-1" style={{ color: 'var(--accent-success)' }}>
                            {formatDelta(data.deltas.value)} vs Baseline
                        </div>
                    </div>
                    <div className="pl-3" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>CAPACITY USE</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.metrics.capacityUse.toFixed(0)}%</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            Optimal Tolerance {formatDelta(data.deltas.capacity)}
                        </div>
                    </div>
                    <div className="pl-3" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>RISK EXPOSURE</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.metrics.riskExposure}</div>
                        <div className="text-xs font-medium mt-1" style={{ color: 'var(--accent-success)' }}>
                            {data.deltas.risk < 0 ? 'Reduced' : 'Managed'} vs {data.baseline.risk}
                        </div>
                    </div>
                </div>

                {/* The Decision Ask */}
                <div className="rounded p-6 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>THE DECISION ASK</div>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>{data.decisionAsk}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm font-semibold" style={{ color: 'var(--accent-success)' }}>{data.scenario.status}</div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>Recommended</div>
                    </div>
                </div>

                {/* Executive Snapshot */}
                <div className="mb-8">
                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>EXECUTIVE SNAPSHOT</div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Portfolio Value</div>
                            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.executiveSnapshot.portfolioValue)}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Total Cost</div>
                            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.executiveSnapshot.totalCost)}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Capacity Utilization</div>
                            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.executiveSnapshot.capacityUtilization.toFixed(0)}%</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)' }}>Risk Level</div>
                            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.executiveSnapshot.riskLevel}</div>
                        </div>
                    </div>
                </div>

                {/* Trade-Off Summary */}
                <div className="mb-8">
                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>TRADE-OFF SUMMARY</div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-info)' }}>WHAT CHANGED</div>
                            <ul className="space-y-1 text-sm">
                                {data.tradeOffSummary.whatChanged.map((item, idx) => (
                                    <li key={idx} style={{ color: 'var(--text-secondary)' }}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-success)' }}>WHAT GAINED</div>
                            <ul className="space-y-1 text-sm">
                                {data.tradeOffSummary.whatGained.map((item, idx) => (
                                    <li key={idx} style={{ color: 'var(--text-secondary)' }}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Scenario Comparison */}
                <div className="mb-8">
                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>SCENARIO COMPARISON</div>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>METRIC</th>
                                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>BASELINE</th>
                                <th className="text-right py-2 font-semibold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)' }}>{data.scenario.name.split(' ')[0]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>Investment</td>
                                <td className="text-right" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.scenarioComparison.baseline.investment)}</td>
                                <td className="text-right font-bold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', color: 'var(--text-primary)' }}>{formatCurrency(data.scenarioComparison.current.investment)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>Value</td>
                                <td className="text-right" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.scenarioComparison.baseline.value)}</td>
                                <td className="text-right font-bold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', color: 'var(--text-primary)' }}>{formatCurrency(data.scenarioComparison.current.value)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>Cap. Used</td>
                                <td className="text-right" style={{ color: 'var(--text-primary)' }}>{data.scenarioComparison.baseline.capacityUsed.toFixed(0)}%</td>
                                <td className="text-right font-bold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', color: 'var(--text-primary)' }}>{data.scenarioComparison.current.capacityUsed.toFixed(0)}%</td>
                            </tr>
                            <tr>
                                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>Risk</td>
                                <td className="text-right" style={{ color: 'var(--text-primary)' }}>{data.scenarioComparison.baseline.risk}</td>
                                <td className="text-right font-bold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', color: 'var(--text-primary)' }}>{data.scenarioComparison.current.risk}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Key Risks */}
                <div className="mb-8">
                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>KEY RISKS</div>
                    <ul className="space-y-1 text-sm">
                        {data.keyRisks.map((risk, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                                <span className="mr-2" style={{ color: 'var(--text-tertiary)' }}>•</span>
                                {risk}
                                <span className="ml-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    {idx === 0 ? 'MEDIUM' : idx === 1 ? 'MEDIUM' : 'LOW'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* What We Are Not Funding */}
                {data.unfundedInitiatives.length > 0 && (
                    <div className="mb-8">
                        <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>WHAT WE ARE NOT FUNDING</div>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>INITIATIVE</th>
                                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>INVESTMENT</th>
                                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>CAPACITY RELEASED</th>
                                    <th className="text-center py-2 font-semibold" style={{ color: 'var(--text-tertiary)' }}>DECISION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.unfundedInitiatives.slice(0, 5).map((init: Initiative) => (
                                    <tr key={init.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{init.name}</td>
                                        <td className="text-right" style={{ color: 'var(--text-primary)' }}>{formatCurrency(init.estimatedValue)}</td>
                                        <td className="text-right" style={{ color: 'var(--text-primary)' }}>{init.capacityReleased} FTE</td>
                                        <td className="text-center">
                                            <span className="px-2 py-1 rounded text-xs font-medium"
                                                style={{ 
                                                    backgroundColor: init.decision === 'STOP' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                    color: init.decision === 'STOP' ? 'var(--accent-error)' : 'var(--accent-warning)'
                                                }}>
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
                <div className="mt-12 pt-4 text-xs text-center" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                    <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    <p className="mt-1">Scenario ID: {data.scenario.id}</p>
                </div>
            </div>
        </div>
    );
}
