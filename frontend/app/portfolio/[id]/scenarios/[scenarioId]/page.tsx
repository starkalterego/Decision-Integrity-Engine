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
                {/* Enhanced Page Header & Context */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={scenarioName}
                                onChange={(e) => setScenarioName(e.target.value)}
                                disabled={isFinalized}
                                className="text-3xl font-bold text-neutral-900 tracking-tight bg-transparent border-none focus:outline-none focus:border-b-2 focus:border-neutral-700 w-full"
                                style={{ maxWidth: '700px' }}
                            />
                            <p className="text-sm text-neutral-500 mt-2">Explore trade-offs under constraints</p>
                        </div>
                        {isFinalized ? (
                            <StatusBadge status="green" text="Finalized" />
                        ) : (
                            <StatusBadge status="red" text="Draft" />
                        )}
                    </div>
                </div>

                {/* Enhanced Scenario Assumptions */}
                <div className="mb-8 bg-neutral-50 border border-neutral-200 p-6 rounded">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Scenario Assumptions <span className="text-status-red">*</span>
                    </label>
                    <Textarea
                        value={assumptions}
                        onChange={(e) => setAssumptions(e.target.value)}
                        disabled={isFinalized}
                        rows={2}
                        placeholder="Describe the key assumptions for this scenario..."
                    />
                    <p className="text-xs text-neutral-500 mt-2 italic">
                        All decisions below are evaluated under these assumptions.
                    </p>
                </div>

                <div className="grid grid-cols-[1fr_380px] gap-8">
                    {/* Left Panel: Initiative Decision Table */}
                    <div>
                        {/* Enhanced Initiative Table */}
                        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '30%' }}>Initiative</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '10%' }}>Priority</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '15%' }}>Value</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '12%' }}>Capacity</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '10%' }}>Risk</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '23%' }}>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initiatives.map((initiative) => (
                                        <tr
                                            key={initiative.id}
                                            className={`border-b border-neutral-100 last:border-0 transition-colors ${initiative.decision === 'FUND' ? 'bg-status-green-bg/20' :
                                                    initiative.decision === 'STOP' ? 'bg-status-red-bg/20' :
                                                        'hover:bg-neutral-50'
                                                }`}
                                        >
                                            <td className="px-4 py-4 font-medium text-neutral-900">{initiative.name}</td>
                                            <td className="px-4 py-4 font-mono text-center">
                                                <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-700 font-semibold text-sm" style={{ borderRadius: '2px' }}>
                                                    {initiative.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-mono text-right font-semibold text-neutral-900">{formatCurrency(initiative.value)}</td>
                                            <td className="px-4 py-4 font-mono text-center text-neutral-700">{initiative.capacity}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold ${initiative.risk >= 4 ? 'bg-status-red text-white' : 'bg-neutral-200 text-neutral-700'
                                                    }`} style={{ borderRadius: '2px' }}>
                                                    {initiative.risk}/5
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
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

                        {/* Enhanced Funded/Paused/Stopped Summary */}
                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="card p-6 text-center">
                                <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">Funded</div>
                                <div className="text-2xl font-bold text-status-green">{fundedInitiatives.length}</div>
                            </div>
                            <div className="card p-6 text-center">
                                <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">Paused</div>
                                <div className="text-2xl font-bold text-neutral-700">
                                    {initiatives.filter(i => i.decision === 'PAUSE').length}
                                </div>
                            </div>
                            <div className="card p-6 text-center">
                                <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">Stopped</div>
                                <div className="text-2xl font-bold text-status-red">
                                    {initiatives.filter(i => i.decision === 'STOP').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Right Panel: Outcome Summary */}
                    <div className="space-y-6 sticky top-6 self-start">
                        <div className="card bg-neutral-900 text-white p-6 border-2 border-neutral-800">
                            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wide">Outcome Summary</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">Total Funded Value</div>
                                    <div className="text-3xl font-bold font-mono">{formatCurrency(totalValue)}</div>
                                </div>

                                <div className="border-t border-neutral-700 pt-6">
                                    <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">Capacity Utilization</div>
                                    <div className="text-2xl font-bold font-mono mb-3">
                                        {totalCapacity}/{capacityLimit}
                                    </div>
                                    <div className="w-full bg-neutral-700 h-2.5 rounded-sm">
                                        <div
                                            className={`h-2.5 rounded-sm transition-all ${isOverCapacity ? 'bg-status-red' : 'bg-status-green'}`}
                                            style={{
                                                width: `${Math.min(capacityUtilization, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <div className={`text-xs mt-2 font-medium ${isOverCapacity ? 'text-status-red' : 'text-status-green'}`}>
                                        {capacityUtilization.toFixed(1)}% {isOverCapacity ? '(Exceeded!)' : '(Within limits)'}
                                    </div>
                                </div>

                                <div className="border-t border-neutral-700 pt-6">
                                    <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">Average Risk</div>
                                    <div className="text-2xl font-bold font-mono">{avgRisk.toFixed(1)}/5</div>
                                    <div className={`text-xs mt-2 font-medium ${avgRisk >= 4 ? 'text-status-red' : 'text-status-green'}`}>
                                        {avgRisk >= 4 ? 'High risk exposure' : 'Acceptable risk'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Primary Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full"
                                disabled={isFinalized}
                            >
                                Save Scenario
                            </Button>
                            <div>
                                <Button
                                    variant="primary"
                                    className="w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                                    onClick={handleFinalize}
                                    disabled={isOverCapacity || isFinalized || !assumptions.trim()}
                                >
                                    {isFinalized ? 'Scenario Finalized' : 'Finalize Scenario'}
                                </Button>
                                {!isFinalized && !isOverCapacity && assumptions.trim() && (
                                    <p className="text-xs text-neutral-500 mt-2 text-center">
                                        Once finalized, this scenario becomes immutable.
                                    </p>
                                )}
                            </div>
                        </div>

                        {isOverCapacity && (
                            <div className="p-4 bg-status-red text-white text-sm font-semibold rounded">
                                ⚠ Cannot finalize: Capacity constraint breached
                            </div>
                        )}

                        {!assumptions.trim() && !isFinalized && (
                            <div className="p-4 bg-neutral-200 text-neutral-700 text-sm rounded">
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
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
