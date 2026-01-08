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
                <div className="section-header">
                    <div>
                        <h1 className="text-2xl font-semibold">Scenario Comparison</h1>
                        <p className="text-sm text-neutral-600 mt-1">Enable explicit selection of the best scenario</p>
                    </div>
                    {recommendedScenario && (
                        <div className="px-4 py-2 bg-status-green text-white font-semibold text-sm" style={{ borderRadius: '2px' }}>
                            Recommended: {recommendedScenario.name}
                        </div>
                    )}
                </div>

                {/* Visual Comparison Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {scenarios.map(scenario => (
                        <div
                            key={scenario.id}
                            className={`card ${scenario.id === 'baseline'
                                    ? 'border-2 border-neutral-400 bg-neutral-100'
                                    : scenario.isRecommended
                                        ? 'border-2 border-status-green bg-status-green-bg'
                                        : 'border border-neutral-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-sm">{scenario.name}</h3>
                                    {scenario.id === 'baseline' && (
                                        <span className="text-xs text-neutral-600">Reference</span>
                                    )}
                                </div>
                                {scenario.isRecommended && (
                                    <span className="px-2 py-1 bg-status-green text-white text-xs font-semibold" style={{ borderRadius: '2px' }}>
                                        ✓ REC
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-neutral-600">Portfolio Value</div>
                                    <div className="text-2xl font-bold font-mono">{formatCurrency(scenario.value)}</div>
                                    {scenario.id !== 'baseline' && (
                                        <div className={`text-xs font-semibold ${calculateDelta(scenario.value, baseline.value) > 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.value, baseline.value))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-2">
                                    <div className="text-xs text-neutral-600">Total Cost</div>
                                    <div className="text-lg font-bold font-mono">{formatCurrency(scenario.cost)}</div>
                                    {scenario.id !== 'baseline' && (
                                        <div className={`text-xs font-semibold ${calculateDelta(scenario.cost, baseline.cost) < 0 ? 'text-status-green' : 'text-status-red'
                                            }`}>
                                            {formatDelta(calculateDelta(scenario.cost, baseline.cost))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-200 pt-2">
                                    <div className="text-xs text-neutral-600">Capacity</div>
                                    <div className="text-lg font-bold font-mono">{scenario.capacity} units</div>
                                </div>

                                <div className="border-t border-neutral-200 pt-2">
                                    <div className="text-xs text-neutral-600">Risk</div>
                                    <div className="text-lg font-bold font-mono">{scenario.risk.toFixed(1)}/10</div>
                                </div>
                            </div>

                            {scenario.id !== 'baseline' && (
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <Button
                                        variant={scenario.isRecommended ? 'primary' : 'secondary'}
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleMarkRecommended(scenario.id)}
                                    >
                                        {scenario.isRecommended ? '✓ Recommended' : 'Mark as Recommended'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Detailed Comparison Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                {scenarios.map(scenario => (
                                    <th key={scenario.id} className={`text-center ${scenario.id === 'baseline' ? 'bg-neutral-200' : ''}`}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{scenario.name}</span>
                                            {scenario.isRecommended && (
                                                <span className="text-xs bg-status-green text-white px-2 py-0.5" style={{ borderRadius: '2px' }}>
                                                    Recommended
                                                </span>
                                            )}
                                            {scenario.id === 'baseline' && (
                                                <span className="text-xs bg-neutral-400 text-white px-2 py-0.5" style={{ borderRadius: '2px' }}>
                                                    Baseline
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-semibold">Portfolio Value</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div className="text-base font-bold">{formatCurrency(scenario.value)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-sm mt-1 font-semibold ${calculateDelta(scenario.value, baseline.value) > 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.value, baseline.value))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr>
                                <td className="font-semibold">Total Cost</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div className="text-base font-bold">{formatCurrency(scenario.cost)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-sm mt-1 font-semibold ${calculateDelta(scenario.cost, baseline.cost) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.cost, baseline.cost))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr>
                                <td className="font-semibold">Capacity Utilization</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div className="text-base font-bold">{scenario.capacity} units</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-sm mt-1 font-semibold ${calculateDelta(scenario.capacity, baseline.capacity) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.capacity, baseline.capacity))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr>
                                <td className="font-semibold">Risk Exposure</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={`font-mono text-center ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div className="text-base font-bold">{scenario.risk.toFixed(1)}/10</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-sm mt-1 font-semibold ${calculateDelta(scenario.risk, baseline.risk) < 0 ? 'text-status-green' : 'text-status-red'
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

                <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="card bg-neutral-100">
                        <h3 className="font-semibold mb-3 text-sm">Governance Rules</h3>
                        <ul className="text-xs text-neutral-700 space-y-2">
                            <li className="flex gap-2">
                                <span className="text-neutral-500">•</span>
                                <span>All metrics are system-calculated only</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-500">•</span>
                                <span>Only one scenario can be marked as recommended</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-500">•</span>
                                <span>Recommended scenario becomes read-only</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-neutral-500">•</span>
                                <span>Deltas are always relative to baseline</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card border-l-4 border-l-status-green">
                        <h3 className="font-semibold mb-3 text-sm">Next Steps</h3>
                        <p className="text-sm text-neutral-700 mb-3">
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
