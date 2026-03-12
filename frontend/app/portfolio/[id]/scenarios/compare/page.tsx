'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { authGet } from '@/lib/api';
import showToast from '@/lib/toast';

interface Portfolio {
    id: string;
    name: string;
    totalCapacity: number;
}

interface ScenarioMetrics {
    id: string;
    name: string;
    totalValue: number;
    totalCapacity: number;
    avgRisk: number;
    fundedCount: number;
    capacityUtilization: number;
    isRecommended: boolean;
}

export default function ScenarioComparePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [scenarios, setScenarios] = useState<ScenarioMetrics[]>([]);
    const [baseline, setBaseline] = useState<ScenarioMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load portfolio and scenarios in parallel
            const [portfolioRes, scenariosRes] = await Promise.all([
                authGet(`/api/portfolios/${resolvedParams.id}`),
                authGet(`/api/scenarios?portfolioId=${resolvedParams.id}`)
            ]);

            const [portfolioData, scenariosData] = await Promise.all([
                portfolioRes.json(),
                scenariosRes.json()
            ]);

            let portfolioObj = null;
            if (portfolioData.success) {
                setPortfolio(portfolioData.data);
                portfolioObj = portfolioData.data;
            }

            if (scenariosData.success) {
                // Calculate metrics for each scenario
                const scenariosWithMetrics = scenariosData.data.map((scenario: { id: string; name: string; isBaseline: boolean; isRecommended: boolean; decisions?: { decision: string; initiative?: { estimatedValue: number; riskScore: number; capacityDemands?: { units: number }[] } }[] }) => {
                    const fundedDecisions = scenario.decisions?.filter((d: { decision: string }) => d.decision === 'FUND') || [];

                    const totalValue = fundedDecisions.reduce((sum: number, d: { initiative?: { estimatedValue: number } }) =>
                        sum + (d.initiative?.estimatedValue || 0)
                    , 0);

                    const totalCapacity = fundedDecisions.reduce((sum: number, d: { initiative?: { capacityDemands?: { units: number }[] } }) => {
                        const initCapacity = d.initiative?.capacityDemands?.reduce((s: number, cd: { units: number }) => s + cd.units, 0) || 0;
                        return sum + initCapacity;
                    }, 0);

                    const avgRisk = fundedDecisions.length > 0
                        ? fundedDecisions.reduce((sum: number, d: { initiative?: { riskScore: number } }) => sum + (d.initiative?.riskScore || 0), 0) / fundedDecisions.length
                        : 0;

                    const capacityUtilization = portfolioObj?.totalCapacity
                        ? (totalCapacity / portfolioObj.totalCapacity) * 100
                        : 0;

                    return {
                        id: scenario.id,
                        name: scenario.name,
                        totalValue,
                        totalCapacity,
                        avgRisk,
                        fundedCount: fundedDecisions.length,
                        capacityUtilization,
                        isRecommended: scenario.isRecommended || false
                    };
                });

                // Find baseline (or create virtual baseline)
                const baselineScenario = scenariosWithMetrics.find((s: ScenarioMetrics) => s.name.toLowerCase().includes('baseline'));
                if (baselineScenario) {
                    setBaseline(baselineScenario);
                    setScenarios(scenariosWithMetrics);
                } else {
                    // Create virtual baseline from all initiatives
                    const baselineMetrics = await calculateBaselineMetrics(resolvedParams.id);
                    setBaseline(baselineMetrics);
                    setScenarios([baselineMetrics, ...scenariosWithMetrics]);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load comparison data');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateBaselineMetrics = async (portfolioId: string): Promise<ScenarioMetrics> => {
        try {
            const response = await authGet(`/api/portfolios/${portfolioId}/baseline`);
            const result = await response.json();

            if (result.success) {
                return {
                    id: 'baseline',
                    name: 'Baseline',
                    totalValue: result.data.totalValue,
                    totalCapacity: result.data.capacityUtilization * (portfolio?.totalCapacity || 450),
                    avgRisk: result.data.riskExposure,
                    fundedCount: result.data.initiativeCount,
                    capacityUtilization: result.data.capacityUtilization * 100,
                    isRecommended: false
                };
            }
        } catch (error) {
            console.error('Error calculating baseline:', error);
        }

        return {
            id: 'baseline',
            name: 'Baseline',
            totalValue: 0,
            totalCapacity: 0,
            avgRisk: 0,
            fundedCount: 0,
            capacityUtilization: 0,
            isRecommended: false
        };
    };

    const calculateDelta = (value: number, baselineValue: number) => {
        if (baselineValue === 0) return 0;
        return ((value - baselineValue) / baselineValue) * 100;
    };

    const formatDelta = (delta: number) => {
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta.toFixed(1)}%`;
    };

    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;

    const handleMarkRecommended = async (id: string) => {
        // In MVP, just update local state
        // In production, this would call an API to mark scenario as recommended
        setScenarios(prev =>
            prev.map(s => ({ ...s, isRecommended: s.id === id }))
        );
    };

    const recommendedScenario = scenarios.find(s => s.isRecommended);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-14 w-14 border-4 mx-auto mb-5"
                        style={{ 
                            borderColor: 'var(--border-subtle)',
                            borderTopColor: 'var(--accent-primary)'
                        }}
                    />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading comparison...</p>
                </div>
            </div>
        );
    }

    if (!baseline) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="compare" />
                <main className="page-container">
                    <div className="text-center py-20">
                        <p style={{ color: 'var(--text-secondary)' }}>No scenarios available for comparison.</p>
                        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Create scenarios first to compare them.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="compare" />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase mb-1"
                                style={{ color: 'var(--accent-primary)', letterSpacing: '0.14em' }}>
                                Scenario Analysis
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                Scenario Comparison
                            </h1>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Enable explicit selection of the best scenario
                            </p>
                        </div>
                        {recommendedScenario && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <circle cx="6" cy="6" r="5" stroke="var(--accent-success)" strokeWidth="1.4" />
                                    <path d="M3.5 6l2 2 3-3" stroke="var(--accent-success)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs font-semibold">Recommended: {recommendedScenario.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scenario Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {scenarios.map(scenario => (
                        <div
                            key={scenario.id}
                            className="rounded-xl p-5 transition-all"
                            style={{
                                backgroundColor: scenario.id === 'baseline' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                border: scenario.isRecommended ? '2px solid var(--accent-success)' : '1px solid var(--border-default)',
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm mb-0.5"
                                        style={{ color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {scenario.name}
                                    </h3>
                                    {scenario.id === 'baseline' && (
                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Reference</span>
                                    )}
                                    {scenario.id !== 'baseline' && scenario.fundedCount === 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                                            style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--accent-warning)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                            No decisions made
                                        </span>
                                    )}
                                </div>
                                {scenario.isRecommended && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5l2 2 4-4" stroke="var(--accent-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs font-semibold uppercase mb-1"
                                        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Portfolio Value</div>
                                    <div className="font-bold font-mono text-lg"
                                        style={{ color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {formatCurrency(scenario.totalValue)}
                                    </div>
                                    {scenario.id !== 'baseline' && baseline && (
                                        <div className="text-xs mt-0.5 font-medium"
                                            style={{ color: calculateDelta(scenario.totalValue, baseline.totalValue) > 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                                            {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    <div className="text-xs font-semibold uppercase mb-1"
                                        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Funded Initiatives</div>
                                    <div className="font-bold font-mono text-base"
                                        style={{ color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {scenario.fundedCount}
                                    </div>
                                </div>

                                <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    <div className="text-xs font-semibold uppercase mb-1"
                                        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Capacity</div>
                                    <div className="font-bold font-mono text-base"
                                        style={{ color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {scenario.totalCapacity} units
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        {scenario.capacityUtilization.toFixed(0)}% utilized
                                    </div>
                                </div>

                                <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    <div className="text-xs font-semibold uppercase mb-1"
                                        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Avg Risk</div>
                                    <div className="font-bold font-mono text-base"
                                        style={{ color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {scenario.avgRisk.toFixed(1)}/5
                                    </div>
                                </div>
                            </div>

                            {scenario.id !== 'baseline' && (
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    {scenario.fundedCount === 0 ? (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full text-sm"
                                            onClick={() => window.location.href = `/portfolio/${resolvedParams.id}/scenarios/${scenario.id}`}
                                        >
                                            Make Decisions →
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={scenario.isRecommended ? 'primary' : 'secondary'}
                                            size="sm"
                                            className="w-full text-sm"
                                            onClick={() => handleMarkRecommended(scenario.id)}
                                            disabled={scenario.isRecommended}
                                        >
                                            {scenario.isRecommended ? '✓ Recommended' : 'Mark as Recommended'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div
                    className="rounded-xl overflow-hidden mb-6"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Side-by-Side Metrics</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Deltas are relative to the baseline scenario</p>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)' }}>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase"
                                    style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Metric</th>
                                {scenarios.map(scenario => (
                                    <th key={scenario.id}
                                        className="px-4 py-3 text-center text-xs font-semibold uppercase"
                                        style={{
                                            color: 'var(--text-tertiary)',
                                            letterSpacing: '0.08em',
                                            backgroundColor: scenario.isRecommended ? 'rgba(16,185,129,0.06)' : 'transparent'
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span style={{ color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal', fontSize: '12px' }}>
                                                {scenario.name}
                                            </span>
                                            {scenario.isRecommended && (
                                                <span className="px-1.5 py-0.5 rounded text-xs font-semibold"
                                                    style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                                    Recommended
                                                </span>
                                            )}
                                            {scenario.id === 'baseline' && (
                                                <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                                    Baseline
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Portfolio Value</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className="px-4 py-3.5 font-mono text-center"
                                        style={{ backgroundColor: scenario.isRecommended ? 'rgba(16,185,129,0.04)' : scenario.id === 'baseline' ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {formatCurrency(scenario.totalValue)}
                                        </div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div className="text-xs mt-0.5 font-medium"
                                                style={{ color: calculateDelta(scenario.totalValue, baseline.totalValue) > 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                                                {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Funded Initiatives</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className="px-4 py-3.5 font-mono text-center"
                                        style={{ backgroundColor: scenario.isRecommended ? 'rgba(16,185,129,0.04)' : scenario.id === 'baseline' ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {scenario.fundedCount}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Capacity Utilization</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className="px-4 py-3.5 font-mono text-center"
                                        style={{ backgroundColor: scenario.isRecommended ? 'rgba(16,185,129,0.04)' : scenario.id === 'baseline' ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {scenario.totalCapacity} units
                                        </div>
                                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                            {scenario.capacityUtilization.toFixed(0)}%
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            <tr>
                                <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Avg Risk Score</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className="px-4 py-3.5 font-mono text-center"
                                        style={{ backgroundColor: scenario.isRecommended ? 'rgba(16,185,129,0.04)' : scenario.id === 'baseline' ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {scenario.avgRisk.toFixed(1)}/5
                                        </div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div className="text-xs mt-0.5 font-medium"
                                                style={{ color: calculateDelta(scenario.avgRisk, baseline.avgRisk) < 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                                                {formatDelta(calculateDelta(scenario.avgRisk, baseline.avgRisk))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Governance Rules & Next Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="var(--text-tertiary)" strokeWidth="1.2" />
                                    <path d="M4 6.5h5M4 9h3M4 4h5" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold uppercase"
                                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Governance Rules</p>
                        </div>
                        <ul className="space-y-2.5">
                            {[
                                'All metrics are system-calculated only',
                                'Only one scenario can be marked as recommended',
                                'Recommended scenario becomes read-only',
                                'Deltas are always relative to baseline',
                            ].map((rule) => (
                                <li key={rule} className="flex items-start gap-2.5">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 mt-0.5">
                                        <circle cx="6" cy="6" r="5" stroke="var(--accent-primary)" strokeWidth="1.3" opacity="0.5" />
                                        <path d="M3.5 6l2 2 3-3" stroke="var(--accent-primary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                                    </svg>
                                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl p-5"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <path d="M6.5 1L8 5h4l-3.5 2.5 1.5 4L6.5 9 3 11.5l1.5-4L1 5h4L6.5 1Z" stroke="var(--accent-success)" strokeWidth="1.2" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold uppercase"
                                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Next Steps</p>
                        </div>
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Once you&apos;ve selected a recommended scenario, proceed to generate the Executive One-Pager for final approval.
                        </p>
                        <Button
                            variant="primary"
                            className="w-full text-sm"
                            onClick={() => window.location.href = `/portfolio/${resolvedParams.id}/output`}
                        >
                            Generate Executive Output →
                        </Button>
                        {!recommendedScenario && (
                            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
                                Mark a scenario as recommended first
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
