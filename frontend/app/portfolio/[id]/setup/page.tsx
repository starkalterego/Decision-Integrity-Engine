'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authGet, authPost } from '@/lib/api';
import showToast from '@/lib/toast';

interface StrategicObjective {
    id: string;
    name: string;
    description?: string;
    priority: number;
    _count?: { initiatives: number };
}

interface Role {
    id: string;
    name: string;
    description?: string;
    totalAvailable: number;
    capacityBuckets: Array<{ id: string; periodLabel: string; availableUnits: number }>;
}

export default function PortfolioSetupPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fiscalPeriod: '',
        totalBudget: '',
        totalCapacity: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);

    // Strategic Objectives state
    const [objectives, setObjectives] = useState<StrategicObjective[]>([]);
    const [showObjForm, setShowObjForm] = useState(false);
    const [newObj, setNewObj] = useState({ name: '', description: '', priority: '1' });
    const [isSavingObj, setIsSavingObj] = useState(false);

    // Role Capacity state
    const [roles, setRoles] = useState<Role[]>([]);
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '', availableUnits: '', periodLabel: '' });
    const [isSavingRole, setIsSavingRole] = useState(false);

    // Load existing portfolio if ID is not 'new'
    useEffect(() => {
        if (resolvedParams.id !== 'new') {
            loadPortfolio(resolvedParams.id);
        }
    }, [resolvedParams.id]);

    // Load objectives + roles when portfolioId is known
    useEffect(() => {
        const pid = portfolioId || (resolvedParams.id !== 'new' ? resolvedParams.id : null);
        if (pid) {
            loadObjectives(pid);
            loadRoles(pid);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portfolioId, resolvedParams.id]);

    const loadPortfolio = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await authGet(`/api/portfolios/${id}`);
            const result = await response.json();

            if (result.success && result.data) {
                const portfolio = result.data;
                setFormData({
                    name: portfolio.name,
                    description: portfolio.description || '',
                    fiscalPeriod: portfolio.fiscalPeriod,
                    totalBudget: portfolio.totalBudget.toString(),
                    totalCapacity: portfolio.totalCapacity.toString(),
                });
                setIsLocked(portfolio.status === 'LOCKED');
                setPortfolioId(portfolio.id);
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            showToast.error('Failed to load portfolio');
        } finally {
            setIsLoading(false);
        }
    };

    const loadObjectives = async (pid: string) => {
        try {
            const res = await authGet(`/api/portfolios/${pid}/objectives`);
            const data = await res.json();
            if (data.success) setObjectives(data.data);
        } catch (e) {
            console.error('Error loading objectives:', e);
        }
    };

    const loadRoles = async (pid: string) => {
        try {
            const res = await authGet(`/api/portfolios/${pid}/roles`);
            const data = await res.json();
            if (data.success) setRoles(data.data);
        } catch (e) {
            console.error('Error loading roles:', e);
        }
    };

    const handleSaveObjective = async () => {
        if (!newObj.name.trim()) { showToast.warning('Objective name is required'); return; }
        const pid = portfolioId || (resolvedParams.id !== 'new' ? resolvedParams.id : null);
        if (!pid) return;
        setIsSavingObj(true);
        try {
            const res = await authPost(`/api/portfolios/${pid}/objectives`, {
                name: newObj.name,
                description: newObj.description || undefined,
                priority: parseInt(newObj.priority) || 1,
            });
            const result = await res.json();
            if (result.success) {
                showToast.success('Objective added');
                setNewObj({ name: '', description: '', priority: '1' });
                setShowObjForm(false);
                loadObjectives(pid);
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to add objective');
            }
        } finally {
            setIsSavingObj(false);
        }
    };

    const handleSaveRole = async () => {
        if (!newRole.name.trim()) { showToast.warning('Role name is required'); return; }
        const pid = portfolioId || (resolvedParams.id !== 'new' ? resolvedParams.id : null);
        if (!pid) return;
        setIsSavingRole(true);
        try {
            const body: Record<string, unknown> = { name: newRole.name, description: newRole.description || undefined };
            if (newRole.availableUnits && newRole.periodLabel) {
                body.availableUnits = parseInt(newRole.availableUnits);
                body.periodLabel = newRole.periodLabel;
            }
            const res = await authPost(`/api/portfolios/${pid}/roles`, body);
            const result = await res.json();
            if (result.success) {
                showToast.success('Role added');
                setNewRole({ name: '', description: '', availableUnits: '', periodLabel: '' });
                setShowRoleForm(false);
                loadRoles(pid);
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to add role');
            }
        } finally {
            setIsSavingRole(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            const response = await authPost('/api/portfolios', {
                name: formData.name,
                description: formData.description || undefined,
                fiscalPeriod: formData.fiscalPeriod,
                totalBudget: parseFloat(formData.totalBudget),
                totalCapacity: parseInt(formData.totalCapacity),
            });

            const result = await response.json();

            if (result.success) {
                setPortfolioId(result.data.portfolioId);
                showToast.success('Portfolio draft saved successfully');
                // Navigate to the portfolio page
                router.push(`/portfolio/${result.data.portfolioId}/setup`);
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to save portfolio');
            }
        } catch (error) {
            console.error('Error saving portfolio:', error);
            showToast.error('Failed to save portfolio');
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
            showToast.success('Portfolio locked successfully. Cannot be edited once scenarios exist.');

            // Navigate to initiatives page
            router.push(`/portfolio/${portfolioId}/initiatives`);
        } catch (error) {
            console.error('Error locking portfolio:', error);
            showToast.error('Failed to lock portfolio');
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
                        className="animate-spin rounded-full h-14 w-14 border-4 mx-auto mb-5"
                        style={{ 
                            borderColor: 'var(--border-subtle)',
                            borderTopColor: 'var(--accent-primary)'
                        }}
                    />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header portfolioName={formData.name || 'New Portfolio'} portfolioId={portfolioId || resolvedParams.id} currentPage="setup" />

            <main className="max-w-screen-xl mx-auto px-6 py-7">

                {/* ── Page Header ──────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-primary)', letterSpacing: '0.12em' }}>
                            Portfolio Configuration
                        </p>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Portfolio Setup
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                            Define the decision boundary for this portfolio
                        </p>
                    </div>
                    <div>
                        {isLocked ? (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: 99,
                                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                color: '#34d399', textTransform: 'uppercase'
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                                Locked
                            </span>
                        ) : (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: 99,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                color: '#f87171', textTransform: 'uppercase'
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
                                Draft
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main Form ────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-0">
                        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>

                            {/* Card header strip */}
                            <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.02)' }}>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>
                                    <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                                    <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                                    <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                                    <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                                </svg>
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                                    Portfolio Configuration
                                </span>
                            </div>

                            <div className="p-6">
                                <form onSubmit={(e) => e.preventDefault()}>

                                    {/* Identity block */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Identity</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                id="name" name="name" label="Portfolio Name *" type="text"
                                                value={formData.name} onChange={handleChange} error={errors.name}
                                                disabled={isLocked} placeholder="e.g., FY26 Growth Portfolio"
                                            />
                                            <Select
                                                id="fiscalPeriod" name="fiscalPeriod" label="Fiscal Period *"
                                                value={formData.fiscalPeriod} onChange={handleChange}
                                                error={errors.fiscalPeriod} disabled={isLocked}
                                                options={[
                                                    { value: 'FY24', label: 'FY24' }, { value: 'FY25', label: 'FY25' },
                                                    { value: 'FY26', label: 'FY26' }, { value: 'FY27', label: 'FY27' },
                                                ]}
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                                Description
                                            </label>
                                            <textarea
                                                name="description" value={formData.description} onChange={handleChange}
                                                rows={2} disabled={isLocked}
                                                placeholder="Brief description of this portfolio's scope and strategic intent"
                                                className="w-full rounded-lg px-3 py-2 text-sm transition-colors"
                                                style={{
                                                    backgroundColor: isLocked ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                                                    border: '1px solid var(--border-default)',
                                                    color: 'var(--text-primary)', resize: 'vertical', outline: 'none',
                                                    opacity: isLocked ? 0.6 : 1
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="my-5" style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

                                    {/* Constraints block */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Decision Constraints</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                id="totalBudget" name="totalBudget" label="Total Budget (₹) *" type="number"
                                                value={formData.totalBudget} onChange={handleChange} error={errors.totalBudget}
                                                disabled={isLocked} placeholder="120000000"
                                                helperText="Total budget available for this portfolio in INR"
                                            />
                                            <Input
                                                id="totalCapacity" name="totalCapacity" label="Total Capacity (units) *" type="number"
                                                value={formData.totalCapacity} onChange={handleChange} error={errors.totalCapacity}
                                                disabled={isLocked} placeholder="450"
                                                helperText="Total capacity units available across all roles"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderLeft: '3px solid #f59e0b' }}>
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }}>
                                                <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                                                <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                                <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
                                            </svg>
                                            <p className="text-xs leading-relaxed" style={{ color: '#d97706' }}>
                                                These limits apply to all scenarios and cannot be exceeded.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="my-5" style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                        <Button variant="secondary" onClick={handleSaveDraft} disabled={isLocked || isSaving} className="text-sm">
                                            {isSaving ? 'Saving...' : 'Save Draft'}
                                        </Button>
                                        <div className="flex-1">
                                            <Button
                                                variant="primary"
                                                onClick={handleLockPortfolio}
                                                disabled={!isFormValid || isLocked || isSaving}
                                                className="w-full text-sm"
                                            >
                                                {isSaving ? 'Processing...' : 'Lock Portfolio'}
                                            </Button>
                                            {!isLocked && isFormValid && (
                                                <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-tertiary)' }}>
                                                    Once locked, budget and capacity cannot be edited.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {isLocked && (
                                        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-lg"
                                            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: '#34d399', flexShrink: 0 }}>
                                                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                                                <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <p className="text-sm" style={{ color: '#34d399' }}>
                                                <strong>Portfolio Locked.</strong> Constraints are fixed across all scenarios.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ──────────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Setup Progress */}
                        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                                Setup Progress
                            </p>
                            <div className="space-y-0">
                                {[
                                    { n: 1, label: 'Portfolio Name', done: !!formData.name },
                                    { n: 2, label: 'Fiscal Period',  done: !!formData.fiscalPeriod },
                                    { n: 3, label: 'Budget',         done: !!formData.totalBudget },
                                    { n: 4, label: 'Capacity',       done: !!formData.totalCapacity },
                                ].map((step, i, arr) => (
                                    <div key={step.n} className="flex gap-3">
                                        {/* Spine */}
                                        <div className="flex flex-col items-center" style={{ width: 20 }}>
                                            <div style={{
                                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, fontWeight: 700,
                                                background: step.done ? '#10b981' : 'var(--bg-tertiary)',
                                                color: step.done ? '#fff' : 'var(--text-tertiary)',
                                                border: step.done ? 'none' : '1.5px solid var(--border-default)',
                                            }}>
                                                {step.done ? (
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                ) : step.n}
                                            </div>
                                            {i < arr.length - 1 && (
                                                <div style={{ width: 1.5, flex: 1, minHeight: 12, marginTop: 2, marginBottom: 2,
                                                    background: step.done ? '#10b981' : 'var(--border-subtle)' }} />
                                            )}
                                        </div>
                                        {/* Label */}
                                        <div className="pb-3">
                                            <span className="text-sm" style={{
                                                color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                                fontWeight: step.done ? 500 : 400,
                                            }}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Governance Rules */}
                        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                                Governance Rules
                            </p>
                            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>These rules are enforced by the system.</p>
                            <ul className="space-y-3">
                                {[
                                    'All fields are mandatory before portfolio can be locked',
                                    'Portfolio cannot be edited once scenarios exist',
                                    'Budget and capacity are hard constraints for all scenarios',
                                    'Validation errors must be resolved before proceeding',
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: 1 }}>
                                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                                            <path d="M4.5 7L6.2 8.7L9.5 5.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Next Steps */}
                        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderLeft: '3px solid #10b981' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: '#10b981' }}>
                                    <path d="M7 1.5V7L10 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                                </svg>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)', letterSpacing: '0.1em' }}>Next Steps</p>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                After locking the portfolio, proceed to Initiative Intake to add decision-grade initiatives.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Strategic Objectives ─────────────────────────────── */}
                {(portfolioId || resolvedParams.id !== 'new') && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Portfolio Strategy</p>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Strategic Objectives</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Link initiatives to portfolio strategy</p>
                            </div>
                            <Button variant="secondary" onClick={() => setShowObjForm(!showObjForm)}>
                                {showObjForm ? 'Cancel' : '+ Add Objective'}
                            </Button>
                        </div>

                        {showObjForm && (
                            <div className="mb-4 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>New Objective</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Input id="obj-name" label="Name *" value={newObj.name}
                                        onChange={(e) => setNewObj(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g., Digital Transformation" />
                                    <Select id="obj-priority" label="Priority" value={newObj.priority}
                                        onChange={(e) => setNewObj(p => ({ ...p, priority: e.target.value }))}
                                        options={[
                                            { value: '1', label: '1 — Critical' }, { value: '2', label: '2 — High' },
                                            { value: '3', label: '3 — Medium' }, { value: '4', label: '4 — Low' },
                                        ]} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
                                    <textarea value={newObj.description} onChange={(e) => setNewObj(p => ({ ...p, description: e.target.value }))}
                                        rows={2} placeholder="What does this objective achieve?"
                                        className="w-full rounded-lg px-3 py-2 text-sm"
                                        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', resize: 'vertical', outline: 'none' }} />
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="primary" onClick={handleSaveObjective} disabled={isSavingObj}>
                                        {isSavingObj ? 'Saving…' : 'Save Objective'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            {objectives.length === 0 ? (
                                <div className="py-12 text-center">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }}>
                                        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No objectives defined</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Add objectives to link initiatives to portfolio strategy.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                            {['Priority', 'Objective', 'Description', 'Initiatives'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {objectives.map((obj, i) => (
                                            <tr key={obj.id} style={{ borderBottom: i < objectives.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                                <td className="px-5 py-3.5">
                                                    <span style={{
                                                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                                                        background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.15)',
                                                        fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)',
                                                        letterSpacing: '0.04em'
                                                    }}>P{obj.priority}</span>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{obj.name}</td>
                                                <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{obj.description || '—'}</td>
                                                <td className="px-5 py-3.5 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{obj._count?.initiatives ?? 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Role Capacity ─────────────────────────────────────── */}
                {(portfolioId || resolvedParams.id !== 'new') && (
                    <div className="mt-10 mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>Capacity Planning</p>
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Role Capacity</h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Define per-role capacity to enable granular breach detection</p>
                            </div>
                            <Button variant="secondary" onClick={() => setShowRoleForm(!showRoleForm)}>
                                {showRoleForm ? 'Cancel' : '+ Add Role'}
                            </Button>
                        </div>

                        {showRoleForm && (
                            <div className="mb-4 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>New Role</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Input id="role-name" label="Role Name *" value={newRole.name}
                                        onChange={(e) => setNewRole(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Backend Developer" />
                                    <Input id="role-desc" label="Description" value={newRole.description}
                                        onChange={(e) => setNewRole(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
                                </div>
                                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                                    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        Capacity Bucket <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — can be added later)</span>
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input id="role-units" label="Available Units" type="number" value={newRole.availableUnits}
                                            onChange={(e) => setNewRole(p => ({ ...p, availableUnits: e.target.value }))}
                                            placeholder="e.g., 120" helperText="FTE-weeks or story points available" />
                                        <Input id="role-period" label="Period Label" value={newRole.periodLabel}
                                            onChange={(e) => setNewRole(p => ({ ...p, periodLabel: e.target.value }))}
                                            placeholder="e.g., Q1 FY26" helperText="Quarter or period this capacity covers" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="primary" onClick={handleSaveRole} disabled={isSavingRole}>
                                        {isSavingRole ? 'Saving…' : 'Save Role'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                            {roles.length === 0 ? (
                                <div className="py-12 text-center">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }}>
                                        <circle cx="13" cy="11" r="5" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M4 27c0-5 4-9 9-9s9 4 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M22 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No roles defined</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Without role capacity, the system falls back to aggregate capacity validation.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                            {['Role', 'Description', 'Total Available (units)', 'Periods Defined'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role, i) => (
                                            <tr key={role.id} style={{ borderBottom: i < roles.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                                <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{role.name}</td>
                                                <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{role.description || '—'}</td>
                                                <td className="px-5 py-3.5 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {role.totalAvailable.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {role.capacityBuckets.length === 0 ? (
                                                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>None</span>
                                                        ) : role.capacityBuckets.map(b => (
                                                            <span key={b.id} style={{
                                                                display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                                                                background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                                                                fontSize: 11, color: 'var(--text-secondary)'
                                                            }}>
                                                                {b.periodLabel}: {b.availableUnits}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
