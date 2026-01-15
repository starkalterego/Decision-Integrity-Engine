'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PortfolioSetupPage() {
    const [formData, setFormData] = useState({
        name: '',
        fiscalPeriod: '',
        totalBudget: '',
        totalCapacity: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Portfolio name is required';
        }
        if (!formData.fiscalPeriod) {
            newErrors.fiscalPeriod = 'Fiscal period is required';
        }
        if (!formData.totalBudget || parseFloat(formData.totalBudget) <= 0) {
            newErrors.totalBudget = 'Total budget must be greater than 0';
        }
        if (!formData.totalCapacity || parseInt(formData.totalCapacity) <= 0) {
            newErrors.totalCapacity = 'Total capacity must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = () => {
        if (validate()) {
            console.log('Saving draft:', formData);
            alert('Portfolio draft saved successfully');
        }
    };

    const handleLockPortfolio = () => {
        if (validate()) {
            setIsLocked(true);
            console.log('Locking portfolio:', formData);
            alert('Portfolio locked successfully. Cannot be edited once scenarios exist.');
        }
    };

    const isFormValid = formData.name && formData.fiscalPeriod && formData.totalBudget && formData.totalCapacity;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName={formData.name || 'New Portfolio'} portfolioId="demo" currentPage="setup" />

            <main className="page-container">
                {/* Enhanced Page Title & Intent */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Portfolio Setup</h1>
                            <p className="text-sm text-neutral-500 mt-2">Define the decision boundary for this portfolio</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isLocked && <StatusBadge status="green" text="Locked" />}
                            {!isLocked && <StatusBadge status="red" text="Draft" />}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {/* Main Form - 2 columns */}
                    <div className="col-span-2">
                        <div className="card p-8">
                            <h2 className="text-lg font-semibold mb-8 pb-4 border-b border-neutral-200">Portfolio Configuration</h2>

                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Block 1 - Portfolio Identity */}
                                <div className="mb-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            id="name"
                                            name="name"
                                            label="Portfolio Name *"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={errors.name}
                                            disabled={isLocked}
                                            placeholder="e.g., FY26 Growth Portfolio"
                                        />

                                        <Select
                                            id="fiscalPeriod"
                                            name="fiscalPeriod"
                                            label="Fiscal Period *"
                                            value={formData.fiscalPeriod}
                                            onChange={handleChange}
                                            error={errors.fiscalPeriod}
                                            disabled={isLocked}
                                            options={[
                                                { value: 'FY24', label: 'FY24' },
                                                { value: 'FY25', label: 'FY25' },
                                                { value: 'FY26', label: 'FY26' },
                                                { value: 'FY27', label: 'FY27' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Subtle Divider */}
                                <div className="border-t border-neutral-100 mb-8"></div>

                                {/* Block 2 - Decision Constraints */}
                                <div className="mb-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            id="totalBudget"
                                            name="totalBudget"
                                            label="Total Budget (₹) *"
                                            type="number"
                                            value={formData.totalBudget}
                                            onChange={handleChange}
                                            error={errors.totalBudget}
                                            disabled={isLocked}
                                            placeholder="120000000"
                                            helperText="Total budget available for this portfolio in INR"
                                        />

                                        <Input
                                            id="totalCapacity"
                                            name="totalCapacity"
                                            label="Total Capacity (units) *"
                                            type="number"
                                            value={formData.totalCapacity}
                                            onChange={handleChange}
                                            error={errors.totalCapacity}
                                            disabled={isLocked}
                                            placeholder="450"
                                            helperText="Total capacity units available across all roles"
                                        />
                                    </div>

                                    {/* Constraint Note */}
                                    <div className="mt-4 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded">
                                        <p className="text-xs text-neutral-600 leading-relaxed">
                                            These limits apply to all scenarios and cannot be exceeded.
                                        </p>
                                    </div>
                                </div>

                                <div className="divider"></div>

                                {/* Primary Actions - Critical Moment Design */}
                                <div className="flex gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={handleSaveDraft}
                                        disabled={isLocked}
                                    >
                                        Save Draft
                                    </Button>
                                    <div className="flex-1">
                                        <Button
                                            variant="primary"
                                            onClick={handleLockPortfolio}
                                            disabled={!isFormValid || isLocked}
                                            className="w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                                        >
                                            Lock Portfolio
                                        </Button>
                                        {!isLocked && isFormValid && (
                                            <p className="text-xs text-neutral-500 mt-2 text-center">
                                                Once locked, budget and capacity cannot be edited.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isLocked && (
                                    <div className="mt-6 p-4 bg-status-green-bg border border-status-green-border text-sm text-status-green rounded">
                                        <strong>✓ Portfolio Locked:</strong> This portfolio cannot be edited once scenarios exist.
                                        All constraints are now fixed.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Enhanced Setup Progress Panel */}
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold mb-5 text-neutral-900">Setup Progress</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${formData.name ? 'bg-status-green text-white' : 'bg-neutral-200 text-neutral-500'
                                        }`}>
                                        {formData.name ? '✓' : '1'}
                                    </div>
                                    <span className={`text-sm ${formData.name ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}>
                                        Portfolio Name
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${formData.fiscalPeriod ? 'bg-status-green text-white' : 'bg-neutral-200 text-neutral-500'
                                        }`}>
                                        {formData.fiscalPeriod ? '✓' : '2'}
                                    </div>
                                    <span className={`text-sm ${formData.fiscalPeriod ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}>
                                        Fiscal Period
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${formData.totalBudget ? 'bg-status-green text-white' : 'bg-neutral-200 text-neutral-500'
                                        }`}>
                                        {formData.totalBudget ? '✓' : '3'}
                                    </div>
                                    <span className={`text-sm ${formData.totalBudget ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}>
                                        Budget
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${formData.totalCapacity ? 'bg-status-green text-white' : 'bg-neutral-200 text-neutral-500'
                                        }`}>
                                        {formData.totalCapacity ? '✓' : '4'}
                                    </div>
                                    <span className={`text-sm ${formData.totalCapacity ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}>
                                        Capacity
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Governance Rules */}
                        <div className="card bg-neutral-100 p-6 border-l-2 border-l-neutral-400">
                            <h3 className="text-sm font-semibold mb-2 text-neutral-900">Governance Rules</h3>
                            <p className="text-xs text-neutral-600 mb-5">These rules are enforced by the system.</p>
                            <ul className="text-xs text-neutral-700 space-y-3.5 leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="text-neutral-400 mt-0.5">•</span>
                                    <span>All fields are mandatory before portfolio can be locked</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-neutral-400 mt-0.5">•</span>
                                    <span>Portfolio cannot be edited once scenarios exist</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-neutral-400 mt-0.5">•</span>
                                    <span>Budget and capacity are hard constraints for all scenarios</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-neutral-400 mt-0.5">•</span>
                                    <span>Validation errors must be resolved before proceeding</span>
                                </li>
                            </ul>
                        </div>

                        {/* Enhanced Next Steps */}
                        <div className="card border-l-4 border-l-accent-primary p-6">
                            <h3 className="text-sm font-semibold mb-3 text-neutral-900">Next Steps</h3>
                            <p className="text-xs text-neutral-700 leading-relaxed">
                                After locking the portfolio, proceed to Initiative Intake to add decision-grade initiatives.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
