'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet, authPost } from '@/lib/api';
import Header from '@/components/layout/Header';
import showToast from '@/lib/toast';

interface Portfolio {
    id: string;
    name: string;
    status: string;
    totalBudget: number;
    totalCapacity: number;
    fiscalPeriod: string;
    owner?: string;
    createdAt: string;
    updatedAt: string;
}

interface Scenario {
    id: string;
    name: string;
    type: string;
    totalValue: number;
    totalCost: number;
    totalCapacity: number;
    isRecommended: boolean;
    assumptions?: string;
}

export default function ExecutiveDashboard() {
    const router = useRouter();
    const { user } = useAuth(true);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        if (user.role !== 'EXECUTIVE' && user.role !== 'PMO') {
            router.push('/dashboard');
            return;
        }
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            const portfoliosRes = await authGet('/api/portfolios');
            const portfoliosData = await portfoliosRes.json();
            
            if (portfoliosData.data && portfoliosData.data.length > 0) {
                const activePortfolio = portfoliosData.data[0];
                setPortfolio(activePortfolio);
                
                // Load scenarios for this portfolio
                const scenariosRes = await authGet(`/api/scenarios?portfolioId=${activePortfolio.id}`);
                const scenariosData = await scenariosRes.json();
                
                if (scenariosData.data) {
                    // Calculate metrics for each scenario
                    const scenariosWithMetrics = scenariosData.data.map((scenario: {
                        id: string;
                        name: string;
                        isBaseline: boolean;
                        isRecommended?: boolean;
                        isFinalized?: boolean;
                        assumptions?: string;
                        decisions?: Array<{
                            decision: string;
                            initiative?: {
                                estimatedValue: number;
                                capacityDemands?: Array<{ units: number }>;
                            };
                        }>;
                    }) => {
                        const fundedDecisions = scenario.decisions?.filter((d) => d.decision === 'FUND') || [];
                        const totalValue = fundedDecisions.reduce((sum, d) => sum + (d.initiative?.estimatedValue || 0), 0);
                        const totalCapacity = fundedDecisions.reduce((sum, d) => {
                            return sum + (d.initiative?.capacityDemands?.reduce((s, c) => s + c.units, 0) || 0);
                        }, 0);
                        
                        return {
                            id: scenario.id,
                            name: scenario.name,
                            type: scenario.isBaseline ? 'BASELINE' : 'SCENARIO',
                            totalValue: Math.round(totalValue * 100) / 100,
                            totalCost: Math.round(totalValue * 100) / 100, // Using value as proxy for cost
                            totalCapacity: Math.round(totalCapacity),
                            isRecommended: scenario.isRecommended || false,
                            isFinalized: scenario.isFinalized || false,
                            assumptions: scenario.assumptions
                        };
                    });
                    // Show all scenarios (temporarily removed finalized filter for debugging)
                    setScenarios(scenariosWithMetrics);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!portfolio) return;

        try {
            const response = await authPost(`/api/portfolios/${portfolio.id}/approve`, {});
            const result = await response.json();

            if (result.success) {
                showToast.success('Portfolio approved and locked successfully');
                // Reload data to show locked status
                await loadData();
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to approve portfolio');
            }
        } catch (error) {
            console.error('Error approving portfolio:', error);
            showToast.error('Failed to approve portfolio');
        }
    };

    const handleRequestRevision = async () => {
        if (!portfolio) return;

        // In production, this would open a dialog to collect revision comments
        const comments = prompt('Please provide revision comments:');
        if (!comments) return;

        try {
            const response = await authPost(`/api/portfolios/${portfolio.id}/revision`, {
                comments
            });
            const result = await response.json();

            if (result.success) {
                showToast.success('Revision request submitted successfully');
                // In production, this would notify the portfolio owner
            } else {
                showToast.error(result.errors[0]?.message || 'Failed to request revision');
            }
        } catch (error) {
            console.error('Error requesting revision:', error);
            showToast.error('Failed to request revision');
        }
    };

    if (loading) {
        return (
            <>
                <Header currentPage="dashboard" />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
                    <p className="text-gray-400">Loading decision brief...</p>
                </div>
            </>
        );
    }

    if (!portfolio) {
        return (
            <>
                <Header currentPage="dashboard" />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
                    <div className="text-center">
                        <p className="text-xl text-gray-400 mb-2">No Portfolio Available</p>
                        <p className="text-sm text-gray-500">Contact your administrator to create a portfolio for decision review.</p>
                    </div>
                </div>
            </>
        );
    }

    const baseline = scenarios.find(s => s.type === 'BASELINE');
    const recommended = scenarios.find(s => s.isRecommended && s.type !== 'BASELINE');
    const alternative = scenarios.find(s => !s.isRecommended && s.type !== 'BASELINE' && s.id !== recommended?.id);

    const hasScenarios = scenarios.length > 0;
    const totalValue = recommended?.totalValue || 0;
    const budgetUsed = recommended?.totalCost || 0;
    const budgetLimit = portfolio.totalBudget;
    const capacityUsed = recommended?.totalCapacity || 0;
    const capacityLimit = portfolio.totalCapacity;
    
    const budgetUtilization = budgetLimit > 0 ? Math.round((budgetUsed / budgetLimit) * 100) : 0;
    const capacityUtilization = capacityLimit > 0 ? Math.round((capacityUsed / capacityLimit) * 100) : 0;
    const riskPosture = budgetUtilization > 90 || capacityUtilization > 90 ? 'High' : budgetUtilization > 75 || capacityUtilization > 75 ? 'Moderate' : 'Low';
    
    // Parse assumptions from recommended scenario
    const assumptions = recommended?.assumptions ? recommended.assumptions.split('\n').filter(a => a.trim()) : [];

    return (
        <>
            <Header currentPage="dashboard" />
            <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-5xl mx-auto px-12 py-16">
                    
                    {/* 1. Decision Context Header */}
                    <div className="mb-16 pb-8 border-b border-gray-800">
                        <h1 className="text-4xl font-light text-gray-100 mb-6">
                            {portfolio.name}
                        </h1>
                        <div className="space-y-3 text-base text-gray-300">
                            <div className="flex items-center gap-3">
                                <span className="w-32 font-medium text-gray-500">Fiscal Period</span>
                                <span className="text-gray-200">{portfolio.fiscalPeriod}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-32 font-medium text-gray-500">Status</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    portfolio.status === 'LOCKED' 
                                        ? 'bg-green-950 text-green-400 border border-green-800' 
                                        : portfolio.status === 'ACTIVE'
                                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}>
                                    {portfolio.status === 'LOCKED' ? 'Approved / Locked' : 
                                     portfolio.status === 'ACTIVE' ? 'Recommendation Ready' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-32 font-medium text-gray-500">Owner</span>
                                <span className="text-gray-200">{portfolio.owner || user?.name || 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-32 font-medium text-gray-500">Last Updated</span>
                                <span className="text-gray-200">{new Date(portfolio.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Executive Summary */}
                    {hasScenarios && recommended ? (
                        <div className="mb-16">
                            <h2 className="text-2xl font-light text-gray-100 mb-8">Executive Summary</h2>
                            <div className="grid grid-cols-4 gap-8">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Portfolio Value</p>
                                    <p className="text-4xl font-light text-gray-100">${totalValue.toFixed(1)}M</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Budget Used</p>
                                    <p className="text-4xl font-light text-gray-100">{budgetUtilization}%</p>
                                    <p className="text-sm text-gray-500 mt-1">${budgetUsed.toFixed(1)}M of ${budgetLimit}M</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Capacity Used</p>
                                    <p className="text-4xl font-light text-gray-100">{capacityUtilization}%</p>
                                    <p className="text-sm text-gray-500 mt-1">{capacityUsed} of {capacityLimit} FTE</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Risk Posture</p>
                                    <p className={`text-4xl font-light ${
                                        riskPosture === 'High' ? 'text-red-400' :
                                        riskPosture === 'Moderate' ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>{riskPosture}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-16">
                            <h2 className="text-2xl font-light text-gray-100 mb-8">Executive Summary</h2>
                            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-8 text-center">
                                <p className="text-gray-400 mb-2">No scenarios available for review</p>
                                <p className="text-sm text-gray-500">Portfolio owner must create and finalize scenarios before executive approval.</p>
                            </div>
                        </div>
                    )}

                    {/* 3. Scenario Comparison */}
                    {hasScenarios && (
                        <div className="mb-16">
                            <h2 className="text-2xl font-light text-gray-100 mb-8">Scenario Comparison</h2>
                            <div className={`grid gap-6 ${baseline && recommended && alternative ? 'grid-cols-3' : baseline && recommended ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Baseline */}
                                {baseline && (
                                    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6 opacity-60">
                                        <p className="text-sm font-medium text-gray-500 mb-4">Baseline (Reference)</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Value Delivered</p>
                                                <p className="text-2xl font-light text-gray-400">${baseline.totalValue.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Budget Impact</p>
                                                <p className="text-lg text-gray-400">${baseline.totalCost.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Capacity Impact</p>
                                                <p className="text-lg text-gray-400">{baseline.totalCapacity} FTE</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                                                <p className="text-lg text-gray-400">Low</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recommended */}
                                {recommended && (
                                    <div className="bg-blue-950/30 border-2 border-blue-500 rounded-lg p-6 shadow-lg shadow-blue-500/10">
                                        <p className="text-sm font-semibold text-blue-400 mb-4">Recommended Scenario</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Value Delivered</p>
                                                <p className="text-2xl font-light text-gray-100">${recommended.totalValue.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Budget Impact</p>
                                                <p className="text-lg text-gray-100">${recommended.totalCost.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Capacity Impact</p>
                                                <p className="text-lg text-gray-100">{recommended.totalCapacity} FTE</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                                                <p className="text-lg text-gray-100">{riskPosture}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Alternative */}
                                {alternative && (
                                    <div className="bg-[#0f1419] border border-gray-700 rounded-lg p-6">
                                        <p className="text-sm font-medium text-gray-400 mb-4">Alternative Option</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Value Delivered</p>
                                                <p className="text-2xl font-light text-gray-200">${alternative.totalValue.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Budget Impact</p>
                                                <p className="text-lg text-gray-200">${alternative.totalCost.toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Capacity Impact</p>
                                                <p className="text-lg text-gray-200">{alternative.totalCapacity} FTE</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                                                <p className="text-lg text-gray-200">Moderate</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Recommendation Statement */}
                    {recommended && (
                        <div className="mb-16 bg-[#0f1419] border-l-4 border-blue-500 p-8 rounded-r-lg">
                            <h2 className="text-2xl font-light text-gray-100 mb-4">Recommendation</h2>
                            <p className="text-lg leading-relaxed text-gray-300">
                                Under current constraints, the recommended scenario delivers ${recommended.totalValue.toFixed(1)}M in value while remaining {budgetUtilization <= 100 ? 'within' : 'near'} budget and capacity limits. Risk increases {riskPosture === 'High' ? 'significantly' : riskPosture === 'Moderate' ? 'moderately' : 'minimally'} but remains {riskPosture === 'High' ? 'elevated' : 'within tolerance'}. This option provides the optimal balance between value delivery and organizational capacity.
                            </p>
                        </div>
                    )}

                    {/* 5. Key Assumptions */}
                    {recommended && assumptions.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-2xl font-light text-gray-100 mb-6">Key Assumptions</h2>
                            <div className="space-y-3 text-base text-gray-300 pl-4">
                                {assumptions.slice(0, 5).map((assumption, index) => (
                                    <div key={index} className="flex gap-3">
                                        <span className="text-gray-600">•</span>
                                        <span>{assumption}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Decision Actions */}
                    {portfolio.status !== 'LOCKED' && hasScenarios && (
                        <div className="pt-12 border-t-2 border-gray-800">
                            <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wide">Decision Authority</p>
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleApprove}
                                    disabled={!recommended}
                                    className="px-10 py-4 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                                >
                                    Approve & Lock Decision
                                </button>
                                <button
                                    onClick={handleRequestRevision}
                                    className="px-10 py-4 border-2 border-gray-600 text-gray-200 text-lg rounded-lg font-semibold hover:border-gray-500 hover:bg-gray-800 transition-all"
                                >
                                    Request Revision
                                </button>
                            </div>
                            {!recommended && (
                                <p className="text-sm text-gray-500 mt-4">
                                    * No recommended scenario available. Contact portfolio owner to finalize scenarios.
                                </p>
                            )}
                        </div>
                    )}

                    {portfolio.status === 'LOCKED' && (
                        <div className="pt-12 border-t border-gray-800">
                            <div className="bg-green-950 border border-green-800 rounded-lg p-6">
                                <p className="text-green-400 font-medium">
                                    ✓ This decision has been approved and locked
                                </p>
                                <p className="text-sm text-green-500 mt-1">
                                    No further changes can be made to this portfolio
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
