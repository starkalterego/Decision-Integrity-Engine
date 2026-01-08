'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Initiative {
    id: string;
    name: string;
    priority: number;
    value: number;
    capacity: number;
    risk: number;
    decision: 'FUND' | 'PAUSE' | 'STOP';
}

export default function ScenarioWorkspacePage() {
    const [scenarioName, setScenarioName] = useState('Scenario A: Aggressive Growth');
    const [assumptions, setAssumptions] = useState('Accelerated hiring in Q2, focus on high-value initiatives');
    const [isFinalized, setIsFinalized] = useState(false);

    const [initiatives, setInitiatives] = useState<Initiative[]>([
        { id: '1', name: 'CRM Modernization', priority: 92, value: 35000000, capacity: 50, risk: 3, decision: 'FUND' },
        { id: '2', name: 'Data Platform Upgrade', priority: 88, value: 50000000, capacity: 80, risk: 4, decision: 'FUND' },
        { id: '3', name: 'Mobile App Redesign', priority: 75, value: 25000000, capacity: 40, risk: 2, decision: 'PAUSE' },
        { id: '4', name: 'Legacy System Migration', priority: 65, value: 15000000, capacity: 60, risk: 5, decision: 'STOP' },
        { id: '5', name: 'Analytics Dashboard', priority: 58, value: 20000000, capacity: 35, risk: 2, decision: 'PAUSE' },
    ]);

    const fundedInitiatives = initiatives.filter(i => i.decision === 'FUND');
    const totalValue = fundedInitiatives.reduce((sum, i) => sum + i.value, 0);
    const totalCapacity = fundedInitiatives.reduce((sum, i) => sum + i.capacity, 0);
    const avgRisk = fundedInitiatives.length > 0
        ? fundedInitiatives.reduce((sum, i) => sum + i.risk, 0) / fundedInitiatives.length
        : 0;

    const capacityLimit = 450;
    const capacityUtilization = (totalCapacity / capacityLimit) * 100;
    const isOverCapacity = totalCapacity > capacityLimit;

    const handleDecisionChange = (id: string, decision: 'FUND' | 'PAUSE' | 'STOP') => {
        setInitiatives(prev =>
            prev.map(i => i.id === id ? { ...i, decision } : i)
        );
    };

    const handleFinalize = () => {
        if (isOverCapacity) {
            alert('Cannot finalize: Capacity exceeded. Please adjust initiative decisions.');
            return;
        }
        setIsFinalized(true);
        alert('Scenario finalized successfully. It is now immutable.');
    };

    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="scenarios" />

            <main className="page-container">
                <div className="section-header">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            disabled={isFinalized}
                            className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:border-b-2 focus:border-neutral-700 w-full"
                            style={{ maxWidth: '600px' }}
                        />
                        <p className="text-sm text-neutral-600 mt-1">Explore trade-offs under constraints</p>
                    </div>
                    {isFinalized ? (
                        <StatusBadge status="green" text="Finalized" />
                    ) : (
                        <StatusBadge status="red" text="Draft" />
                    )}
                </div>

                <div className="mb-6">
                    <Textarea
                        label="Scenario Assumptions (Mandatory)"
                        value={assumptions}
                        onChange={(e) => setAssumptions(e.target.value)}
                        disabled={isFinalized}
                        rows={2}
                        placeholder="Describe the key assumptions for this scenario..."
                    />
                </div>

                <div className="grid grid-cols-[1fr_380px] gap-6">
                    {/* Left Panel: Initiative Decision Table */}
                    <div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%' }}>Initiative</th>
                                        <th className="text-center" style={{ width: '10%' }}>Priority</th>
                                        <th className="text-right" style={{ width: '15%' }}>Value</th>
                                        <th className="text-center" style={{ width: '12%' }}>Capacity</th>
                                        <th className="text-center" style={{ width: '10%' }}>Risk</th>
                                        <th className="text-center" style={{ width: '23%' }}>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initiatives.map((initiative) => (
                                        <tr
                                            key={initiative.id}
                                            className={
                                                initiative.decision === 'FUND' ? 'bg-status-green-bg' :
                                                    initiative.decision === 'STOP' ? 'bg-status-red-bg' :
                                                        ''
                                            }
                                        >
                                            <td className="font-medium">{initiative.name}</td>
                                            <td className="font-mono text-center">
                                                <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-900 font-semibold" style={{ borderRadius: '2px' }}>
                                                    {initiative.priority}
                                                </span>
                                            </td>
                                            <td className="font-mono text-right">{formatCurrency(initiative.value)}</td>
                                            <td className="font-mono text-center">{initiative.capacity}</td>
                                            <td className="text-center">
                                                <span className={`inline-block px-2 py-1 font-semibold ${initiative.risk >= 4 ? 'bg-status-red text-white' : 'bg-neutral-200 text-neutral-900'
                                                    }`} style={{ borderRadius: '2px' }}>
                                                    {initiative.risk}/5
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <DecisionToggle
                                                    value={initiative.decision}
                                                    onChange={(decision) => handleDecisionChange(initiative.id, decision)}
                                                    disabled={isFinalized}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Stats Below Table */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="card text-center">
                                <div className="text-xs text-neutral-600 mb-1">Funded</div>
                                <div className="text-2xl font-bold text-status-green">{fundedInitiatives.length}</div>
                            </div>
                            <div className="card text-center">
                                <div className="text-xs text-neutral-600 mb-1">Paused</div>
                                <div className="text-2xl font-bold text-neutral-700">
                                    {initiatives.filter(i => i.decision === 'PAUSE').length}
                                </div>
                            </div>
                            <div className="card text-center">
                                <div className="text-xs text-neutral-600 mb-1">Stopped</div>
                                <div className="text-2xl font-bold text-status-red">
                                    {initiatives.filter(i => i.decision === 'STOP').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Live Metrics */}
                    <div className="space-y-4 sticky top-6 self-start">
                        <div className="card bg-neutral-900 text-white">
                            <h3 className="text-sm font-semibold mb-4">Live Metrics</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-neutral-400 mb-1">Total Funded Value</div>
                                    <div className="text-3xl font-bold font-mono">{formatCurrency(totalValue)}</div>
                                </div>

                                <div className="border-t border-neutral-700 pt-4">
                                    <div className="text-xs text-neutral-400 mb-1">Capacity Utilization</div>
                                    <div className="text-2xl font-bold font-mono mb-2">
                                        {totalCapacity}/{capacityLimit}
                                    </div>
                                    <div className="w-full bg-neutral-700 h-2" style={{ borderRadius: '2px' }}>
                                        <div
                                            className={`h-2 ${isOverCapacity ? 'bg-status-red' : 'bg-status-green'}`}
                                            style={{
                                                width: `${Math.min(capacityUtilization, 100)}%`,
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </div>
                                    <div className={`text-xs mt-1 ${isOverCapacity ? 'text-status-red' : 'text-status-green'}`}>
                                        {capacityUtilization.toFixed(1)}% {isOverCapacity ? '(Exceeded!)' : '(Within limits)'}
                                    </div>
                                </div>

                                <div className="border-t border-neutral-700 pt-4">
                                    <div className="text-xs text-neutral-400 mb-1">Average Risk</div>
                                    <div className="text-2xl font-bold font-mono">{avgRisk.toFixed(1)}/5</div>
                                    <div className={`text-xs mt-1 ${avgRisk >= 4 ? 'text-status-red' : 'text-status-green'}`}>
                                        {avgRisk >= 4 ? 'High risk exposure' : 'Acceptable risk'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="secondary"
                                className="w-full"
                                disabled={isFinalized}
                            >
                                Save Scenario
                            </Button>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleFinalize}
                                disabled={isOverCapacity || isFinalized || !assumptions.trim()}
                            >
                                {isFinalized ? 'Scenario Finalized' : 'Finalize Scenario'}
                            </Button>
                        </div>

                        {isOverCapacity && (
                            <div className="p-3 bg-status-red text-white text-xs font-semibold" style={{ borderRadius: '2px' }}>
                                ⚠ Cannot finalize: Capacity constraint breached
                            </div>
                        )}

                        {!assumptions.trim() && !isFinalized && (
                            <div className="p-3 bg-neutral-300 text-neutral-900 text-xs" style={{ borderRadius: '2px' }}>
                                ℹ Assumptions required before finalization
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function DecisionToggle({
    value,
    onChange,
    disabled
}: {
    value: 'FUND' | 'PAUSE' | 'STOP';
    onChange: (value: 'FUND' | 'PAUSE' | 'STOP') => void;
    disabled?: boolean;
}) {
    const options: ('FUND' | 'PAUSE' | 'STOP')[] = ['FUND', 'PAUSE', 'STOP'];

    return (
        <div className="inline-flex" style={{ borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--neutral-300)' }}>
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${value === option
                            ? option === 'FUND'
                                ? 'bg-status-green text-white'
                                : option === 'STOP'
                                    ? 'bg-status-red text-white'
                                    : 'bg-neutral-700 text-white'
                            : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
