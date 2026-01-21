'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Initiative {
    id: string;
    name: string;
    priorityScore: number;
    estimatedValue: number;
    riskScore: number;
    capacityDemands: Array<{ role: string; units: number }>;
}

interface ScenarioDecision {
    initiativeId: string;
    decision: 'FUND' | 'PAUSE' | 'STOP';
}

export default function ScenarioWorkspacePage({ params }: { params: Promise<{ id: string; scenarioId: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const [scenario, setScenario] = useState<any>(null);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [decisions, setDecisions] = useState<Record<string, 'FUND' | 'PAUSE' | 'STOP'>>({});
    const [assumptions, setAssumptions] = useState('');
    const [isFinalized, setIsFinalized] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, [resolvedParams.id, resolvedParams.scenarioId]);

    // Debounced save function
    const debouncedSave = useCallback(async (decisionsToSave: Record<string, 'FUND' | 'PAUSE' | 'STOP'>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const decisionsArray = Object.entries(decisionsToSave).map(([id, dec]) => ({
                    initiativeId: id,
                    decision: dec
                }));

                await fetch(`/api/scenarios/${resolvedParams.scenarioId}/decisions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decisions: decisionsArray }),
                });
            } catch (error) {
                console.error('Error saving decisions:', error);
            }
        }, 500); // Save after 500ms of inactivity
    }, [resolvedParams.scenarioId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load all data in parallel for faster loading
            const [portfolioRes, scenarioRes, initiativesRes] = await Promise.all([
                fetch(`/api/portfolios/${resolvedParams.id}`),
                fetch(`/api/scenarios/${resolvedParams.scenarioId}`),
                fetch(`/api/initiatives?portfolioId=${resolvedParams.id}`)
            ]);

            const [portfolioData, scenarioData, initiativesData] = await Promise.all([
                portfolioRes.json(),
                scenarioRes.json(),
                initiativesRes.json()
            ]);

            let decisionsMap: Record<string, 'FUND' | 'PAUSE' | 'STOP'> = {};

            if (portfolioData.success) {
                setPortfolio(portfolioData.data);
            }

            if (scenarioData.success) {
                setScenario(scenarioData.data);
                setAssumptions(scenarioData.data.assumptions || '');
                setIsFinalized(scenarioData.data.isFinalized);

                // Set existing decisions
                scenarioData.data.decisions?.forEach((d: any) => {
                    decisionsMap[d.initiativeId] = d.decision;
                });
                setDecisions(decisionsMap);
            }

            if (initiativesData.success) {
                // Only show complete initiatives
                const completeInitiatives = initiativesData.data.filter((i: any) => i.isComplete);
                setInitiatives(completeInitiatives);

                // Initialize decisions for initiatives without decisions
                const newDecisions = { ...decisionsMap };
                completeInitiatives.forEach((init: Initiative) => {
                    if (!newDecisions[init.id]) {
                        newDecisions[init.id] = 'PAUSE'; // Default decision
                    }
                });
                setDecisions(newDecisions);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load scenario data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecisionChange = async (initiativeId: string, decision: 'FUND' | 'PAUSE' | 'STOP') => {
        if (isFinalized) return;

        // Update local state immediately
        const updatedDecisions = { ...decisions, [initiativeId]: decision };
        setDecisions(updatedDecisions);

        // Debounced save to backend
        debouncedSave(updatedDecisions);
    };

    const handleAssumptionsChange = async (value: string) => {
        if (!isFinalized) {
            setAssumptions(value);

            // Auto-save assumptions after typing stops
            if (saveAssumptionsTimeout) {
                clearTimeout(saveAssumptionsTimeout);
            }

            const timeout = setTimeout(async () => {
                try {
                    await fetch(`/api/scenarios/${resolvedParams.scenarioId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assumptions: value }),
                    });
                } catch (error) {
                    console.error('Error saving assumptions:', error);
                }
            }, 1000); // Save 1 second after user stops typing

            setSaveAssumptionsTimeout(timeout);
        }
    };

    const [saveAssumptionsTimeout, setSaveAssumptionsTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleFinalize = async () => {
        // Validation per decision-logic.md lines 150-156
        if (!assumptions || assumptions.trim() === '') {
            alert('Cannot finalize: Scenario assumptions are mandatory per governance rules. Please document the premise of this scenario.');
            return;
        }

        // Validation per BACKEND.md lines 134-137: Capacity enforcement
        if (isOverCapacity) {
            alert(`Cannot finalize: Capacity constraint breached. Total capacity demand (${totalCapacity}) exceeds limit (${portfolio.totalCapacity}). Please adjust initiative decisions.`);
            return;
        }

        try {
            const response = await fetch(`/api/scenarios/${resolvedParams.scenarioId}/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (result.success) {
                setIsFinalized(true);
                alert('Scenario finalized successfully. It is now immutable and ready for comparison.');
            } else {
                alert('Failed to finalize: ' + (result.errors[0]?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error finalizing scenario:', error);
            alert('Failed to finalize scenario');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateScenario = async (scenarioData: { name: string; assumptions: string }) => {
        try {
            const response = await fetch('/api/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolioId: resolvedParams.id,
                    ...scenarioData
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Scenario "${scenarioData.name}" created successfully!`);
                router.push(`/portfolio/${resolvedParams.id}/scenarios/${result.data.id}`);
            } else {
                alert('Failed to create scenario: ' + (result.errors[0]?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating scenario:', error);
            alert('Failed to create scenario');
        }
    };

    // Calculate metrics
    const fundedInitiatives = initiatives.filter(i => decisions[i.id] === 'FUND');
    const totalValue = fundedInitiatives.reduce((sum, i) => sum + i.estimatedValue, 0);
    const totalCapacity = fundedInitiatives.reduce((sum, i) => {
        return sum + i.capacityDemands.reduce((s, cd) => s + cd.units, 0);
    }, 0);
    const avgRisk = fundedInitiatives.length > 0
        ? fundedInitiatives.reduce((sum, i) => sum + i.riskScore, 0) / fundedInitiatives.length
        : 0;

    const capacityLimit = portfolio?.totalCapacity || 450;
    const capacityUtilization = (totalCapacity / capacityLimit) * 100;
    const isOverCapacity = totalCapacity > capacityLimit;

    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading scenario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="scenarios" />

            <main className="page-container">
                {/* Enhanced Page Header */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={scenario?.name || ''}
                                disabled={true}
                                className="text-3xl font-bold tracking-tight bg-transparent border-none focus:outline-none w-full"
                                style={{ maxWidth: '700px', color: 'var(--text-primary)' }}
                            />
                            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Explore trade-offs under constraints</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                                className="bg-neutral-900 hover:bg-neutral-800"
                            >
                                + New Scenario
                            </Button>
                            {isFinalized ? (
                                <StatusBadge status="green" text="Finalized" />
                            ) : (
                                <StatusBadge status="red" text="Draft" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Scenario Assumptions - MANDATORY */}
                <div 
                    className="mb-8 border-l-4 p-6 rounded"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderLeftColor: 'var(--accent-warning)',
                        border: '1px solid var(--accent-warning)'
                    }}
                >
                    <label className="block text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Scenario Assumptions <span className="text-red-600">*</span>
                    </label>
                    <Textarea
                        value={assumptions}
                        onChange={(e) => handleAssumptionsChange(e.target.value)}
                        disabled={isFinalized}
                        rows={3}
                        placeholder="Document the premise and constraints of this scenario (mandatory per governance rules)"
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-red-600 font-semibold">*</span> Mandatory field. All scenarios must declare assumptions before finalization.
                    </p>
                </div>

                {/* Enhanced Real-Time Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <MetricCard
                        label="Total Value"
                        value={formatCurrency(totalValue)}
                    />
                    <MetricCard
                        label="Funded Initiatives"
                        value={fundedInitiatives.length.toString()}
                    />
                    <MetricCard
                        label="Capacity Utilization"
                        value={`${capacityUtilization.toFixed(0)}%`}
                        status={isOverCapacity ? 'red' : capacityUtilization > 90 ? 'neutral' : 'green'}
                    />
                    <MetricCard
                        label="Avg Risk Score"
                        value={avgRisk.toFixed(1)}
                    />
                </div>

                {/* Capacity Breach Warning */}
                {isOverCapacity && (
                    <div className="mb-8 p-6 bg-status-red-bg border-l-4 border-l-status-red rounded">
                        <div className="flex items-start gap-4">
                            {/* Symbol removed for clean UI */}
                            <div>
                                <h3 className="text-sm font-bold text-status-red uppercase tracking-wide mb-2">Capacity Constraint Breached</h3>
                                <p className="text-sm text-neutral-700 leading-relaxed">
                                    Total capacity demand ({totalCapacity} units) exceeds portfolio limit ({capacityLimit} units).
                                    Scenario cannot be finalized until capacity is within limits.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Initiatives Table */}
                <div 
                    className="card overflow-hidden mb-8"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <div 
                        className="px-6 py-4"
                        style={{ 
                            borderBottom: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-tertiary)'
                        }}
                    >
                        <h2 
                            className="text-lg font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Initiative Decisions
                        </h2>
                        <p 
                            className="text-sm mt-1"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Fund, pause, or stop each initiative
                        </p>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-default)' }}>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Initiative</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Priority</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Value</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Capacity</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Risk</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>Decision</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initiatives.map((initiative) => {
                                const totalCap = initiative.capacityDemands.reduce((s, cd) => s + cd.units, 0);
                                return (
                                    <tr key={initiative.id} 
                                        className="transition-colors hover:bg-white/5"
                                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                    >
                                        <td className="px-4 py-4">
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{initiative.name}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{initiative.priorityScore?.toFixed(2) || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(initiative.estimatedValue)}</td>
                                        <td className="px-4 py-4 text-center font-mono" style={{ color: 'var(--text-secondary)' }}>{totalCap}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-block px-2.5 py-1 text-xs font-semibold" 
                                               style={{ 
                                                   borderRadius: '4px',
                                                   backgroundColor: initiative.riskScore >= 4 ? 'rgba(239, 68, 68, 0.2)' : 
                                                                    initiative.riskScore >= 3 ? 'rgba(245, 158, 11, 0.2)' : 
                                                                    'rgba(16, 185, 129, 0.2)',
                                                   color: initiative.riskScore >= 4 ? 'var(--accent-error)' : 
                                                          initiative.riskScore >= 3 ? 'var(--accent-warning)' : 
                                                          'var(--accent-success)',
                                                   border: initiative.riskScore >= 4 ? '1px solid rgba(239, 68, 68, 0.3)' : 
                                                           initiative.riskScore >= 3 ? '1px solid rgba(245, 158, 11, 0.3)' : 
                                                           '1px solid rgba(16, 185, 129, 0.3)'
                                               }}>
                                                {initiative.riskScore}/5
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <DecisionToggle
                                                value={decisions[initiative.id] || 'PAUSE'}
                                                onChange={(decision) => handleDecisionChange(initiative.id, decision)}
                                                disabled={isFinalized}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => router.push(`/portfolio/${resolvedParams.id}/scenarios/compare`)}
                        >
                            Compare Scenarios
                        </Button>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleFinalize}
                        disabled={isFinalized || !assumptions.trim() || isOverCapacity || isSaving}
                        className="bg-accent-primary hover:bg-accent-primary-hover border-accent-primary"
                        style={{ 
                            backgroundColor: 'var(--accent-warning)', 
                            borderColor: 'var(--accent-warning)', 
                            color: '#1a1a1a' 
                        }}
                    >
                        {isSaving ? 'Finalizing...' : 'Finalize Scenario'}
                    </Button>

                    {!assumptions.trim() && !isFinalized && (
                        <div 
                            className="p-4 text-sm rounded border"
                            style={{ 
                                backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                                color: 'var(--accent-warning)',
                                borderColor: 'rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            Assumptions required before finalization
                        </div>
                    )}
                </div>
            </main>

            {/* Create Scenario Modal */}
            {showCreateModal && (
                <CreateScenarioModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreateScenario}
                />
            )}
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
        <div className="inline-flex rounded-md overflow-hidden border border-[var(--border-default)]">
            {options.map((option, index) => {
                const isSelected = value === option;
                let bg = 'var(--bg-tertiary)';
                let color = 'var(--text-secondary)';
                
                if (isSelected) {
                    if (option === 'FUND') { bg = 'var(--accent-success)'; color = '#000000'; }
                    else if (option === 'STOP') { bg = 'var(--accent-error)'; color = '#ffffff'; }
                    else { bg = 'var(--bg-elevated)'; color = 'var(--text-primary)'; }
                }

                return (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        disabled={disabled}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                        style={{
                            backgroundColor: bg,
                            color: color,
                            borderLeft: index > 0 ? '1px solid var(--border-subtle)' : 'none'
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}

// Create Scenario Modal Component
function CreateScenarioModal({
    onClose,
    onSave
}: {
    onClose: () => void;
    onSave: (scenario: { name: string; assumptions: string }) => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        assumptions: ''
    });
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    React.useEffect(() => {
        let container = document.getElementById('modal-portal');
        if (!container) {
            container = document.createElement('div');
            container.id = 'modal-portal';
            document.body.appendChild(container);
        }
        setPortalContainer(container);
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
            if (container && container.childNodes.length === 0) {
                container.remove();
            }
        };
    }, []);

    const isValid = formData.name.trim() !== '' && formData.assumptions.trim() !== '';

    const handleSave = () => {
        if (isValid) {
            onSave(formData);
            onClose();
        }
    };

    if (!portalContainer) return null;

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                position: 'fixed',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}
        >
            <div 
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-lg" 
                style={{ 
                    position: 'relative', 
                    zIndex: 10000, 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)'
                }}
            >
                <div 
                    className="px-8 py-6"
                    style={{ 
                        borderBottom: '1px solid var(--border-default)',
                        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)'
                    }}
                >
                    <h2 
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Create New Scenario
                    </h2>
                    <p 
                        className="text-sm mt-2"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Define assumptions to explore alternative portfolio decisions
                    </p>
                </div>

                <div className="px-8 py-8 space-y-6">
                    <Input
                        id="scenario-name"
                        label="Scenario Name *"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Aggressive Growth, Conservative Approach"
                        helperText="Descriptive name for this scenario"
                    />

                    <div>
                        <label className="block text-sm font-bold mb-2 text-neutral-900">
                            Assumptions <span className="text-red-600">*</span>
                        </label>
                        <Textarea
                            value={formData.assumptions}
                            onChange={(e) => setFormData(prev => ({ ...prev, assumptions: e.target.value }))}
                            placeholder="e.g., Accelerated hiring in Q2, regulatory approval by March, focus on high-value initiatives"
                            rows={4}
                        />
                        <p className="text-xs text-neutral-600 mt-2">
                            <span className="text-red-600 font-semibold">*</span> Mandatory: Document the premise and constraints of this scenario per governance rules
                        </p>
                    </div>
                </div>

                <div className="border-t border-neutral-200 px-8 py-6 flex justify-between items-center bg-linear-to-r from-neutral-50 to-white">
                    <p className="text-sm text-neutral-600">
                        <span className="text-red-600 font-semibold">*</span> All fields are mandatory
                    </p>
                    <div className="flex gap-3">
                        <Button variant="text" onClick={onClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={!isValid}
                            className="bg-neutral-900 hover:bg-neutral-800"
                        >
                            Create Scenario
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        portalContainer
    );
}
