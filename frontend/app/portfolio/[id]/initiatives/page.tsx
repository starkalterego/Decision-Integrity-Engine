'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

interface Initiative {
    id: string;
    name: string;
    sponsor: string;
    deliveryOwner: string;
    strategicAlignment: number;
    estimatedValue: number;
    riskScore: number;
    status: string;
    isComplete: boolean;
}

export default function InitiativesPage() {
    const [initiatives, setInitiatives] = useState<Initiative[]>([
        {
            id: '1',
            name: 'CRM Modernization',
            sponsor: 'CRO',
            deliveryOwner: 'IT',
            strategicAlignment: 4,
            estimatedValue: 35000000,
            riskScore: 3,
            status: 'Proposed',
            isComplete: true,
        },
        {
            id: '2',
            name: 'Data Platform Upgrade',
            sponsor: 'CTO',
            deliveryOwner: 'Engineering',
            strategicAlignment: 5,
            estimatedValue: 50000000,
            riskScore: 4,
            status: 'Proposed',
            isComplete: false,
        },
        {
            id: '3',
            name: 'Mobile App Redesign',
            sponsor: 'CPO',
            deliveryOwner: 'Product',
            strategicAlignment: 3,
            estimatedValue: 25000000,
            riskScore: 2,
            status: 'Proposed',
            isComplete: true,
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

    const handleAddInitiative = () => {
        setEditingId(null);
        setShowModal(true);
    };

    const handleEditInitiative = (id: string) => {
        setEditingId(id);
        setShowModal(true);
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

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="initiatives" />

            <main className="page-container">
                {/* Enhanced Page Header & Context */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Initiative Intake</h1>
                            <p className="text-sm text-neutral-500 mt-2">Capture decision-grade initiatives only</p>
                        </div>
                        <Button variant="secondary" onClick={handleAddInitiative}>+ Add Initiative</Button>
                    </div>
                </div>

                {/* Enhanced Summary Metrics Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">Total Initiatives</div>
                        <div className="text-3xl font-bold text-neutral-900">{initiatives.length}</div>
                    </div>
                    <div className="card p-6 bg-status-green-bg/30">
                        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">Complete</div>
                        <div className="text-3xl font-bold text-status-green">{completeCount}</div>
                    </div>
                    <div className="card p-6 bg-status-red-bg/40 border-l-4 border-l-status-red">
                        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">Incomplete</div>
                        <div className="text-3xl font-bold text-status-red">{incompleteCount}</div>
                    </div>
                    <div className="card p-6">
                        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 mb-3">Total Value</div>
                        <div className="text-2xl font-bold text-neutral-900 font-mono">
                            {formatCurrency(initiatives.reduce((sum, i) => sum + i.estimatedValue, 0))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Filter Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'all'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                            }`}
                        style={{ borderRadius: '2px' }}
                    >
                        All ({initiatives.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('complete')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'complete'
                            ? 'bg-status-green text-white'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                            }`}
                        style={{ borderRadius: '2px' }}
                    >
                        Complete ({completeCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus('incomplete')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'incomplete'
                            ? 'bg-status-red text-white'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                            }`}
                        style={{ borderRadius: '2px' }}
                    >
                        Incomplete ({incompleteCount})
                    </button>
                </div>

                {/* Enhanced Initiative Table */}
                <div className="bg-white border border-neutral-200 rounded overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider" style={{ width: '25%' }}>Initiative Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Sponsor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Delivery Owner</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Strategic Alignment</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Estimated Value</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Risk Score</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInitiatives.map((initiative) => (
                                <tr
                                    key={initiative.id}
                                    className={`border-b border-neutral-100 last:border-0 transition-colors ${!initiative.isComplete
                                            ? 'border-l-4 border-l-status-red bg-status-red-bg/30'
                                            : 'hover:bg-neutral-50'
                                        }`}
                                >
                                    <td className="px-4 py-4 font-medium text-neutral-900">{initiative.name}</td>
                                    <td className="px-4 py-4 text-neutral-700">{initiative.sponsor}</td>
                                    <td className="px-4 py-4 text-neutral-700">{initiative.deliveryOwner}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="inline-flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span
                                                    key={star}
                                                    className={star <= initiative.strategicAlignment ? 'text-status-green' : 'text-neutral-300'}
                                                >
                                                    ★
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
                            ))}
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
                />
            )}
        </div>
    );
}

function InitiativeModal({ onClose, editingId }: { onClose: () => void; editingId: string | null }) {
    const [formData, setFormData] = useState({
        name: '',
        sponsor: '',
        deliveryOwner: '',
        strategicAlignment: '',
        estimatedValue: '',
        riskScore: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        console.log('Saving initiative:', formData);
        alert('Initiative saved successfully');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg" style={{ borderRadius: '2px' }}>
                <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-100">
                    <h2 className="text-xl font-semibold">
                        {editingId ? 'Edit Initiative' : 'Add New Initiative'}
                    </h2>
                    <p className="text-sm text-neutral-600 mt-1">All fields marked with * are mandatory</p>
                </div>

                <div className="px-6 py-6">
                    <div className="grid grid-cols-2 gap-6">
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
                            id="strategicAlignment"
                            name="strategicAlignment"
                            label="Strategic Alignment Score *"
                            value={formData.strategicAlignment}
                            onChange={handleChange}
                            options={[
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

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-4 pb-2 border-b border-neutral-200">Capacity Demand</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <Input
                                    label="Role *"
                                    type="text"
                                    placeholder="e.g., Engineer"
                                />
                                <Input
                                    label="Units Required *"
                                    type="number"
                                    placeholder="40"
                                />
                                <div className="flex items-end">
                                    <Button variant="text" size="sm" className="text-status-red">Remove</Button>
                                </div>
                            </div>
                            <Button variant="text" size="sm" className="text-status-green">+ Add Another Role</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-200 px-6 py-4 flex justify-between items-center bg-neutral-50">
                    <p className="text-xs text-neutral-600">* All fields are mandatory for initiative to be complete</p>
                    <div className="flex gap-3">
                        <Button variant="text" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save Initiative</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
