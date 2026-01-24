'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authGet, authPost } from '@/lib/api';
import showToast from '@/lib/toast';

interface Initiative {
    id: string;
    name: string;
    sponsor: string;
    deliveryOwner: string;
    strategicAlignmentScore: number;
    estimatedValue: number;
    riskScore: number;
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
            const response = await authPost('/api/initiatives', {
                portfolioId: resolvedParams.id,
                ...initiativeData
            });

            const result = await response.json();

            if (result.success) {
                await loadData(); // Reload initiatives
                setShowModal(false);
                showToast.success('Initiative saved successfully');
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
                        className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-4"
                        style={{ 
                            borderColor: '#1e293b',
                            borderTopColor: '#00d9ff'
                        }}
                    />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading initiatives...</p>
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
                {/* Enhanced Page Header & Context */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 
                                className="text-3xl font-bold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Initiative Intake
                            </h1>
                            <p 
                                className="text-sm mt-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Add decision-grade initiatives to the portfolio
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAddInitiative}
                        >
                            + Add Initiative
                        </Button>
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div 
                        className="card p-6"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)'
                        }}
                    >
                        <p 
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Total Initiatives
                        </p>
                        <p 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {initiatives.length}
                        </p>
                    </div>
                    <div 
                        className="card p-6"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderLeft: '4px solid var(--accent-success)'
                        }}
                    >
                        <p 
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Complete
                        </p>
                        <p 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--accent-success)' }}
                        >
                            {completeCount}
                        </p>
                        <p 
                            className="text-xs mt-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Ready for prioritization
                        </p>
                    </div>
                    <div 
                        className="card p-6"
                        style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                            borderLeft: '4px solid var(--accent-error)'
                        }}
                    >
                        <p 
                            className="text-xs uppercase tracking-wide mb-2"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Incomplete
                        </p>
                        <p 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--accent-error)' }}
                        >
                            {incompleteCount}
                        </p>
                        <p 
                            className="text-xs mt-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Missing required fields
                        </p>
                    </div>
                </div>

                {/* Enhanced Filter Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'all'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                }`}
                            style={{ borderRadius: '2px' }}
                        >
                            All ({initiatives.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('complete')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'complete'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                }`}
                            style={{ borderRadius: '2px' }}
                        >
                            Complete ({completeCount})
                        </button>
                        <button
                            onClick={() => setFilterStatus('incomplete')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'incomplete'
                                ? 'bg-neutral-900 text-white'
                                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                }`}
                            style={{ borderRadius: '2px' }}
                        >
                            Incomplete ({incompleteCount})
                        </button>
                    </div>
                </div>

                {/* Enhanced Initiatives Table */}
                <div 
                    className="card overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <table className="w-full">
                        <thead>
                            <tr 
                                style={{ 
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderBottom: '1px solid var(--border-default)'
                                }}
                            >
                                <th 
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Initiative
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Sponsor
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Delivery Owner
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Alignment
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Capacity
                                </th>
                                <th 
                                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Value
                                </th>
                                <th 
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Risk
                                </th>
                                <th 
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Status
                                </th>
                                <th 
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInitiatives.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                                        No initiatives found. Click &quot;+ Add Initiative&quot; to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredInitiatives.map((initiative) => (
                                    <tr 
                                        key={initiative.id} 
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
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{initiative.strategicAlignmentScore}/5</span>
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
                                            <span className={`inline-block px-2.5 py-1 text-xs font-semibold ${initiative.riskScore >= 4
                                                ? 'bg-status-red text-white'
                                                : initiative.riskScore >= 3
                                                    ? 'bg-neutral-200 text-neutral-700'
                                                    : 'bg-status-green text-white'
                                                }`} style={{ borderRadius: '2px' }}>
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
                                            <Button
                                                variant="text"
                                                size="sm"
                                                onClick={() => handleEditInitiative(initiative.id)}
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Governance Rule Callout */}
                {incompleteCount > 0 && (
                    <div className="mt-8 p-6 bg-status-red-bg border-l-4 border-l-status-red rounded">
                        <div className="flex items-start gap-4">
                            <span className="text-status-red text-2xl font-bold mt-0.5">!</span>
                            <div>
                                <h3 className="text-sm font-bold text-status-red uppercase tracking-wide mb-2">Governance Rule</h3>
                                <p className="text-sm text-neutral-700 leading-relaxed">
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
        </div>
    );
}

interface InitiativeFormData {
    name: string;
    sponsor: string;
    deliveryOwner: string;
    strategicAlignmentScore: number;
    estimatedValue: number;
    riskScore: number;
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
        sponsor: editingInitiative?.sponsor || '',
        deliveryOwner: editingInitiative?.deliveryOwner || '',
        strategicAlignmentScore: editingInitiative?.strategicAlignmentScore?.toString() || '',
        estimatedValue: editingInitiative?.estimatedValue?.toString() || '',
        riskScore: editingInitiative?.riskScore?.toString() || '',
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
            formData.estimatedValue !== '' &&
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
            sponsor: formData.sponsor,
            deliveryOwner: formData.deliveryOwner,
            strategicAlignmentScore: Number(formData.strategicAlignmentScore),
            estimatedValue: Number(formData.estimatedValue),
            riskScore: Number(formData.riskScore),
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
                        {editingId ? 'Edit Initiative' : 'Add New Initiative'}
                    </h2>
                    <p 
                        className="text-sm mt-2"
                        style={{ color: 'var(--text-secondary)' }}
                    >
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

                        <div className="col-span-2">
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
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-200">
                        <h3 className="text-base font-bold mb-6 text-neutral-900">Capacity Demand <span className="text-red-600">*</span></h3>
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
                                                className="text-status-red"
                                                onClick={() => removeCapacityRole(index)}
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
                                className="text-status-green"
                                onClick={addCapacityRole}
                            >
                                + Add Another Role
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-200 px-8 py-6 flex justify-between items-center bg-linear-to-r from-neutral-50 to-white">
                    <p className="text-sm text-neutral-600"><span className="text-red-600 font-semibold">*</span> All fields are mandatory for initiative to be complete</p>
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
