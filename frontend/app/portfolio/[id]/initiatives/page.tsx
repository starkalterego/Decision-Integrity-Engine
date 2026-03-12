'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authGet, authPost, authPut, authPatch, authDelete } from '@/lib/api';
import showToast from '@/lib/toast';

interface Initiative {
    id: string;
    name: string;
    description?: string;
    sponsor: string;
    deliveryOwner: string;
    strategicAlignmentScore: number;
    strategyScore: number;
    estimatedValue: number;
    capexCost: number;
    opexCost: number;
    costOfDelay: number;
    riskScore: number;
    lifecycleState: string;
    status: string;
    isComplete: boolean;
    capacityDemands: Array<{ role: string; units: number }>;
}

interface Portfolio {
    id: string;
    name: string;
    status: string;
    totalBudget: number;
    totalCapacity: number;
}

export default function InitiativesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [lifecycleModalId, setLifecycleModalId] = useState<string | null>(null);
    const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);

    // Load portfolio and initiatives
    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load portfolio and initiatives in parallel (faster)
            const [portfolioRes, initiativesRes] = await Promise.all([
                authGet(`/api/portfolios/${resolvedParams.id}`),
                authGet(`/api/initiatives?portfolioId=${resolvedParams.id}`)
            ]);

            const [portfolioData, initiativesData] = await Promise.all([
                portfolioRes.json(),
                initiativesRes.json()
            ]);

            if (portfolioData.success) {
                setPortfolio(portfolioData.data);
            }

            if (initiativesData.success) {
                setInitiatives(initiativesData.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load portfolio data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddInitiative = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const handleEditInitiative = (id: string) => {
        setEditingId(id);
        setShowModal(true);
    };

    const handleSaveInitiative = async (initiativeData: InitiativeFormData) => {
        try {
            let response;
            
            if (editingId) {
                // Update existing initiative
                response = await authPut(`/api/initiatives/${editingId}`, initiativeData);
            } else {
                // Create new initiative
                response = await authPost('/api/initiatives', {
                    portfolioId: resolvedParams.id,
                    ...initiativeData
                });
            }

            const result = await response.json();

            if (result.success) {
                await loadData(); // Reload initiatives
                setShowModal(false);
                showToast.success(editingId ? 'Initiative updated successfully' : 'Initiative created successfully');
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to save initiative');
            }
        } catch (error) {
            console.error('Error saving initiative:', error);
            showToast.error('Failed to save initiative');
        }
    };

    const formatCurrency = (value: number) => {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
    };

    const filteredInitiatives = initiatives.filter(i => {
        if (filterStatus === 'complete') return i.isComplete;
        if (filterStatus === 'incomplete') return !i.isComplete;
        return true;
    });

    const completeCount = initiatives.filter(i => i.isComplete).length;
    const incompleteCount = initiatives.filter(i => !i.isComplete).length;

    if (isLoading) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-14 w-14 border-4 mx-auto mb-5"
                        style={{ 
                            borderColor: 'var(--border-subtle)',
                            borderTopColor: 'var(--accent-primary)'
                        }}
                    />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading initiatives...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="initiatives" />

            <main className="page-container">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase mb-1"
                                style={{ color: 'var(--accent-primary)', letterSpacing: '0.14em' }}>
                                Portfolio Initiatives
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}>
                                Initiative Intake
                            </h1>
                            <p className="text-sm mt-1.5"
                                style={{ color: 'var(--text-secondary)' }}>
                                Add decision-grade initiatives to the portfolio
                            </p>
                        </div>
                        <Button variant="primary" onClick={handleAddInitiative}>
                            + Add Initiative
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                    {/* Total */}
                    <div className="rounded-xl p-5 flex items-start justify-between"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                        <div>
                            <p className="text-xs uppercase font-semibold mb-3"
                                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                                Total Initiatives
                            </p>
                            <p className="text-3xl font-bold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}>
                                {initiatives.length}
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="5" height="5" rx="1" fill="var(--text-tertiary)" />
                                <rect x="9" y="2" width="5" height="5" rx="1" fill="var(--text-tertiary)" opacity="0.6" />
                                <rect x="2" y="9" width="5" height="5" rx="1" fill="var(--text-tertiary)" opacity="0.4" />
                                <rect x="9" y="9" width="5" height="5" rx="1" fill="var(--text-tertiary)" opacity="0.25" />
                            </svg>
                        </div>
                    </div>
                    {/* Complete */}
                    <div className="rounded-xl p-5 flex items-start justify-between"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                        <div>
                            <p className="text-xs uppercase font-semibold mb-3"
                                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                                Complete
                            </p>
                            <p className="text-3xl font-bold tracking-tight"
                                style={{ color: 'var(--accent-success)' }}>
                                {completeCount}
                            </p>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                                Ready for prioritization
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="var(--accent-success)" strokeWidth="1.5" />
                                <path d="M5 8l2 2 4-4" stroke="var(--accent-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    {/* Incomplete */}
                    <div className="rounded-xl p-5 flex items-start justify-between"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                        <div>
                            <p className="text-xs uppercase font-semibold mb-3"
                                style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                                Incomplete
                            </p>
                            <p className="text-3xl font-bold tracking-tight"
                                style={{ color: 'var(--accent-error)' }}>
                                {incompleteCount}
                            </p>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                                Missing required fields
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2L14 13H2L8 2Z" stroke="var(--accent-error)" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M8 6v3.5" stroke="var(--accent-error)" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="8" cy="11.5" r="0.75" fill="var(--accent-error)" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex rounded-lg p-0.5"
                        style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                        {(['all', 'complete', 'incomplete'] as const).map(key => {
                            const labels: Record<string, string> = { all: 'All', complete: 'Complete', incomplete: 'Incomplete' };
                            const counts: Record<string, number> = { all: initiatives.length, complete: completeCount, incomplete: incompleteCount };
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                                    style={{
                                        backgroundColor: filterStatus === key ? 'var(--bg-secondary)' : 'transparent',
                                        color: filterStatus === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        boxShadow: filterStatus === key ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                                    }}>
                                    {labels[key]}{' '}
                                    <span style={{ opacity: 0.6 }}>{counts[key]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Enhanced Initiatives Table */}
                <div 
                    className="rounded-xl overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-default)' }}>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Initiative</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Sponsor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Delivery Owner</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Lifecycle</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Alignment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Capacity</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Value</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Risk</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInitiatives.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ opacity: 0.25 }}>
                                                <rect x="4" y="6" width="28" height="24" rx="3" stroke="var(--text-secondary)" strokeWidth="1.5" />
                                                <path d="M4 12h28" stroke="var(--text-secondary)" strokeWidth="1.5" />
                                                <path d="M11 19h14M11 24h8" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                No initiatives found
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                Click &quot;+ Add Initiative&quot; to register the first initiative
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInitiatives.map((initiative) => (
                                    <React.Fragment key={initiative.id}>
                                    <tr 
                                        className="border-b transition-colors" 
                                        style={{ 
                                            borderColor: 'var(--border-default)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-4 py-4">
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{initiative.name}</span>
                                        </td>
                                        <td className="px-4 py-4" style={{ color: 'var(--text-secondary)' }}>{initiative.sponsor}</td>
                                        <td className="px-4 py-4" style={{ color: 'var(--text-secondary)' }}>{initiative.deliveryOwner}</td>
                                        <td className="px-4 py-4">
                                            {(() => {
                                                const state = initiative.lifecycleState || 'IDEA';
                                                const colors: Record<string, { bg: string; text: string }> = {
                                                    IDEA:             { bg: 'var(--bg-tertiary)',            text: 'var(--text-secondary)' },
                                                    CONCEPT_APPROVED: { bg: 'rgba(59,130,246,0.15)',         text: '#3b82f6' },
                                                    PLANNED:          { bg: 'rgba(99,102,241,0.15)',         text: '#6366f1' },
                                                    EXECUTION:        { bg: 'rgba(16,185,129,0.12)',         text: 'var(--accent-success)' },
                                                    CLOSED:           { bg: 'rgba(139,92,246,0.12)',         text: '#8b5cf6' },
                                                    TERMINATED:       { bg: 'rgba(239,68,68,0.12)',          text: 'var(--accent-error)' },
                                                };
                                                const c = colors[state] || colors.IDEA;
                                                return (
                                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded"
                                                        style={{ backgroundColor: c.bg, color: c.text }}>
                                                        {state}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                <span>{initiative.strategicAlignmentScore}/5</span>
                                                {initiative.strategyScore > 0 && (
                                                    <span className="ml-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>({initiative.strategyScore})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {initiative.capacityDemands.map((cd, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-2 py-0.5 text-xs"
                                                        style={{ 
                                                            backgroundColor: 'var(--bg-tertiary)',
                                                            color: 'var(--text-secondary)',
                                                            border: '1px solid var(--border-default)',
                                                            borderRadius: '2px'
                                                        }}
                                                    >
                                                        {cd.role}: {cd.units}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(initiative.estimatedValue)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-block px-2.5 py-0.5 text-xs font-bold"
                                                style={{
                                                    borderRadius: '4px',
                                                    backgroundColor: initiative.riskScore >= 4
                                                        ? 'rgba(239,68,68,0.15)'
                                                        : initiative.riskScore >= 3
                                                            ? 'rgba(245,158,11,0.15)'
                                                            : 'rgba(16,185,129,0.12)',
                                                    color: initiative.riskScore >= 4
                                                        ? 'var(--accent-error)'
                                                        : initiative.riskScore >= 3
                                                            ? 'var(--accent-warning)'
                                                            : 'var(--accent-success)',
                                                }}>
                                                {initiative.riskScore}/5
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge
                                                status={initiative.isComplete ? 'green' : 'red'}
                                                text={initiative.isComplete ? 'Complete' : 'Incomplete'}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => handleEditInitiative(initiative.id)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => setLifecycleModalId(initiative.id)}
                                                    style={{ color: 'var(--accent-primary)' }}
                                                >
                                                    Advance
                                                </Button>
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    onClick={() => setExpandedRiskId(expandedRiskId === initiative.id ? null : initiative.id)}
                                                    style={{ color: 'var(--text-tertiary)' }}
                                                >
                                                    {expandedRiskId === initiative.id ? 'Hide Risks' : 'Risks'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRiskId === initiative.id && (
                                        <tr>
                                            <td colSpan={10} className="p-0" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '2px solid var(--border-default)' }}>
                                                <RiskPanel initiativeId={initiative.id} />
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Governance Rule Callout */}
                {incompleteCount > 0 && (
                    <div className="mt-6 p-5 rounded-xl"
                        style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="var(--accent-error)" strokeWidth="1.4" strokeLinejoin="round" />
                                    <path d="M7 5.5V8" stroke="var(--accent-error)" strokeWidth="1.4" strokeLinecap="round" />
                                    <circle cx="7" cy="10" r="0.6" fill="var(--accent-error)" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase mb-1"
                                    style={{ color: 'var(--accent-error)', letterSpacing: '0.1em' }}>Governance Rule</p>
                                <p className="text-sm leading-relaxed"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    {incompleteCount} incomplete initiative{incompleteCount > 1 ? 's' : ''} cannot be prioritized or modeled.
                                    All mandatory fields must be filled before an initiative can participate in decision-making.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showModal && (
                <InitiativeModal
                    onClose={() => setShowModal(false)}
                    editingId={editingId}
                    initiatives={initiatives}
                    onSave={handleSaveInitiative}
                />
            )}
            {lifecycleModalId && (
                <LifecycleModal
                    initiativeId={lifecycleModalId}
                    onClose={() => setLifecycleModalId(null)}
                    onSuccess={() => { setLifecycleModalId(null); loadData(); }}
                />
            )}
        </div>
    );
}

interface InitiativeFormData {
    name: string;
    description?: string;
    sponsor: string;
    deliveryOwner: string;
    strategicAlignmentScore: number;
    strategyScore: number;
    estimatedValue: number;
    capexCost: number;
    opexCost: number;
    costOfDelay: number;
    riskScore: number;
    lifecycleState: string;
    capacityDemand: Array<{ role: string; units: number }>;
}

function InitiativeModal({
    onClose,
    editingId,
    initiatives,
    onSave
}: {
    onClose: () => void;
    editingId: string | null;
    initiatives: Initiative[];
    onSave: (initiative: InitiativeFormData) => void;
}) {
    const editingInitiative = editingId ? initiatives.find(i => i.id === editingId) : null;

    const [formData, setFormData] = useState({
        name: editingInitiative?.name || '',
        description: editingInitiative?.description || '',
        sponsor: editingInitiative?.sponsor || '',
        deliveryOwner: editingInitiative?.deliveryOwner || '',
        strategicAlignmentScore: editingInitiative?.strategicAlignmentScore?.toString() || '',
        strategyScore: editingInitiative?.strategyScore?.toString() || '',
        estimatedValue: editingInitiative?.estimatedValue?.toString() || '',
        capexCost: editingInitiative?.capexCost?.toString() || '',
        opexCost: editingInitiative?.opexCost?.toString() || '',
        costOfDelay: editingInitiative?.costOfDelay?.toString() || '',
        riskScore: editingInitiative?.riskScore?.toString() || '',
        lifecycleState: editingInitiative?.lifecycleState || 'IDEA',
    });

    const [capacityDemand, setCapacityDemand] = useState<Array<{ role: string; units: string }>>(
        editingInitiative?.capacityDemands?.map(cd => ({ role: cd.role, units: cd.units.toString() })) || [{ role: '', units: '' }]
    );

    const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCapacityChange = (index: number, field: 'role' | 'units', value: string) => {
        setCapacityDemand(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addCapacityRole = () => {
        setCapacityDemand(prev => [...prev, { role: '', units: '' }]);
    };

    const removeCapacityRole = (index: number) => {
        if (capacityDemand.length > 1) {
            setCapacityDemand(prev => prev.filter((_, i) => i !== index));
        }
    };

    const isFormValid = () => {
        const basicFieldsValid = formData.name.trim() !== '' &&
            formData.sponsor.trim() !== '' &&
            formData.deliveryOwner.trim() !== '' &&
            formData.strategicAlignmentScore !== '' &&
            formData.strategyScore !== '' &&
            formData.estimatedValue !== '' &&
            formData.costOfDelay !== '' &&
            formData.riskScore !== '';

        const capacityValid = capacityDemand.every(role =>
            role.role.trim() !== '' && role.units.trim() !== '' && !isNaN(Number(role.units))
        );

        return basicFieldsValid && capacityValid;
    };

    const handleSave = async () => {
        if (!isFormValid()) {
            showToast.warning('Please fill in all required fields correctly');
            return;
        }

        setIsSaving(true);

        const initiativeData = {
            name: formData.name,
            description: formData.description || undefined,
            sponsor: formData.sponsor,
            deliveryOwner: formData.deliveryOwner,
            strategicAlignmentScore: Number(formData.strategicAlignmentScore),
            strategyScore: Number(formData.strategyScore),
            estimatedValue: Number(formData.estimatedValue),
            capexCost: Number(formData.capexCost) || 0,
            opexCost: Number(formData.opexCost) || 0,
            costOfDelay: Number(formData.costOfDelay),
            riskScore: Number(formData.riskScore),
            lifecycleState: formData.lifecycleState,
            capacityDemand: capacityDemand.map(cd => ({
                role: cd.role,
                units: Number(cd.units)
            }))
        };

        await onSave(initiativeData);
        setIsSaving(false);
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
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-lg" 
                style={{ 
                    position: 'relative', 
                    zIndex: 10000, 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)'
                }}
            >
                <div className="px-8 py-6"
                    style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="var(--accent-primary)" strokeWidth="1.3" />
                                <path d="M4 6.5h5M4 9h3" stroke="var(--accent-primary)" strokeWidth="1.3" strokeLinecap="round" />
                                <path d="M4 4h2" stroke="var(--accent-primary)" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="text-xs font-semibold uppercase"
                            style={{ color: 'var(--accent-primary)', letterSpacing: '0.12em' }}>
                            {editingId ? 'Edit Initiative' : 'New Initiative'}
                        </p>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight pl-10"
                        style={{ color: 'var(--text-primary)' }}>
                        {editingId ? 'Edit Initiative' : 'Add New Initiative'}
                    </h2>
                    <p className="text-sm mt-1 pl-10"
                        style={{ color: 'var(--text-secondary)' }}>
                        All fields marked with <span style={{ color: 'var(--accent-error)', fontWeight: '600' }}>*</span> are mandatory
                    </p>
                </div>

                <div className="px-8 py-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <Input
                                id="name"
                                name="name"
                                label="Initiative Name *"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., CRM Modernization"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Brief description of initiative scope and goals"
                                className="w-full rounded-md px-3 py-2 text-sm"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-default)',
                                    color: 'var(--text-primary)',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <Input
                            id="sponsor"
                            name="sponsor"
                            label="Sponsor *"
                            type="text"
                            value={formData.sponsor}
                            onChange={handleChange}
                            placeholder="e.g., CRO"
                            helperText="Executive sponsor responsible for outcomes"
                        />

                        <Input
                            id="deliveryOwner"
                            name="deliveryOwner"
                            label="Delivery Owner *"
                            type="text"
                            value={formData.deliveryOwner}
                            onChange={handleChange}
                            placeholder="e.g., IT"
                            helperText="Team/department responsible for delivery"
                        />

                        <Select
                            id="strategicAlignmentScore"
                            name="strategicAlignmentScore"
                            label="Strategic Alignment Score *"
                            value={formData.strategicAlignmentScore}
                            onChange={handleChange}
                            options={[
                                { value: '', label: 'Select alignment...' },
                                { value: '1', label: '★ 1 - Low Alignment' },
                                { value: '2', label: '★★ 2 - Below Average' },
                                { value: '3', label: '★★★ 3 - Medium Alignment' },
                                { value: '4', label: '★★★★ 4 - High Alignment' },
                                { value: '5', label: '★★★★★ 5 - Critical Strategic' },
                            ]}
                        />

                        <Input
                            id="strategyScore"
                            name="strategyScore"
                            label="Strategy Score (0–100) *"
                            type="number"
                            value={formData.strategyScore}
                            onChange={handleChange}
                            placeholder="75"
                            helperText="Continuous strategic fit score used in priority formula"
                        />

                        <Select
                            id="riskScore"
                            name="riskScore"
                            label="Risk Score *"
                            value={formData.riskScore}
                            onChange={handleChange}
                            options={[
                                { value: '', label: 'Select risk level...' },
                                { value: '1', label: '1 - Low Risk' },
                                { value: '2', label: '2 - Below Average Risk' },
                                { value: '3', label: '3 - Medium Risk' },
                                { value: '4', label: '4 - High Risk' },
                                { value: '5', label: '5 - Critical Risk' },
                            ]}
                        />

                        <Select
                            id="lifecycleState"
                            name="lifecycleState"
                            label="Lifecycle State"
                            value={formData.lifecycleState}
                            onChange={handleChange}
                            options={[
                                { value: 'IDEA',             label: 'IDEA — Initial proposal' },
                                { value: 'CONCEPT_APPROVED', label: 'CONCEPT_APPROVED — Concept signed off' },
                                { value: 'PLANNED',          label: 'PLANNED — Delivery plan ready' },
                                { value: 'EXECUTION',        label: 'EXECUTION — In active delivery' },
                                { value: 'CLOSED',           label: 'CLOSED — Delivered and closed' },
                                { value: 'TERMINATED',       label: 'TERMINATED — Cancelled' },
                            ]}
                        />

                        <Input
                            id="estimatedValue"
                            name="estimatedValue"
                            label="Estimated Value (₹) *"
                            type="number"
                            value={formData.estimatedValue}
                            onChange={handleChange}
                            placeholder="35000000"
                            helperText="Expected business value in INR"
                        />

                        <Input
                            id="costOfDelay"
                            name="costOfDelay"
                            label="Cost of Delay (£/week) *"
                            type="number"
                            value={formData.costOfDelay}
                            onChange={handleChange}
                            placeholder="50000"
                            helperText="Weekly business cost of not starting this initiative"
                        />

                        <Input
                            id="capexCost"
                            name="capexCost"
                            label="CapEx Cost (₹)"
                            type="number"
                            value={formData.capexCost}
                            onChange={handleChange}
                            placeholder="20000000"
                            helperText="Capital expenditure (one-off investment)"
                        />

                        <Input
                            id="opexCost"
                            name="opexCost"
                            label="OpEx Cost (₹/yr)"
                            type="number"
                            value={formData.opexCost}
                            onChange={handleChange}
                            placeholder="5000000"
                            helperText="Annual operating expenditure"
                        />
                    </div>

                    <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
                        <h3 className="text-sm font-bold mb-4"
                            style={{ color: 'var(--text-primary)' }}>
                            Capacity Demand <span style={{ color: 'var(--accent-error)' }}>*</span>
                        </h3>
                        <div className="space-y-3">
                            {capacityDemand.map((role, index) => (
                                <div key={index} className="grid grid-cols-3 gap-3">
                                    <Input
                                        label={index === 0 ? "Role *" : ""}
                                        type="text"
                                        value={role.role}
                                        onChange={(e) => handleCapacityChange(index, 'role', e.target.value)}
                                        placeholder="e.g., Engineer"
                                    />
                                    <Input
                                        label={index === 0 ? "Units Required *" : ""}
                                        type="number"
                                        value={role.units}
                                        onChange={(e) => handleCapacityChange(index, 'units', e.target.value)}
                                        placeholder="40"
                                    />
                                    <div className="flex items-end">
                                        {capacityDemand.length > 1 && (
                                            <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => removeCapacityRole(index)}
                                                style={{ color: 'var(--accent-error)' }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="text"
                                size="sm"
                                onClick={addCapacityRole}
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                + Add Another Role
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 flex justify-between items-center"
                    style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <span style={{ color: 'var(--accent-error)', fontWeight: '600' }}>*</span> All fields are mandatory for initiative to be complete
                    </p>
                    <div className="flex gap-3">
                        <Button variant="text" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={!isFormValid() || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Initiative'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        portalContainer
    );
}
// ─── Lifecycle Transition Modal ────────────────────────────────────────────
function LifecycleModal({
    initiativeId,
    onClose,
    onSuccess,
}: {
    initiativeId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [currentState, setCurrentState] = useState('');
    const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
    const [targetState, setTargetState] = useState('');
    const [rationale, setRationale] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        let container = document.getElementById('lifecycle-portal');
        if (!container) {
            container = document.createElement('div');
            container.id = 'lifecycle-portal';
            document.body.appendChild(container);
        }
        setPortalContainer(container);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            if (container && container.childNodes.length === 0) container.remove();
        };
    }, []);

    React.useEffect(() => {
        authGet(`/api/initiatives/${initiativeId}/lifecycle`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setCurrentState(data.data.currentState);
                    setAllowedTransitions(data.data.allowedTransitions);
                    if (data.data.allowedTransitions.length > 0) {
                        setTargetState(data.data.allowedTransitions[0]);
                    }
                }
            })
            .finally(() => setIsLoading(false));
    }, [initiativeId]);

    const requiresRationale = targetState === 'EXECUTION';
    const isValid = targetState !== '' && (!requiresRationale || rationale.trim() !== '');

    const stateColors: Record<string, string> = {
        IDEA: 'var(--text-secondary)',
        CONCEPT_APPROVED: '#3b82f6',
        PLANNED: '#6366f1',
        EXECUTION: 'var(--accent-success)',
        CLOSED: '#8b5cf6',
        TERMINATED: 'var(--accent-error)',
    };

    const handleAdvance = async () => {
        if (!isValid) return;
        setIsSaving(true);
        try {
            const res = await authPost(`/api/initiatives/${initiativeId}/lifecycle`, { targetState, rationale });
            const result = await res.json();
            if (result.success) {
                showToast.success(`State advanced to ${targetState}`);
                onSuccess();
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to advance state');
            }
        } catch {
            showToast.error('Failed to advance state');
        } finally {
            setIsSaving(false);
        }
    };

    if (!portalContainer) return null;

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ position: 'fixed', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
            <div
                className="w-full max-w-md rounded-xl shadow-2xl"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
            >
                <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Advance Lifecycle State</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Transitions are governed and logged permanently.
                    </p>
                </div>

                <div className="px-6 py-6 space-y-5">
                    {isLoading ? (
                        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>Loading transitions…</p>
                    ) : allowedTransitions.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-2xl mb-2">🔒</p>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                Current state: <span style={{ color: stateColors[currentState] || 'var(--text-primary)' }}>{currentState}</span>
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                No further transitions allowed from this state.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Current State</p>
                                <span className="inline-block px-3 py-1 rounded text-sm font-semibold"
                                    style={{ backgroundColor: 'var(--bg-tertiary)', color: stateColors[currentState] || 'var(--text-primary)' }}>
                                    {currentState}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Advance To <span style={{ color: 'var(--accent-error)' }}>*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {allowedTransitions.map(state => (
                                        <button
                                            key={state}
                                            onClick={() => setTargetState(state)}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                            style={{
                                                backgroundColor: targetState === state ? (stateColors[state] || 'var(--accent-primary)') : 'var(--bg-tertiary)',
                                                color: targetState === state ? '#fff' : 'var(--text-secondary)',
                                                border: `1px solid ${targetState === state ? 'transparent' : 'var(--border-default)'}`,
                                                opacity: state === 'TERMINATED' ? 0.85 : 1,
                                            }}
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Rationale {requiresRationale && <span style={{ color: 'var(--accent-error)' }}>*</span>}
                                    {!requiresRationale && <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>(optional)</span>}
                                </label>
                                <textarea
                                    value={rationale}
                                    onChange={(e) => setRationale(e.target.value)}
                                    rows={3}
                                    placeholder={requiresRationale
                                        ? 'Required: Document why this initiative is ready for execution (capacity confirmed, approval obtained)'
                                        : 'Optional: Add context for this transition'}
                                    className="w-full rounded-md px-3 py-2 text-sm"
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        border: `1px solid ${requiresRationale && !rationale.trim() ? 'var(--accent-warning)' : 'var(--border-default)'}`,
                                        color: 'var(--text-primary)',
                                        resize: 'vertical',
                                        outline: 'none',
                                    }}
                                />
                                {requiresRationale && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--accent-warning)' }}>
                                        Execution approval requires documented rationale and governance sign-off.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <Button variant="text" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    {allowedTransitions.length > 0 && (
                        <Button variant="primary" onClick={handleAdvance} disabled={!isValid || isSaving}>
                            {isSaving ? 'Advancing…' : `Advance to ${targetState || '…'}`}
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        portalContainer
    );
}

// ─── Risk Register Panel ────────────────────────────────────────────────────
interface Risk {
    id: string;
    description: string;
    probability: number;
    impact: number;
    exposure: number;
    status: string;
}

function RiskPanel({ initiativeId }: { initiativeId: string }) {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRisk, setNewRisk] = useState({ description: '', probability: 0.5, impact: 0.5 });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initiativeId]);

    const loadRisks = async () => {
        try {
            const res = await authGet(`/api/initiatives/${initiativeId}/risks`);
            const data = await res.json();
            if (data.success) setRisks(data.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRisk = async () => {
        if (!newRisk.description.trim()) {
            showToast.warning('Risk description is required');
            return;
        }
        setIsSaving(true);
        try {
            const res = await authPost(`/api/initiatives/${initiativeId}/risks`, newRisk);
            const data = await res.json();
            if (data.success) {
                setNewRisk({ description: '', probability: 0.5, impact: 0.5 });
                setShowAddForm(false);
                loadRisks();
                showToast.success('Risk added');
            } else {
                showToast.error(data.errors[0]?.message || 'Failed to add risk');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (riskId: string, status: string) => {
        await authPatch(`/api/initiatives/${initiativeId}/risks/${riskId}`, { status });
        loadRisks();
    };

    const handleDelete = async (riskId: string) => {
        await authDelete(`/api/initiatives/${initiativeId}/risks/${riskId}`);
        loadRisks();
        showToast.success('Risk removed');
    };

    const exposureColor = (exposure: number) => {
        if (exposure >= 0.6) return { bg: 'rgba(239,68,68,0.15)', text: 'var(--accent-error)' };
        if (exposure >= 0.3) return { bg: 'rgba(245,158,11,0.15)', text: 'var(--accent-warning)' };
        return { bg: 'rgba(16,185,129,0.12)', text: 'var(--accent-success)' };
    };

    const statusColors: Record<string, { bg: string; text: string }> = {
        OPEN:      { bg: 'rgba(239,68,68,0.15)',  text: 'var(--accent-error)' },
        MITIGATED: { bg: 'rgba(245,158,11,0.15)', text: 'var(--accent-warning)' },
        CLOSED:    { bg: 'rgba(16,185,129,0.12)', text: 'var(--accent-success)' },
    };

    return (
        <div className="px-8 py-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                    Risk Register
                </h4>
                <Button variant="text" size="sm" onClick={() => setShowAddForm(!showAddForm)}
                    style={{ color: 'var(--accent-primary)' }}>
                    {showAddForm ? 'Cancel' : '+ Add Risk'}
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Risk Description <span style={{ color: 'var(--accent-error)' }}>*</span>
                            </label>
                            <textarea
                                value={newRisk.description}
                                onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                                placeholder="Describe the risk clearly…"
                                className="w-full rounded px-3 py-2 text-sm"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-default)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Probability: <strong>{(newRisk.probability * 100).toFixed(0)}%</strong>
                                </label>
                                <input
                                    type="range" min={0} max={1} step={0.05}
                                    value={newRisk.probability}
                                    onChange={(e) => setNewRisk(prev => ({ ...prev, probability: parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                    <span>Low</span><span>High</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                    Impact: <strong>{(newRisk.impact * 100).toFixed(0)}%</strong>
                                </label>
                                <input
                                    type="range" min={0} max={1} step={0.05}
                                    value={newRisk.impact}
                                    onChange={(e) => setNewRisk(prev => ({ ...prev, impact: parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                    <span>Low</span><span>High</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                Exposure (auto-computed): <strong>{(newRisk.probability * newRisk.impact * 100).toFixed(0)}%</strong>
                            </p>
                            <Button variant="primary" size="sm" onClick={handleAddRisk} disabled={isSaving}>
                                {isSaving ? 'Adding…' : 'Add Risk'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>Loading risks…</p>
            ) : risks.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>No risks registered. Click &quot;+ Add Risk&quot; to log a risk.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            {['Description', 'Prob.', 'Impact', 'Exposure', 'Status', ''].map(h => (
                                <th key={h} className="pb-2 text-left text-xs uppercase tracking-wide font-semibold pr-4"
                                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {risks.map(risk => {
                            const exp = exposureColor(risk.exposure);
                            const sc = statusColors[risk.status] || statusColors.OPEN;
                            return (
                                <tr key={risk.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td className="py-2.5 pr-4" style={{ color: 'var(--text-primary)', maxWidth: '280px' }}>{risk.description}</td>
                                    <td className="py-2.5 pr-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                        {(risk.probability * 100).toFixed(0)}%
                                    </td>
                                    <td className="py-2.5 pr-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                        {(risk.impact * 100).toFixed(0)}%
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                                            style={{ backgroundColor: exp.bg, color: exp.text }}>
                                            {(risk.exposure * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <div className="flex gap-1">
                                            {(['OPEN', 'MITIGATED', 'CLOSED'] as const).map(s => (
                                                <button key={s}
                                                    onClick={() => handleStatusChange(risk.id, s)}
                                                    className="px-1.5 py-0.5 rounded text-xs font-semibold transition-all"
                                                    style={{
                                                        backgroundColor: risk.status === s ? statusColors[s].bg : 'var(--bg-tertiary)',
                                                        color: risk.status === s ? statusColors[s].text : 'var(--text-tertiary)',
                                                        border: '1px solid var(--border-subtle)',
                                                    }}>
                                                    {s[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2.5">
                                        <button onClick={() => handleDelete(risk.id)}
                                            className="text-xs px-2 py-0.5 rounded"
                                            style={{ color: 'var(--accent-error)', backgroundColor: 'transparent' }}>
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}