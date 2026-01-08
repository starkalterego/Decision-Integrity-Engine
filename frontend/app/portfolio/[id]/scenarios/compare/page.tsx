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

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="compare" />

            <main className="page-container">
                <div className="section-header">
                    <div>
                        <h1 className="text-2xl font-semibold">Scenario Comparison</h1>
                        <p className="text-sm text-neutral-600 mt-1">Enable explicit selection of the best scenario</p>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                {scenarios.map(scenario => (
                                    <th key={scenario.id} className={scenario.id === 'baseline' ? 'bg-neutral-200' : ''}>
                                        <div className="flex items-center gap-2">
                                            {scenario.name}
                                            {scenario.isRecommended && (
                                                <span className="text-xs bg-status-green text-white px-2 py-0.5" style={{ borderRadius: '2px' }}>
                                                    Recommended
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
                                    <td key={scenario.id} className={`font-mono ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div>{formatCurrency(scenario.value)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.value, baseline.value) > 0 ? 'text-status-green' : 'text-status-red'
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
                                    <td key={scenario.id} className={`font-mono ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div>{formatCurrency(scenario.cost)}</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.cost, baseline.cost) < 0 ? 'text-status-green' : 'text-status-red'
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
                                    <td key={scenario.id} className={`font-mono ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div>{scenario.capacity} units</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.capacity, baseline.capacity) < 0 ? 'text-status-green' : 'text-status-red'
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
                                    <td key={scenario.id} className={`font-mono ${scenario.id === 'baseline' ? 'bg-neutral-100' : ''}`}>
                                        <div>{scenario.risk.toFixed(1)}/10</div>
                                        {scenario.id !== 'baseline' && (
                                            <div className={`text-xs mt-1 ${calculateDelta(scenario.risk, baseline.risk) < 0 ? 'text-status-green' : 'text-status-red'
                                                }`}>
                                                {formatDelta(calculateDelta(scenario.risk, baseline.risk))}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            <tr className="border-t-2 border-neutral-300">
                                <td className="font-semibold">Recommendation</td>
                                {scenarios.map(scenario => (
                                    <td key={scenario.id} className={scenario.id === 'baseline' ? 'bg-neutral-100' : ''}>
                                        {scenario.id !== 'baseline' && (
                                            <Button
                                                variant={scenario.isRecommended ? 'primary' : 'secondary'}
                                                size="sm"
                                                onClick={() => handleMarkRecommended(scenario.id)}
                                            >
                                                {scenario.isRecommended ? 'Recommended' : 'Mark as Recommended'}
                                            </Button>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 p-4 bg-white border border-neutral-200" style={{ borderRadius: '2px' }}>
                    <h3 className="font-semibold mb-2 text-sm">Governance Rules</h3>
                    <ul className="text-sm text-neutral-700 space-y-1">
                        <li>• All metrics are system-calculated only</li>
                        <li>• Only one scenario can be marked as recommended</li>
                        <li>• Recommended scenario becomes read-only</li>
                        <li>• Deltas are always relative to baseline</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
