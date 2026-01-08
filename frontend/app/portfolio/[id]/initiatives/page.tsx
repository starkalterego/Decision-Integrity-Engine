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
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="initiatives" />

            <main className="page-container">
                <div className="section-header">
                    <div>
                        <h1 className="text-2xl font-semibold">Initiative Intake</h1>
                        <p className="text-sm text-neutral-600 mt-1">Capture decision-grade initiatives only</p>
                    </div>
                    <Button onClick={handleAddInitiative}>Add Initiative</Button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Initiative Name</th>
                                <th>Sponsor</th>
                                <th>Delivery Owner</th>
                                <th>Strategic Alignment</th>
                                <th>Estimated Value</th>
                                <th>Risk Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initiatives.map((initiative) => (
                                <tr
                                    key={initiative.id}
                                    className={!initiative.isComplete ? 'border-l-4 border-l-status-red' : ''}
                                >
                                    <td className="font-medium">{initiative.name}</td>
                                    <td>{initiative.sponsor}</td>
                                    <td>{initiative.deliveryOwner}</td>
                                    <td>
                                        <span className="font-mono">{initiative.strategicAlignment}/5</span>
                                    </td>
                                    <td className="font-mono">{formatCurrency(initiative.estimatedValue)}</td>
                                    <td>
                                        <span className={`font-mono ${initiative.riskScore >= 4 ? 'text-status-red font-semibold' : ''
                                            }`}>
                                            {initiative.riskScore}/5
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`text-xs px-2 py-1 ${initiative.isComplete
                                                ? 'bg-status-green-bg text-status-green'
                                                : 'bg-status-red-bg text-status-red'
                                            }`} style={{ borderRadius: '2px' }}>
                                            {initiative.isComplete ? 'Complete' : 'Incomplete'}
                                        </span>
                                    </td>
                                    <td>
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

                <div className="mt-6 p-4 bg-status-red-bg border border-status-red-border text-sm text-status-red">
                    <strong>Governance Rule:</strong> Incomplete initiatives cannot be prioritized or modeled.
                    All mandatory fields must be filled before an initiative can participate in decision-making.
                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '2px' }}>
                <div className="border-b border-neutral-200 px-6 py-4">
                    <h2 className="text-xl font-semibold">
                        {editingId ? 'Edit Initiative' : 'Add Initiative'}
                    </h2>
                </div>

                <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="name"
                            name="name"
                            label="Initiative Name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., CRM Modernization"
                        />

                        <Input
                            id="sponsor"
                            name="sponsor"
                            label="Sponsor"
                            type="text"
                            value={formData.sponsor}
                            onChange={handleChange}
                            placeholder="e.g., CRO"
                        />

                        <Input
                            id="deliveryOwner"
                            name="deliveryOwner"
                            label="Delivery Owner"
                            type="text"
                            value={formData.deliveryOwner}
                            onChange={handleChange}
                            placeholder="e.g., IT"
                        />

                        <Select
                            id="strategicAlignment"
                            name="strategicAlignment"
                            label="Strategic Alignment Score"
                            value={formData.strategicAlignment}
                            onChange={handleChange}
                            options={[
                                { value: '1', label: '1 - Low' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3 - Medium' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5 - High' },
                            ]}
                        />

                        <Input
                            id="estimatedValue"
                            name="estimatedValue"
                            label="Estimated Value (₹)"
                            type="number"
                            value={formData.estimatedValue}
                            onChange={handleChange}
                            placeholder="35000000"
                        />

                        <Select
                            id="riskScore"
                            name="riskScore"
                            label="Risk Score"
                            value={formData.riskScore}
                            onChange={handleChange}
                            options={[
                                { value: '1', label: '1 - Low' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3 - Medium' },
                                { value: '4', label: '4' },
                                { value: '5', label: '5 - High' },
                            ]}
                        />
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-3">Capacity Demand</h3>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-3">
                                <Input
                                    label="Role"
                                    type="text"
                                    placeholder="e.g., Engineer"
                                />
                                <Input
                                    label="Units Required"
                                    type="number"
                                    placeholder="40"
                                />
                                <div className="flex items-end">
                                    <Button variant="text" size="sm">Remove</Button>
                                </div>
                            </div>
                            <Button variant="text" size="sm">+ Add Role</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-200 px-6 py-4 flex justify-end gap-3">
                    <Button variant="text" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Initiative</Button>
                </div>
            </div>
        </div>
    );
}
