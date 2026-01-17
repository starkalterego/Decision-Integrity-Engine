'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

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

export default function InitiativesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Load portfolio and initiatives
    useEffect(() => {
        loadData();
    }, [resolvedParams.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load portfolio
            const portfolioRes = await fetch(`/api/portfolios/${resolvedParams.id}`);
            const portfolioData = await portfolioRes.json();
            if (portfolioData.success) {
                setPortfolio(portfolioData.data);
            }

            // Load initiatives
            const initiativesRes = await fetch(`/api/initiatives?portfolioId=${resolvedParams.id}`);
            const initiativesData = await initiativesRes.json();
            if (initiativesData.success) {
                setInitiatives(initiativesData.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
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

    const handleSaveInitiative = async (initiativeData: any) => {
        try {
            const response = await fetch('/api/initiatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolioId: resolvedParams.id,
                    ...initiativeData
                }),
            });

            const result = await response.json();

            if (result.success) {
                await loadData(); // Reload initiatives
                setShowModal(false);
                alert('Initiative saved successfully');
            } else {
                alert('Failed to save initiative: ' + (result.errors[0]?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving initiative:', error);
            alert('Failed to save initiative');
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
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading initiatives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName={portfolio?.name || 'Portfolio'} portfolioId={resolvedParams.id} currentPage="initiatives" />

            <main className="page-container">
                {/* Enhanced Page Header & Context */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Initiative Intake</h1>
                            <p className="text-sm text-neutral-500 mt-2">Add decision-grade initiatives to the portfolio</p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAddInitiative}
                            className="bg-neutral-900 hover:bg-neutral-800"
                        >
                            + Add Initiative
                        </Button>
                    </div>
                </div>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="card p-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Total Initiatives</p>
                        <p className="text-3xl font-bold text-neutral-900">{initiatives.length}</p>
                    </div>
                    <div className="card p-6 border-l-4 border-l-status-green">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Complete</p>
                        <p className="text-3xl font-bold text-status-green">{completeCount}</p>
                        <p className="text-xs text-neutral-600 mt-2">Ready for prioritization</p>
                    </div>
                    <div className="card p-6 border-l-4 border-l-status-red">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Incomplete</p>
                        <p className="text-3xl font-bold text-status-red">{incompleteCount}</p>
                        <p className="text-xs text-neutral-600 mt-2">Missing required fields</p>
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
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-100 border-b border-neutral-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Initiative</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Sponsor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Delivery Owner</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Alignment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wide">Capacity</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wide">Value</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wide">Risk</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInitiatives.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                                        No initiatives found. Click "+ Add Initiative" to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredInitiatives.map((initiative) => (
                                    <tr key={initiative.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-neutral-900">{initiative.name}</span>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-700">{initiative.sponsor}</td>
                                        <td className="px-4 py-4 text-neutral-700">{initiative.deliveryOwner}</td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm">{'★'.repeat(initiative.strategicAlignmentScore)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {initiative.capacityDemands.map((cd, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700 border border-neutral-200"
                                                        style={{ borderRadius: '2px' }}
                                                    >
                                                        {cd.role}: {cd.units}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-mono text-right font-semibold text-neutral-900">{formatCurrency(initiative.estimatedValue)}</td>
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
                                            <span className={`inline-block px-3 py-1 text-xs font-semibold ${initiative.isComplete
                                                ? 'bg-status-green-bg text-status-green border border-status-green-border'
                                                : 'bg-status-red-bg text-status-red border border-status-red-border'
                                                }`} style={{ borderRadius: '2px' }}>
                                                {initiative.isComplete ? '✓ Complete' : '! Incomplete'}
                                            </span>
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

function InitiativeModal({
    onClose,
    editingId,
    initiatives,
    onSave
}: {
    onClose: () => void;
    editingId: string | null;
    initiatives: Initiative[];
    onSave: (initiative: any) => void;
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
            alert('Please fill in all required fields correctly');
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
            className="fixed inset-0 bg-black flex items-center justify-center p-4"
            style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                position: 'fixed',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
        >
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-lg" style={{ position: 'relative', zIndex: 10000, backgroundColor: '#ffffff' }}>
                <div className="border-b border-neutral-200 px-8 py-6 bg-gradient-to-r from-neutral-50 to-white">
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        {editingId ? 'Edit Initiative' : 'Add New Initiative'}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-2">All fields marked with <span className="text-red-600 font-semibold">*</span> are mandatory</p>
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

                <div className="border-t border-neutral-200 px-8 py-6 flex justify-between items-center bg-gradient-to-r from-neutral-50 to-white">
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
