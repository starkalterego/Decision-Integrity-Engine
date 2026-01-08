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
    ]);

    // Calculate live metrics
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
                    <div>
                        <input
                            type="text"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            disabled={isFinalized}
                            className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:border-b-2 focus:border-neutral-700"
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

                <div className="grid grid-cols-[1fr_350px] gap-6">
                    {/* Left Panel: Initiative Decision Table */}
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Initiative</th>
                                    <th>Priority</th>
                                    <th>Value</th>
                                    <th>Capacity</th>
                                    <th>Risk</th>
                                    <th>Decision</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initiatives.map((initiative) => (
                                    <tr key={initiative.id}>
                                        <td className="font-medium">{initiative.name}</td>
                                        <td className="font-mono">{initiative.priority}</td>
                                        <td className="font-mono">{formatCurrency(initiative.value)}</td>
                                        <td className="font-mono">{initiative.capacity}</td>
                                        <td className="font-mono">{initiative.risk}/5</td>
                                        <td>
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

                    {/* Right Panel: Live Metrics */}
                    <div className="space-y-4 sticky top-6 self-start">
                        <MetricCard
                            label="Total Funded Value"
                            value={formatCurrency(totalValue)}
                            status="neutral"
                        />

                        <MetricCard
                            label="Capacity Utilization"
                            value={`${totalCapacity}/${capacityLimit}`}
                            status={isOverCapacity ? 'red' : 'green'}
                            statusText={isOverCapacity ? 'Capacity exceeded' : 'Within limits'}
                        />

                        <MetricCard
                            label="Average Risk"
                            value={avgRisk.toFixed(1)}
                            status={avgRisk >= 4 ? 'red' : 'green'}
                            statusText={avgRisk >= 4 ? 'High risk exposure' : 'Acceptable risk'}
                        />

                        <MetricCard
                            label="Funded Initiatives"
                            value={fundedInitiatives.length}
                            status="neutral"
                        />

                        <div className="divider"></div>

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
                                Finalize Scenario
                            </Button>
                        </div>

                        {isOverCapacity && (
                            <div className="p-3 bg-status-red-bg border border-status-red-border text-xs text-status-red">
                                <strong>Cannot finalize:</strong> Capacity constraint breached
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
        <div className="inline-flex" style={{ borderRadius: '2px', overflow: 'hidden' }}>
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    disabled={disabled}
                    className={`px-3 py-1 text-xs font-medium border transition-colors ${value === option
                            ? option === 'FUND'
                                ? 'bg-status-green text-white border-status-green'
                                : option === 'STOP'
                                    ? 'bg-status-red text-white border-status-red'
                                    : 'bg-neutral-700 text-white border-neutral-700'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
