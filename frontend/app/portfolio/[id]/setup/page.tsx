'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PortfolioSetupPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const [formData, setFormData] = useState({
        name: '',
        fiscalPeriod: '',
        totalBudget: '',
        totalCapacity: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);

    // Load existing portfolio if ID is not 'new'
    useEffect(() => {
        if (resolvedParams.id !== 'new') {
            loadPortfolio(resolvedParams.id);
        }
    }, [resolvedParams.id]);

    const loadPortfolio = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/portfolios/${id}`);
            const result = await response.json();

            if (result.success && result.data) {
                const portfolio = result.data;
                setFormData({
                    name: portfolio.name,
                    fiscalPeriod: portfolio.fiscalPeriod,
                    totalBudget: portfolio.totalBudget.toString(),
                    totalCapacity: portfolio.totalCapacity.toString(),
                });
                setIsLocked(portfolio.status === 'LOCKED');
                setPortfolioId(portfolio.id);
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            alert('Failed to load portfolio');
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleSaveDraft = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/portfolios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    fiscalPeriod: formData.fiscalPeriod,
                    totalBudget: parseFloat(formData.totalBudget),
                    totalCapacity: parseInt(formData.totalCapacity),
                }),
            });

            const result = await response.json();

            if (result.success) {
                setPortfolioId(result.data.portfolioId);
                alert('Portfolio draft saved successfully');
                // Navigate to the portfolio page
                router.push(`/portfolio/${result.data.portfolioId}/setup`);
            } else {
                alert('Failed to save portfolio: ' + (result.errors[0]?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving portfolio:', error);
            alert('Failed to save portfolio');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLockPortfolio = async () => {
        if (!validate()) return;

        if (!portfolioId) {
            // Need to save first
            await handleSaveDraft();
            return;
        }

        setIsSaving(true);
        try {
            // In MVP, we just set the status to LOCKED
            // In production, this would be a separate API endpoint
            setIsLocked(true);
            alert('Portfolio locked successfully. Cannot be edited once scenarios exist.');

            // Navigate to initiatives page
            router.push(`/portfolio/${portfolioId}/initiatives`);
        } catch (error) {
            console.error('Error locking portfolio:', error);
            alert('Failed to lock portfolio');
        } finally {
            setIsSaving(false);
        }
    };

    const isFormValid = formData.name && formData.fiscalPeriod && formData.totalBudget && formData.totalCapacity;

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
                    <p style={{ color: 'var(--text-secondary)' }}>Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <Header portfolioName={formData.name || 'New Portfolio'} portfolioId={portfolioId || resolvedParams.id} currentPage="setup" />

            <main className="page-container">
                {/* Enhanced Page Title & Intent */}
                <div className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 
                                className="text-3xl font-bold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Portfolio Setup
                            </h1>
                            <p 
                                className="text-sm mt-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Define the decision boundary for this portfolio
                            </p>
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
                        <div 
                            className="card p-8"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)'
                            }}
                        >
                            <h2 
                                className="text-lg font-semibold mb-8 pb-4"
                                style={{ 
                                    color: 'var(--text-primary)',
                                    borderBottom: '1px solid var(--border-default)'
                                }}
                            >
                                Portfolio Configuration
                            </h2>

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
                                <div 
                                    className="border-t mb-8"
                                    style={{ borderColor: 'var(--border-subtle)' }}
                                />

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
                                    <div 
                                        className="mt-4 px-4 py-3 rounded"
                                        style={{ 
                                            backgroundColor: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-default)'
                                        }}
                                    >
                                        <p 
                                            className="text-xs leading-relaxed"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
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
                                        disabled={isLocked || isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Draft'}
                                    </Button>
                                    <div className="flex-1">
                                        <Button
                                            variant="primary"
                                            onClick={handleLockPortfolio}
                                            disabled={!isFormValid || isLocked || isSaving}
                                            className="w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                                        >
                                            {isSaving ? 'Processing...' : 'Lock Portfolio'}
                                        </Button>
                                        {!isLocked && isFormValid && (
                                            <p 
                                                className="text-xs mt-2 text-center"
                                                style={{ color: 'var(--text-tertiary)' }}
                                            >
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
                        <div 
                            className="card p-6"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)'
                            }}
                        >
                            <h3 
                                className="text-sm font-semibold mb-5"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Setup Progress
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium`}
                                        style={{
                                            backgroundColor: formData.name ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                                            color: formData.name ? '#fff' : 'var(--text-tertiary)'
                                        }}
                                    >
                                        1
                                    </div>
                                    <span 
                                        className={`text-sm ${formData.name ? 'font-medium' : ''}`}
                                        style={{ color: formData.name ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    >
                                        Portfolio Name
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium`}
                                        style={{
                                            backgroundColor: formData.fiscalPeriod ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                                            color: formData.fiscalPeriod ? '#fff' : 'var(--text-tertiary)'
                                        }}
                                    >
                                        2
                                    </div>
                                    <span 
                                        className={`text-sm ${formData.fiscalPeriod ? 'font-medium' : ''}`}
                                        style={{ color: formData.fiscalPeriod ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    >
                                        Fiscal Period
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium`}
                                        style={{
                                            backgroundColor: formData.totalBudget ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                                            color: formData.totalBudget ? '#fff' : 'var(--text-tertiary)'
                                        }}
                                    >
                                        3
                                    </div>
                                    <span 
                                        className={`text-sm ${formData.totalBudget ? 'font-medium' : ''}`}
                                        style={{ color: formData.totalBudget ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    >
                                        Budget
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium`}
                                        style={{
                                            backgroundColor: formData.totalCapacity ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                                            color: formData.totalCapacity ? '#fff' : 'var(--text-tertiary)'
                                        }}
                                    >
                                        4
                                    </div>
                                    <span 
                                        className={`text-sm ${formData.totalCapacity ? 'font-medium' : ''}`}
                                        style={{ color: formData.totalCapacity ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                    >
                                        Capacity
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Governance Rules */}
                        <div 
                            className="card p-6"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)',
                                borderLeft: '2px solid var(--text-tertiary)'
                            }}
                        >
                            <h3 
                                className="text-sm font-semibold mb-2"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Governance Rules
                            </h3>
                            <p 
                                className="text-xs mb-5"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                These rules are enforced by the system.
                            </p>
                            <ul className="text-xs space-y-3.5 leading-relaxed">
                                <li 
                                    className="flex gap-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mt-0.5">•</span>
                                    <span>All fields are mandatory before portfolio can be locked</span>
                                </li>
                                <li 
                                    className="flex gap-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mt-0.5">•</span>
                                    <span>Portfolio cannot be edited once scenarios exist</span>
                                </li>
                                <li 
                                    className="flex gap-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mt-0.5">•</span>
                                    <span>Budget and capacity are hard constraints for all scenarios</span>
                                </li>
                                <li 
                                    className="flex gap-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <span style={{ color: 'var(--text-tertiary)' }} className="mt-0.5">•</span>
                                    <span>Validation errors must be resolved before proceeding</span>
                                </li>
                            </ul>
                        </div>

                        {/* Enhanced Next Steps */}
                        <div 
                            className="card p-6"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-default)',
                                borderLeft: '4px solid var(--accent-primary)'
                            }}
                        >
                            <h3 
                                className="text-sm font-semibold mb-3"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Next Steps
                            </h3>
                            <p 
                                className="text-xs leading-relaxed"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                After locking the portfolio, proceed to Initiative Intake to add decision-grade initiatives.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
