'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet, authPatch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';

interface Portfolio {
    id: string;
    name: string;
    fiscalPeriod: string;
    totalBudget: number;
    totalCapacity: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    owner?: string;
    _count: {
        initiatives: number;
        scenarios: number;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    _count?: {
        portfolios: number;
    };
}

interface GovernanceRecord {
    id: string;
    portfolioId: string;
    portfolioName: string;
    actionType: string;
    entityType: string;
    rationale: string | null;
    userId: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(true);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [governanceRecords, setGovernanceRecords] = useState<GovernanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        // Redirect executives to their specialized dashboard
        if (user.role === 'EXECUTIVE') {
            router.push('/dashboard/executive');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const portfolioResponse = await authGet('/api/portfolios');
                if (portfolioResponse.ok) {
                    const result = await portfolioResponse.json();
                    setPortfolios(result.data || []);
                }

                if (user?.role === 'PMO') {
                    const userResponse = await authGet('/api/admin/users');
                    if (userResponse.ok) {
                        const result = await userResponse.json();
                        setUsers(result.data?.users || []);
                    }

                    // Fetch governance records
                    const governanceResponse = await authGet('/api/governance?limit=10');
                    if (governanceResponse.ok) {
                        const result = await governanceResponse.json();
                        setGovernanceRecords(result.data?.records || []);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, router]);

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await authPatch('/api/admin/users', {
                userId,
                isActive: !currentStatus
            });

            if (response.ok) {
                setUsers(users.map(u => 
                    u.id === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-700 border-t-gray-400"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isAdmin = user.role === 'PMO';
    
    // Metrics calculations
    const activePortfolios = portfolios.filter(p => p.status === 'ACTIVE').length;
    const draftPortfolios = portfolios.filter(p => p.status === 'DRAFT').length;
    const lockedPortfolios = portfolios.filter(p => p.status === 'LOCKED').length;
    const totalScenarios = portfolios.reduce((sum, p) => sum + (p._count?.scenarios || 0), 0);
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    
    // Constraint breaches
    const budgetBreaches = portfolios.filter(p => p.totalBudget > 100).length;
    const capacityStress = portfolios.filter(p => p.totalCapacity > 50).length;
    
    // Decision pipeline
    const setupIncomplete = portfolios.filter(p => p.status === 'DRAFT').length;
    const pendingScenarios = portfolios.filter(p => p._count?.scenarios === 0 && p._count?.initiatives > 0).length;

    // Non-admin view (Portfolio Lead)
    if (!isAdmin) {
        return (
            <>
                <Header currentPage="dashboard" />
                <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                    <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-100 mb-1">Portfolio Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your portfolio decisions and scenarios</p>
                    </div>

                    <div className="space-y-6">
                        {portfolios.length > 0 ? (
                            <div className="bg-[#0f1419] border border-gray-800 rounded">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Portfolio</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Period</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Initiatives</th>
                                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Scenarios</th>
                                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolios.map((portfolio) => (
                                            <tr key={portfolio.id} className="border-b border-gray-800 hover:bg-[#14191f]">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-200">{portfolio.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{portfolio.fiscalPeriod}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                        portfolio.status === 'ACTIVE' ? 'bg-green-950 text-green-400' :
                                                        portfolio.status === 'LOCKED' ? 'bg-yellow-950 text-yellow-400' :
                                                        'bg-gray-800 text-gray-400'
                                                    }`}>
                                                        {portfolio.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400 text-right">{portfolio._count?.initiatives || 0}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400 text-right">{portfolio._count?.scenarios || 0}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/portfolio/${portfolio.id}/setup`} className="text-sm text-blue-400 hover:text-blue-300">
                                                        Open →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-[#0f1419] border border-gray-800 rounded p-12 text-center">
                                <p className="text-gray-500 mb-4">No portfolios found</p>
                                <Button 
                                    onClick={async () => {
                                        const response = await authGet('/api/portfolios', { method: 'POST' });
                                        if (response.ok) {
                                            const result = await response.json();
                                            router.push(`/portfolio/${result.data.portfolioId}/setup`);
                                        }
                                    }}
                                    variant="primary"
                                >
                                    Create Portfolio
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </>
        );
    }

    // PMO / Admin Dashboard
    return (
        <>
            <Header currentPage="dashboard" />
            <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* 1. Header & Context */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-100 mb-1">PMO / Governance Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        System-level oversight and compliance · Logged in as <span className="text-gray-400">{user.role}</span>
                    </p>
                </div>

                {/* 2. System Health Overview */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">System Health Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Total Portfolios</div>
                            <div className="text-2xl font-semibold text-gray-200">
                                {portfolios.length}
                                <span className="text-sm text-gray-500 ml-2">
                                    ({activePortfolios}A / {draftPortfolios}D / {lockedPortfolios}L)
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Constraint Breaches</div>
                            <div className="text-2xl font-semibold text-yellow-400">{budgetBreaches + capacityStress}</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Pending Finalization</div>
                            <div className="text-2xl font-semibold text-gray-200">{totalScenarios}</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Decisions (Last 30d)</div>
                            <div className="text-2xl font-semibold text-gray-200">{lockedPortfolios}</div>
                        </div>
                    </div>
                </div>

                {/* 3. Constraint Compliance Panel */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Constraint Compliance</h2>
                    <div className="bg-[#0f1419] border border-gray-800 rounded">
                        {budgetBreaches > 0 || capacityStress > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Portfolio</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Constraint Type</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Current / Limit</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolios.filter(p => p.totalBudget > 100).map((portfolio) => (
                                        <tr key={`budget-${portfolio.id}`} className="border-b border-gray-800 hover:bg-[#14191f]">
                                            <td className="px-6 py-3 text-sm text-gray-200">
                                                <Link href={`/portfolio/${portfolio.id}/setup`} className="hover:text-blue-400">
                                                    {portfolio.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-400">Budget Threshold</td>
                                            <td className="px-6 py-3 text-sm text-gray-400">${portfolio.totalBudget}M / $100M</td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-950 text-yellow-400">
                                                    WARNING
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {portfolios.filter(p => p.totalCapacity > 50).map((portfolio) => (
                                        <tr key={`capacity-${portfolio.id}`} className="border-b border-gray-800 hover:bg-[#14191f]">
                                            <td className="px-6 py-3 text-sm text-gray-200">
                                                <Link href={`/portfolio/${portfolio.id}/setup`} className="hover:text-blue-400">
                                                    {portfolio.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-400">Capacity Stress</td>
                                            <td className="px-6 py-3 text-sm text-gray-400">{portfolio.totalCapacity} FTE / 50 FTE</td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-red-950 text-red-400">
                                                    BREACH
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-8 text-center text-sm text-gray-500">
                                No constraint violations detected
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Decision Pipeline Status */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Decision Pipeline Status</h2>
                    <div className="bg-[#0f1419] border border-gray-800 rounded">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Pipeline Stage</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Count</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-3 text-sm text-gray-400">Portfolios stuck in setup</td>
                                    <td className="px-6 py-3 text-sm text-gray-200 text-right font-medium">{setupIncomplete}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">DRAFT</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-3 text-sm text-gray-400">Initiatives without scenarios</td>
                                    <td className="px-6 py-3 text-sm text-gray-200 text-right font-medium">{pendingScenarios}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">PENDING ANALYSIS</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-3 text-sm text-gray-400">Scenarios not compared</td>
                                    <td className="px-6 py-3 text-sm text-gray-200 text-right font-medium">{totalScenarios}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">AWAITING COMPARISON</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-3 text-sm text-gray-400">Decisions pending finalization</td>
                                    <td className="px-6 py-3 text-sm text-gray-200 text-right font-medium">0</td>
                                    <td className="px-6 py-3 text-sm text-gray-500">READY FOR EXECUTIVE</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Decision Authority & Ownership */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Decision Authority & Ownership</h2>
                    <div className="bg-[#0f1419] border border-gray-800 rounded">
                        {portfolios.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Portfolio</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Owner</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Last Modified</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolios.map((portfolio) => (
                                        <tr key={portfolio.id} className="border-b border-gray-800 hover:bg-[#14191f]">
                                            <td className="px-6 py-3 text-sm text-gray-200">
                                                <Link href={`/portfolio/${portfolio.id}/setup`} className="hover:text-blue-400">
                                                    {portfolio.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-400">
                                                {portfolio.owner || <span className="text-yellow-400">UNASSIGNED</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">
                                                {new Date(portfolio.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{portfolio.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-8 text-center text-sm text-gray-500">
                                No portfolios in system
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Audit & Integrity Signals */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Audit & Integrity Signals</h2>
                    <div className="bg-[#0f1419] border border-gray-800 rounded">
                        {governanceRecords.length > 0 ? (
                            <div className="divide-y divide-gray-800">
                                {governanceRecords.map((record) => {
                                    const actionLabel = record.actionType.replace(/_/g, ' ');
                                    const severity = 
                                        record.actionType === 'OVERRIDE' ? 'BREACH' :
                                        record.actionType === 'TERMINATION' ? 'WARNING' : 'INFO';
                                    
                                    return (
                                        <div key={record.id} className="px-6 py-3 flex items-center justify-between hover:bg-[#14191f]">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                    severity === 'BREACH' ? 'bg-red-950 text-red-400' :
                                                    severity === 'WARNING' ? 'bg-yellow-950 text-yellow-400' :
                                                    'bg-gray-800 text-gray-400'
                                                }`}>
                                                    {severity}
                                                </span>
                                                <span className="text-sm text-gray-400">{actionLabel}</span>
                                                <span className="text-sm text-gray-500">by {record.userId}</span>
                                                <span className="text-sm text-gray-600">→ {record.portfolioName}</span>
                                            </div>
                                            <span className="text-xs text-gray-600">
                                                {new Date(record.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center text-sm text-gray-500">
                                No governance events recorded
                            </div>
                        )}
                    </div>
                </div>

                {/* 7. Risk & Exposure Summary */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Risk & Exposure Summary</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">High-Risk Initiatives Funded</div>
                            <div className="text-2xl font-semibold text-gray-200">0</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Portfolios Exceeding Risk Tolerance</div>
                            <div className="text-2xl font-semibold text-gray-200">0</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-3">
                            <div className="text-xs text-gray-500 mb-1">Scenarios with Elevated Risk</div>
                            <div className="text-2xl font-semibold text-gray-200">0</div>
                        </div>
                    </div>
                </div>

                {/* 8. User & Role Management */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-medium text-gray-500 uppercase">User & Role Management</h2>
                        <Button 
                            onClick={() => router.push('/dashboard/users')}
                            variant="secondary"
                        >
                            Manage Users
                        </Button>
                    </div>
                    <div className="bg-[#0f1419] border border-gray-800 rounded">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">User</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Last Login</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.slice(0, 5).map((u) => (
                                    <tr key={u.id} className="border-b border-gray-800 hover:bg-[#14191f]">
                                        <td className="px-6 py-3">
                                            <div className="text-sm text-gray-200">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{u.role.replace('_', ' ')}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                u.isActive ? 'bg-green-950 text-green-400' : 'bg-gray-800 text-gray-500'
                                            }`}>
                                                {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => handleToggleActive(u.id, u.isActive)}
                                                className="text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length > 5 && (
                            <div className="px-6 py-3 text-center border-t border-gray-800">
                                <button 
                                    onClick={() => router.push('/dashboard/users')}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    View all {users.length} users →
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-2">
                            <div className="text-xs text-gray-500">Active Users</div>
                            <div className="text-lg font-semibold text-gray-200">{activeUsers}</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-2">
                            <div className="text-xs text-gray-500">Inactive Users</div>
                            <div className="text-lg font-semibold text-gray-200">{inactiveUsers}</div>
                        </div>
                        <div className="bg-[#0f1419] border border-gray-800 px-4 py-2">
                            <div className="text-xs text-gray-500">Pending Invitations</div>
                            <div className="text-lg font-semibold text-gray-200">0</div>
                        </div>
                    </div>
                </div>

                {/* 9. System Configuration */}
                <div className="mb-8">
                    <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">System Configuration</h2>
                    <div className="bg-[#0f1419] border border-red-900/30 rounded">
                        <div className="px-6 py-4 border-b border-gray-800">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-red-950 text-red-400">RESTRICTED</span>
                                <span className="text-sm font-medium text-gray-300">Governance Rules</span>
                            </div>
                            <p className="text-xs text-gray-500">Changes to system configuration are logged immutably</p>
                        </div>
                        <div className="px-6 py-3 space-y-2">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">Default Budget Threshold</span>
                                <span className="text-sm text-gray-300">$100M</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">Default Capacity Limit</span>
                                <span className="text-sm text-gray-300">50 FTE</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">Max Scenarios per Portfolio</span>
                                <span className="text-sm text-gray-300">10</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">Finalization Lock Policy</span>
                                <span className="text-sm text-gray-300">STRICT</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </>
    );
}
