'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

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
    const [portfolio, setPortfolio] = useState<any>(null);
    const [scenarios, setScenarios] = useState<ScenarioMetrics[]>([]);
    const [baseline, setBaseline] = useState<ScenarioMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
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
                const scenariosWithMetrics = scenariosData.data.map((scenario: any) => {
                    const fundedDecisions = scenario.decisions?.filter((d: any) => d.decision === 'FUND') || [];

                    const totalValue = fundedDecisions.reduce((sum: number, d: any) =>
                        sum + (d.initiative?.estimatedValue || 0), 0
                    );

                    const totalCapacity = fundedDecisions.reduce((sum: number, d: any) => {
                        const initCapacity = d.initiative?.capacityDemands?.reduce((s: number, cd: any) => s + cd.units, 0) || 0;
                        return sum + initCapacity;
                    }, 0);

                    const avgRisk = fundedDecisions.length > 0
                        ? fundedDecisions.reduce((sum: number, d: any) => sum + (d.initiative?.riskScore || 0), 0) / fundedDecisions.length
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
                const baselineScenario = scenariosWithMetrics.find((s: any) => s.name.toLowerCase().includes('baseline'));
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
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading comparison...</p>
                </div>
            </div>
        );
    }

    if (!baseline) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="compare" />
                <main className="page-container">
                    <div className="text-center py-20">
                        <p className="text-neutral-600">No scenarios available for comparison.</p>
                        <p className="text-sm text-neutral-500 mt-2">Create scenarios first to compare them.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="compare" />

            <main className="page-container">
                {/* Enhanced Page Header & Context */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Scenario Comparison</h1>
                            <p className="text-sm text-neutral-500 mt-2">Enable explicit selection of the best scenario</p>
                        </div>
                        {recommendedScenario && (
                            <div className="px-4 py-2 bg-status-green text-white font-semibold text-sm rounded">
                                Recommended: {recommendedScenario.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Scenario Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    {scenarios.map(scenario => (
                        <div
                            key={scenario.id}
                            className={`card p-6 ${scenario.id === 'baseline'
                                ? 'bg-neutral-100/50 border border-neutral-300'
                                : scenario.isRecommended
                                    ? 'bg-status-green-bg/20 border-2 border-status-green'
                                    : 'border border-neutral-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className={`font-semibold ${scenario.id === 'baseline' ? 'text-sm text-neutral-600' : 'text-base text-neutral-900'}`}>
                                        {scenario.name}
                                    </h3>
                                    {scenario.id === 'baseline' && (
                                        <span className="text-xs text-neutral-500 italic">Reference</span>
                                    )}
                                </div>
                                {scenario.isRecommended && (
                                    <span className="px-2.5 py-1 bg-status-green text-white text-xs font-semibold rounded">
                                        ✓ Recommended
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Portfolio Value</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-xl text-neutral-600' : 'text-2xl text-neutral-900'}`}>
                                        {formatCurrency(scenario.totalValue)}
                                    </div>
                                    {scenario.id !== 'baseline' && baseline && (
                                        <div className={`text-xs mt-1 ${calculateDelta(scenario.totalValue, baseline.totalValue) > 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Funded Initiatives</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {scenario.fundedCount}
                                    </div>
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Capacity</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {scenario.totalCapacity} units
                                    </div>
                                    <div className="text-xs mt-1 text-neutral-600">
                                        {scenario.capacityUtilization.toFixed(0)}% utilized
                                    </div>
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Avg Risk</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {scenario.avgRisk.toFixed(1)}/5
                                    </div>
                                </div>
                            </div>

                            {scenario.id !== 'baseline' && (
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <Button
                                        variant={scenario.isRecommended ? 'primary' : 'secondary'}
                                        size="sm"
                                        className="w-full"
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
                <div className="bg-white border border-neutral-200 rounded overflow-hidden mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Metric</th>
                                {scenarios.map(scenario => (
                                    <th key={scenario.id} className={`px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider ${scenario.id === 'baseline' ? 'bg-neutral-100' : scenario.isRecommended ? 'bg-status-green-bg/10' : ''}`}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{scenario.name}</span>
                                            {scenario.isRecommended && (
                                                <span className="text-xs bg-status-green text-white px-2 py-0.5 rounded font-semibold">
                                                    Recommended
                                                </span>
                                            )}
                                            {scenario.id === 'baseline' && (
                                                <span className="text-xs bg-neutral-400 text-white px-2 py-0.5 rounded font-semibold">
                                                    Baseline
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-neutral-100">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Portfolio Value</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{formatCurrency(scenario.totalValue)}</div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.totalValue, baseline.totalValue) > 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.totalValue, baseline.totalValue))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr className="border-b border-neutral-100">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Funded Initiatives</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{scenario.fundedCount}</div>
                                    </td>
                                ))}
                            </tr>

                            <tr className="border-b border-neutral-100">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Capacity Utilization</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{scenario.totalCapacity} units</div>
                                        <div className="text-xs mt-1 text-neutral-600">{scenario.capacityUtilization.toFixed(0)}%</div>
                                    </td>
                                ))}
                            </tr>

                            <tr className="last:border-0">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Avg Risk Score</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{scenario.avgRisk.toFixed(1)}/5</div>
                                        {scenario.id !== 'baseline' && baseline && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.avgRisk, baseline.avgRisk) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
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
                <div className="grid grid-cols-2 gap-8">
                    <div className="card bg-neutral-50 p-6">
                        <h3 className="font-semibold mb-4 text-sm text-neutral-900 uppercase tracking-wide">Governance Rules</h3>
                        <ul className="text-sm text-neutral-700 space-y-3 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-neutral-400">•</span>
                                <span>All metrics are system-calculated only</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-400">•</span>
                                <span>Only one scenario can be marked as recommended</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-400">•</span>
                                <span>Recommended scenario becomes read-only</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-400">•</span>
                                <span>Deltas are always relative to baseline</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card border-l-4 border-l-status-green p-6">
                        <h3 className="font-semibold mb-4 text-sm text-neutral-900 uppercase tracking-wide">Next Steps</h3>
                        <p className="text-sm text-neutral-700 mb-4 leading-relaxed">
                            Once you've selected a recommended scenario, proceed to generate the Executive One-Pager for final approval.
                        </p>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => window.location.href = `/portfolio/${resolvedParams.id}/output`}
                        >
                            Generate Executive Output →
                        </Button>
                        {!recommendedScenario && (
                            <p className="text-xs text-neutral-500 mt-2 text-center">Mark a scenario as recommended first</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
