'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

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
                fetch(`/api/portfolios/${resolvedParams.id}`),
                fetch(`/api/scenarios?portfolioId=${resolvedParams.id}`)
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
            alert('Failed to load comparison data');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateBaselineMetrics = async (portfolioId: string): Promise<ScenarioMetrics> => {
        try {
            const response = await fetch(`/api/portfolios/${portfolioId}/baseline`);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading comparison...</p>
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
                {/* Enhanced Page Header & Context */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Scenario Comparison</h1>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Enable explicit selection of the best scenario</p>
                        </div>
                        {recommendedScenario && (
                            <div className="px-3 py-1.5 rounded-md font-semibold text-sm" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                ✓ Recommended: {recommendedScenario.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Scenario Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {scenarios.map(scenario => (
                        <div
                            key={scenario.id}
                            className="rounded-lg p-5 transition-all"
                            style={{
                                backgroundColor: scenario.id === 'baseline'
                                    ? 'var(--bg-tertiary)'
                                    : 'var(--bg-secondary)',
                                border: scenario.isRecommended
                                    ? '2px solid var(--accent-success)'
                                    : '1px solid var(--border-default)'
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 
                                        className="font-semibold text-base mb-0.5"
                                        style={{
                                            color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {scenario.name}
                                    </h3>
                                    {scenario.id === 'baseline' && (
                                        <span 
                                            className="text-xs"
                                            style={{ color: 'var(--text-tertiary)' }}
                                        >
                                            Reference
                                        </span>
                                    )}
                                </div>
                                {scenario.isRecommended && (
                                    <span 
                                        className="px-2 py-1 text-xs font-semibold rounded-md"
                                        style={{ 
                                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                            color: 'var(--accent-success)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        ✓
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Portfolio Value</div>
                                    <div 
                                        className="font-bold font-mono text-lg"
                                        style={{
                                            color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {formatCurrency(scenario.totalValue)}
                                    </div>
                                    {scenario.id !== 'baseline' && baseline && (
                                        <div className={`text-xs mt-1 ${calculateDelta(scenario.totalValue, baseline.totalValue) > 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Funded Initiatives</div>
                                    <div 
                                        className="font-bold font-mono text-base"
                                        style={{
                                            color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {scenario.fundedCount}
                                    </div>
                                </div>

                                <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Capacity</div>
                                    <div 
                                        className="font-bold font-mono text-base"
                                        style={{
                                            color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {scenario.totalCapacity} units
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                        {scenario.capacityUtilization.toFixed(0)}% utilized
                                    </div>
                                </div>

                                <div className="border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Avg Risk</div>
                                    <div 
                                        className="font-bold font-mono text-base"
                                        style={{
                                            color: scenario.id === 'baseline' ? 'var(--text-secondary)' : 'var(--text-primary)'
                                        }}
                                    >
                                        {scenario.avgRisk.toFixed(1)}/5
                                    </div>
                                </div>
                            </div>

                            {scenario.id !== 'baseline' && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <Button
                                        variant={scenario.isRecommended ? 'primary' : 'secondary'}
                                        size="sm"
                                        className="w-full text-sm"
                                        onClick={() => handleMarkRecommended(scenario.id)}
                                        disabled={scenario.isRecommended}
                                    >
                                        {scenario.isRecommended ? '✓ Recommended' : 'Mark as Recommended'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Enhanced Comparison Table */}
                <div 
                    className="rounded-lg overflow-hidden mb-6"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <table className="w-full">
                        <thead>
                            <tr 
                                style={{ 
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderBottom: '1px solid var(--border-default)'
                                }}
                            >
                                <th 
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    Metric
                                </th>
                                {scenarios.map(scenario => (
                                    <th 
                                        key={scenario.id} 
                                        className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide"
                                        style={{
                                            color: 'var(--text-tertiary)',
                                            backgroundColor: scenario.id === 'baseline' 
                                                ? 'var(--bg-elevated)' 
                                                : scenario.isRecommended 
                                                    ? 'rgba(16, 185, 129, 0.08)' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span style={{ color: 'var(--text-primary)' }}>{scenario.name}</span>
                                            {scenario.isRecommended && (
                                                <span 
                                                    className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                                                    style={{
                                                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                        color: 'var(--accent-success)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                                    }}
                                                >
                                                    Recommended
                                                </span>
                                            )}
                                            {scenario.id === 'baseline' && (
                                                <span 
                                                    className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                                    style={{
                                                        backgroundColor: 'var(--bg-elevated)',
                                                        color: 'var(--text-tertiary)',
                                                        border: '1px solid var(--border-default)'
                                                    }}
                                                >
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
                                <td 
                                    className="px-4 py-3 font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Portfolio Value
                                </td>
                                {scenarios.map(scenario => (
                                    <td 
                                        key={scenario.id} 
                                        className="px-4 py-4 font-mono text-center"
                                        style={{
                                            backgroundColor: scenario.id === 'baseline' 
                                                ? 'var(--bg-tertiary)' 
                                                : scenario.isRecommended 
                                                    ? 'rgba(16, 185, 129, 0.05)' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div 
                                            className="text-base font-bold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {formatCurrency(scenario.totalValue)}
                                        </div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div 
                                                className="text-xs mt-1"
                                                style={{
                                                    color: calculateDelta(scenario.totalValue, baseline.totalValue) > 0 
                                                        ? 'var(--accent-success)' 
                                                        : 'var(--accent-error)'
                                                }}
                                            >
                                                {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td 
                                    className="px-4 py-4 font-semibold"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Funded Initiatives
                                </td>
                                {scenarios.map(scenario => (
                                    <td 
                                        key={scenario.id} 
                                        className="px-4 py-4 font-mono text-center"
                                        style={{
                                            backgroundColor: scenario.id === 'baseline' 
                                                ? 'var(--bg-tertiary)' 
                                                : scenario.isRecommended 
                                                    ? 'rgba(16, 185, 129, 0.05)' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div 
                                            className="text-base font-bold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {scenario.fundedCount}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td 
                                    className="px-4 py-3 font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Capacity Utilization
                                </td>
                                {scenarios.map(scenario => (
                                    <td 
                                        key={scenario.id} 
                                        className="px-4 py-3 font-mono text-center"
                                        style={{
                                            backgroundColor: scenario.id === 'baseline' 
                                                ? 'var(--bg-elevated)' 
                                                : scenario.isRecommended 
                                                    ? 'rgba(16, 185, 129, 0.05)' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {scenario.totalCapacity} units
                                        </div>
                                        <div 
                                            className="text-xs mt-0.5"
                                            style={{ color: 'var(--text-tertiary)' }}
                                        >
                                            {scenario.capacityUtilization.toFixed(0)}%
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            <tr className="last:border-0">
                                <td 
                                    className="px-4 py-3 font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Avg Risk Score
                                </td>
                                {scenarios.map(scenario => (
                                    <td 
                                        key={scenario.id} 
                                        className="px-4 py-3 font-mono text-center"
                                        style={{
                                            backgroundColor: scenario.id === 'baseline' 
                                                ? 'var(--bg-elevated)' 
                                                : scenario.isRecommended 
                                                    ? 'rgba(16, 185, 129, 0.05)' 
                                                    : 'transparent'
                                        }}
                                    >
                                        <div 
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {scenario.avgRisk.toFixed(1)}/5
                                        </div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div 
                                                className="text-xs mt-0.5"
                                                style={{
                                                    color: calculateDelta(scenario.avgRisk, baseline.avgRisk) < 0 
                                                        ? 'var(--accent-success)' 
                                                        : 'var(--accent-error)'
                                                }}
                                            >
                                                {formatDelta(calculateDelta(scenario.avgRisk, baseline.avgRisk))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Governance Rules & Next Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        className="rounded-lg p-5"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)'
                        }}
                    >
                        <h3 
                            className="font-semibold mb-3 text-sm uppercase tracking-wide"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Governance Rules
                        </h3>
                        <ul className="text-sm space-y-2 leading-relaxed">
                            <li 
                                className="flex gap-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                                <span>All metrics are system-calculated only</span>
                            </li>
                            <li 
                                className="flex gap-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                                <span>Only one scenario can be marked as recommended</span>
                            </li>
                            <li 
                                className="flex gap-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                                <span>Recommended scenario becomes read-only</span>
                            </li>
                            <li 
                                className="flex gap-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                                <span>Deltas are always relative to baseline</span>
                            </li>
                        </ul>
                    </div>

                    <div 
                        className="rounded-lg p-5"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderLeft: '3px solid var(--accent-success)'
                        }}
                    >
                        <h3 
                            className="font-semibold mb-3 text-sm uppercase tracking-wide"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Next Steps
                        </h3>
                        <p 
                            className="text-sm mb-3 leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                        >
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
                            <p 
                                className="text-xs mt-2 text-center"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                Mark a scenario as recommended first
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
