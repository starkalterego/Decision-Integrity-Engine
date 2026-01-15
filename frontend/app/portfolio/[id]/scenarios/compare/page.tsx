'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

interface ScenarioMetrics {
    id: string;
    name: string;
    value: number;
    cost: number;
    capacity: number;
    risk: number;
    isRecommended: boolean;
}

export default function ScenarioComparePage() {
    const [scenarios, setScenarios] = useState<ScenarioMetrics[]>([
        {
            id: 'baseline',
            name: 'Baseline',
            value: 185000000,
            cost: 120000000,
            capacity: 450,
            risk: 7.5,
            isRecommended: false,
        },
        {
            id: 'scenario-a',
            name: 'Scenario A: Aggressive',
            value: 210000000,
            cost: 130000000,
            capacity: 430,
            risk: 6.8,
            isRecommended: true,
        },
        {
            id: 'scenario-b',
            name: 'Scenario B: Conservative',
            value: 160000000,
            cost: 100000000,
            capacity: 380,
            risk: 5.2,
            isRecommended: false,
        },
    ]);

    const baseline = scenarios.find(s => s.id === 'baseline')!;

    const calculateDelta = (value: number, baselineValue: number) => {
        const delta = ((value - baselineValue) / baselineValue) * 100;
        return delta;
    };

    const formatDelta = (delta: number) => {
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta.toFixed(1)}%`;
    };

    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;

    const handleMarkRecommended = (id: string) => {
        setScenarios(prev =>
            prev.map(s => ({ ...s, isRecommended: s.id === id }))
        );
    };

    const recommendedScenario = scenarios.find(s => s.isRecommended);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="compare" />

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
                                        {formatCurrency(scenario.value)}
                                    </div>
                                    {scenario.id !== 'baseline' && (
                                        <div className={`text-xs mt-1 ${calculateDelta(scenario.value, baseline.value) > 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.value, baseline.value))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Total Cost</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {formatCurrency(scenario.cost)}
                                    </div>
                                    {scenario.id !== 'baseline' && (
                                        <div className={`text-xs mt-1 ${calculateDelta(scenario.cost, baseline.cost) < 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.cost, baseline.cost))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Capacity</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {scenario.capacity} units
                                    </div>
                                </div>

                                <div className="border-t border-neutral-200 pt-3">
                                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">Risk</div>
                                    <div className={`font-bold font-mono ${scenario.id === 'baseline' ? 'text-base text-neutral-600' : 'text-lg text-neutral-900'}`}>
                                        {scenario.risk.toFixed(1)}/10
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
                                        <div className="text-base font-bold text-neutral-900">{formatCurrency(scenario.value)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.value, baseline.value) > 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.value, baseline.value))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr className="border-b border-neutral-100">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Total Cost</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{formatCurrency(scenario.cost)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.cost, baseline.cost) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.cost, baseline.cost))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr className="border-b border-neutral-100">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Capacity Utilization</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{scenario.capacity} units</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.capacity, baseline.capacity) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.capacity, baseline.capacity))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr className="last:border-0">
                                <td className="px-4 py-4 font-semibold text-neutral-900">Risk Exposure</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`px-4 py-4 font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-50' : scenario.isRecommended ? 'bg-status-green-bg/5' : ''}`}>
                                        <div className="text-base font-bold text-neutral-900">{scenario.risk.toFixed(1)}/10</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.risk, baseline.risk) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.risk, baseline.risk))}
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
                        <Button variant="primary" className="w-full">
                            Generate Executive Output →
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
