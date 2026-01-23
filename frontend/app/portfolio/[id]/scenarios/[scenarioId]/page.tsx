'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authGet, authPost, authPatch } from '@/lib/api';

interface Initiative {
    id: string;
    name: string;
    priorityScore: number;
    estimatedValue: number;
    riskScore: number;
    capacityDemands: Array<{ role: string; units: number }>;
}

interface Scenario {
    id: string;
    name: string;
    assumptions: string;
    isFinalized: boolean;
    decisions?: Array<{
        initiativeId: string;
        decision: 'FUND' | 'PAUSE' | 'STOP';
    }>;
}

interface Portfolio {
    id: string;
    name: string;
    totalCapacity: number;
}

export default function ScenarioWorkspacePage({ params }: { params: Promise<{ id: string; scenarioId: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [decisions, setDecisions] = useState<Record<string, 'FUND' | 'PAUSE' | 'STOP'>>({});
    const [assumptions, setAssumptions] = useState('');
    const [isFinalized, setIsFinalized] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    
    // Store the actual scenario ID (might be different from URL param)
    const [actualScenarioId, setActualScenarioId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id, resolvedParams.scenarioId]);

    // Debounced save function
    const debouncedSave = useCallback(async (decisionsToSave: Record<string, 'FUND' | 'PAUSE' | 'STOP'>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const scenarioId = actualScenarioId || resolvedParams.scenarioId;
                const decisionsArray = Object.entries(decisionsToSave).map(([id, dec]) => ({
                    initiativeId: id,
                    decision: dec
                }));

                await authPost(`/api/scenarios/${scenarioId}/decisions`, {
                    decisions: decisionsArray
                });
            } catch (error) {
                console.error('Error saving decisions:', error);
            }
        }, 500); // Save after 500ms of inactivity
    }, [actualScenarioId, resolvedParams.scenarioId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load all data in parallel for faster loading
            const [portfolioRes, scenarioRes, initiativesRes] = await Promise.all([
                authGet(`/api/portfolios/${resolvedParams.id}`),
                authGet(`/api/scenarios/${resolvedParams.scenarioId}`),
                authGet(`/api/initiatives?portfolioId=${resolvedParams.id}`)
            ]);

            const [portfolioData, scenarioData, initiativesData] = await Promise.all([
                portfolioRes.json(),
                scenarioRes.json(),
                initiativesRes.json()
            ]);

            const decisionsMap: Record<string, 'FUND' | 'PAUSE' | 'STOP'> = {};

            if (portfolioData.success) {
                setPortfolio(portfolioData.data);
            }

            // If scenario doesn't exist by ID, check if one exists by name
            if (!scenarioData.success && scenarioRes.status === 404) {
                try {
                    const scenarioName = resolvedParams.scenarioId === 'baseline' ? 'Baseline' : resolvedParams.scenarioId;
                    
                    // Check if a scenario with this name already exists
                    const allScenariosRes = await authGet(`/api/scenarios?portfolioId=${resolvedParams.id}`);
                    const allScenariosData = await allScenariosRes.json();
                    
                    let existingScenario = null;
                    if (allScenariosData.success) {
                        existingScenario = allScenariosData.data.find((s: { name: string }) => 
                            s.name.toLowerCase() === scenarioName.toLowerCase()
                        );
                    }
                    
                    if (existingScenario) {
                        // Use existing scenario
                        setScenario(existingScenario);
                        setActualScenarioId(existingScenario.id);
                        setAssumptions(existingScenario.assumptions || '');
                        setIsFinalized(existingScenario.isFinalized || false);
                    } else {
                        // Create new scenario
                        const createResponse = await authPost('/api/scenarios', {
                            portfolioId: resolvedParams.id,
                            name: scenarioName,
                            assumptions: ''
                        });
                        const createResult = await createResponse.json();
                        
                        if (createResult.success) {
                            setScenario(createResult.data);
                            setActualScenarioId(createResult.data.id);
                            setAssumptions('');
                            setIsFinalized(false);
                        } else {
                            alert('Failed to create scenario: ' + (createResult.errors[0]?.message || 'Unknown error'));
                        }
                    }
                } catch (createError) {
                    console.error('Error creating scenario:', createError);
                    alert('Failed to create scenario');
                }
            } else if (scenarioData.success) {
                setScenario(scenarioData.data);
                setActualScenarioId(scenarioData.data.id); // Store the actual ID
                setAssumptions(scenarioData.data.assumptions || '');
                setIsFinalized(scenarioData.data.isFinalized);

                // Set existing decisions
                scenarioData.data.decisions?.forEach((d: { initiativeId: string; decision: 'FUND' | 'PAUSE' | 'STOP' }) => {
                    decisionsMap[d.initiativeId] = d.decision;
                });
                setDecisions(decisionsMap);
            }

            if (initiativesData.success) {
                // Only show complete initiatives
                const completeInitiatives = initiativesData.data.filter((i: { isComplete: boolean }) => i.isComplete);
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
                    const scenarioId = actualScenarioId || resolvedParams.scenarioId;
                    await authPatch(`/api/scenarios/${scenarioId}`, {
                        assumptions: value
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
            alert(`Cannot finalize: Capacity constraint breached. Total capacity demand (${totalCapacity}) exceeds limit (${portfolio?.totalCapacity}). Please adjust initiative decisions.`);
            return;
        }

        try {
            const scenarioId = actualScenarioId || resolvedParams.scenarioId;
            const response = await authPost(`/api/scenarios/${scenarioId}/finalize`, {});

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
            const response = await authPost('/api/scenarios', {
                portfolioId: resolvedParams.id,
                ...scenarioData
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

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={scenario?.name || ''}
                                disabled={true}
                                className="text-2xl font-bold tracking-tight bg-transparent border-none focus:outline-none w-full mb-1"
                                style={{ maxWidth: '700px', color: 'var(--text-primary)' }}
                            />
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Explore trade-offs under constraints</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
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
                    className="mb-6 rounded-lg p-5"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        borderLeft: '3px solid var(--accent-warning)'
                    }}
                >
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Scenario Assumptions <span style={{ color: 'var(--accent-error)' }}>*</span>
                    </label>
                    <Textarea
                        value={assumptions}
                        onChange={(e) => handleAssumptionsChange(e.target.value)}
                        disabled={isFinalized}
                        rows={3}
                        placeholder="Document the premise and constraints of this scenario (mandatory per governance rules)"
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        <span style={{ color: 'var(--accent-error)' }}>*</span> Mandatory field. All scenarios must declare assumptions before finalization.
                    </p>
                </div>

                {/* Enhanced Real-Time Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                    <div 
                        className="mb-6 p-4 rounded-lg"
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderLeft: '3px solid var(--accent-error)'
                        }}
                    >
                        <h3 
                            className="text-sm font-semibold uppercase tracking-wide mb-1.5"
                            style={{ color: 'var(--accent-error)' }}
                        >
                            Capacity Constraint Breached
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Total capacity demand ({totalCapacity} units) exceeds portfolio limit ({capacityLimit} units).
                            Scenario cannot be finalized until capacity is within limits.
                        </p>
                    </div>
                )}

                {/* Enhanced Initiatives Table */}
                <div 
                    className="rounded-lg overflow-hidden mb-6"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <div 
                        className="px-5 py-4"
                        style={{ 
                            borderBottom: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-tertiary)'
                        }}
                    >
                        <h2 
                            className="text-base font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Initiative Decisions
                        </h2>
                        <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-tertiary)' }}
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
                <div className="flex flex-col gap-3">
                    {!assumptions.trim() && !isFinalized && (
                        <div 
                            className="p-3 text-sm rounded-lg"
                            style={{ 
                                backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                                color: 'var(--accent-warning)',
                                border: '1px solid rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            Assumptions required before finalization
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="secondary"
                            onClick={() => router.push(`/portfolio/${resolvedParams.id}/scenarios/compare`)}
                        >
                            Compare Scenarios
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleFinalize}
                            disabled={isFinalized || !assumptions.trim() || isOverCapacity || isSaving}
                            style={{ 
                                backgroundColor: isFinalized || !assumptions.trim() || isOverCapacity ? 'var(--bg-elevated)' : 'var(--accent-warning)', 
                                color: isFinalized || !assumptions.trim() || isOverCapacity ? 'var(--text-tertiary)' : '#000000',
                                cursor: isFinalized || !assumptions.trim() || isOverCapacity ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSaving ? 'Finalizing...' : 'Finalize Scenario'}
                        </Button>
                    </div>
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
        <div className="inline-flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
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
        assumptions: '',
        targetValue: '',
        targetCapacity: '',
        riskTolerance: 'medium',
        strategicFocus: ''
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
            // Combine all fields into assumptions for now (since schema only has assumptions field)
            const enhancedAssumptions = `${formData.assumptions}

--- Scenario Parameters ---
${formData.targetValue ? `Target Portfolio Value: ${formData.targetValue}` : ''}
${formData.targetCapacity ? `Target Capacity Utilization: ${formData.targetCapacity}%` : ''}
Risk Tolerance: ${formData.riskTolerance.charAt(0).toUpperCase() + formData.riskTolerance.slice(1)}
${formData.strategicFocus ? `Strategic Focus: ${formData.strategicFocus}` : ''}`;

            onSave({
                name: formData.name,
                assumptions: enhancedAssumptions.trim()
            });
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
                        placeholder="e.g., Aggressive Growth, Conservative Approach, Risk-Averse"
                        helperText="Descriptive name that indicates the strategy"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="target-value"
                            label="Target Portfolio Value (Optional)"
                            value={formData.targetValue}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                            placeholder="e.g., ₹500Cr"
                            helperText="Expected value outcome"
                        />
                        <Input
                            id="target-capacity"
                            label="Target Capacity % (Optional)"
                            value={formData.targetCapacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetCapacity: e.target.value }))}
                            placeholder="e.g., 85"
                            helperText="Max capacity utilization"
                        />
                    </div>

                    <div>
                        <label 
                            className="block text-sm font-semibold mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Risk Tolerance
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['low', 'medium', 'high'].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, riskTolerance: level }))}
                                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: formData.riskTolerance === level ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        color: formData.riskTolerance === level ? 'var(--accent-primary-text)' : 'var(--text-secondary)',
                                        border: formData.riskTolerance === level ? 'none' : '1px solid var(--border-default)'
                                    }}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                            Indicates willingness to fund higher-risk initiatives
                        </p>
                    </div>

                    <Input
                        id="strategic-focus"
                        label="Strategic Focus (Optional)"
                        value={formData.strategicFocus}
                        onChange={(e) => setFormData(prev => ({ ...prev, strategicFocus: e.target.value }))}
                        placeholder="e.g., Customer Experience, Cost Reduction, Innovation"
                        helperText="Primary strategic objective for this scenario"
                    />

                    <div>
                        <label 
                            className="block text-sm font-semibold mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Assumptions & Context <span style={{ color: 'var(--accent-error)' }}>*</span>
                        </label>
                        <Textarea
                            value={formData.assumptions}
                            onChange={(e) => setFormData(prev => ({ ...prev, assumptions: e.target.value }))}
                            placeholder="e.g., Accelerated hiring in Q2, regulatory approval by March, focus on high-value initiatives, budget constraints relaxed for strategic programs"
                            rows={5}
                        />
                        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                            <span style={{ color: 'var(--accent-error)' }}>*</span> Mandatory: Document the premise, constraints, and decision-making context for this scenario
                        </p>
                    </div>
                </div>

                <div 
                    className="px-8 py-6 flex justify-between items-center"
                    style={{ 
                        borderTop: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-tertiary)'
                    }}
                >
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-error)' }}>*</span> Required fields must be filled
                    </p>
                    <div className="flex gap-3">
                        <Button variant="text" onClick={onClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={!isValid}
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
