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
        // Clear error when user starts typing
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
                <div className="section-header">
                    <div>
                        <h1 className="text-2xl font-semibold">Portfolio Setup</h1>
                        <p className="text-sm text-neutral-600 mt-1">Define the decision boundary for this portfolio</p>
                    </div>
                    {isLocked && <StatusBadge status="green" text="Locked" />}
                    {!isLocked && <StatusBadge status="red" text="Draft" />}
                </div>

                <div className="card max-w-2xl">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <Input
                            id="name"
                            name="name"
                            label="Portfolio Name"
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
                            label="Fiscal Period"
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

                        <Input
                            id="totalBudget"
                            name="totalBudget"
                            label="Total Budget (₹)"
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
                            label="Total Capacity (units)"
                            type="number"
                            value={formData.totalCapacity}
                            onChange={handleChange}
                            error={errors.totalCapacity}
                            disabled={isLocked}
                            placeholder="450"
                            helperText="Total capacity units available across all roles"
                        />

                        <div className="divider"></div>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleSaveDraft}
                                disabled={isLocked}
                            >
                                Save Draft
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleLockPortfolio}
                                disabled={!isFormValid || isLocked}
                            >
                                Lock Portfolio
                            </Button>
                        </div>

                        {isLocked && (
                            <div className="mt-4 p-4 bg-status-green-bg border border-status-green-border text-sm text-status-green">
                                <strong>Portfolio Locked:</strong> This portfolio cannot be edited once scenarios exist.
                                All constraints are now fixed.
                            </div>
                        )}
                    </form>
                </div>

                <div className="mt-8 p-4 bg-white border border-neutral-200" style={{ borderRadius: '2px' }}>
                    <h3 className="font-semibold mb-2 text-sm">Governance Rules</h3>
                    <ul className="text-sm text-neutral-700 space-y-1">
                        <li>• All fields are mandatory before portfolio can be locked</li>
                        <li>• Portfolio cannot be edited once scenarios exist</li>
                        <li>• Budget and capacity are hard constraints for all scenarios</li>
                        <li>• Validation errors must be resolved before proceeding</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
