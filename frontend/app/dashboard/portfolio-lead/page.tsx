'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet } from '@/lib/api';
import Header from '@/components/layout/Header';

interface Portfolio {
    id: string;
    name: string;
    fiscalYear: string;
    startDate: string;
    endDate: string;
    status: string;
    decisionDeadline: string | null;
    decisionOwner: {
        name: string;
        email: string;
    } | null;
    updatedAt: string;
}

interface Initiative {
    id: string;
    name: string;
    strategicAlignment: string;
    estimatedValue: number;
    capacityDemand: number;
    riskLevel: string;
    status: string;
    completenessStatus: 'COMPLETE' | 'INCOMPLETE';
    blockingFields: string[];
    updatedAt: string;
}

interface Scenario {
    id: string;
    name: string;
    status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED';
    createdBy: {
        name: string;
    };
    updatedAt: string;
}

interface Feedback {
    id: string;
    type: 'EXECUTIVE' | 'PMO';
    comment: string;
    requiredActions: string[];
    createdAt: string;
}

export default function PortfolioLeadDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // Load portfolio (first portfolio for now)
                const portfoliosResponse = await authGet('/api/portfolios');
                const portfoliosData = await portfoliosResponse.json() as { data: Portfolio[] };
                if (portfoliosData.data && portfoliosData.data.length > 0) {
                    const currentPortfolio = portfoliosData.data[0];
                    setPortfolio(currentPortfolio);

                    // Load initiatives for this portfolio
                    const initiativesResponse = await authGet(`/api/initiatives?portfolioId=${currentPortfolio.id}`);
                    const initiativesData = await initiativesResponse.json() as { data: Initiative[] };
                    setInitiatives(initiativesData.data || []);

                    // Load scenarios for this portfolio
                    const scenariosResponse = await authGet(`/api/scenarios?portfolioId=${currentPortfolio.id}`);
                    const scenariosData = await scenariosResponse.json() as { data: Scenario[] };
                    setScenarios(scenariosData.data || []);

                    // Load feedback (if any)
                    // This would come from a feedback API endpoint
                    // For now, leaving empty until backend implements it
                    setFeedback([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading portfolio data:', error);
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                <Header />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-400">Loading portfolio data...</div>
                </div>
            </div>
        );
    }

    // If no portfolio selected, show portfolio selection/creation interface
    if (!portfolio) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-8 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-100 mb-2">
                                    Portfolio Management
                                </h1>
                                <p className="text-sm text-gray-400">
                                    Select a portfolio to manage or create a new one
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                                Create New Portfolio
                            </button>
                        </div>

                        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-12 text-center">
                            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">No Portfolios Yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Get started by creating your first portfolio. You&apos;ll be able to add initiatives, create scenarios, and prepare decisions for executive review.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Portfolio
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Calculate readiness metrics
    const totalInitiatives = initiatives.length;
    const completeInitiatives = initiatives.filter(i => i.completenessStatus === 'COMPLETE').length;
    const incompleteInitiatives = totalInitiatives - completeInitiatives;
    const totalScenarios = scenarios.length;
    const draftScenarios = scenarios.filter(s => s.status === 'DRAFT').length;
    const submittedScenarios = scenarios.filter(s => s.status === 'SUBMITTED').length;
    const returnedScenarios = scenarios.filter(s => s.status === 'RETURNED').length;

    // Determine portfolio stage
    const getPortfolioStage = () => {
        if (totalInitiatives === 0) return 'Setup';
        if (incompleteInitiatives > 0) return 'Intake';
        if (totalScenarios === 0) return 'Scenarios';
        if (submittedScenarios > 0) return 'Comparison';
        if (completeInitiatives === totalInitiatives && totalScenarios > 0) return 'Ready';
        return 'Setup';
    };

    const portfolioStage = getPortfolioStage();

    // Calculate trade-off signals
    const totalValue = initiatives.reduce((sum, i) => sum + i.estimatedValue, 0);
    const totalCapacity = initiatives.reduce((sum, i) => sum + i.capacityDemand, 0);
    const highRiskCount = initiatives.filter(i => i.riskLevel === 'HIGH').length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
            <Header />
            
            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Back to Portfolio List */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Portfolio List
                    </button>
                </div>

                {/* 1️⃣ Portfolio Context Header */}
                <div className="mb-8 pb-6 border-b border-gray-800">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-100 mb-2">
                                {portfolio.name}
                            </h1>
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span>Time Horizon: {portfolio.fiscalYear}</span>
                                <span className="flex items-center gap-2">
                                    Stage: 
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        portfolioStage === 'Ready' ? 'bg-green-900/30 text-green-400' :
                                        portfolioStage === 'Comparison' ? 'bg-blue-900/30 text-blue-400' :
                                        'bg-gray-800 text-gray-300'
                                    }`}>
                                        {portfolioStage}
                                    </span>
                                </span>
                                {portfolio.decisionDeadline && (
                                    <span>Decision Deadline: {new Date(portfolio.decisionDeadline).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            {portfolio.decisionOwner && (
                                <div className="text-gray-400 mb-1">
                                    Decision Owner: <span className="text-gray-300">{portfolio.decisionOwner.name}</span>
                                </div>
                            )}
                            <div className="text-gray-500">
                                Last updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2️⃣ Readiness Overview */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Readiness Overview</h2>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-3xl font-semibold text-gray-100 mb-1">{totalInitiatives}</div>
                            <div className="text-sm text-gray-400">Total Initiatives</div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-3xl font-semibold text-green-400 mb-1">{completeInitiatives}</div>
                            <div className="text-sm text-gray-400">Decision-Ready</div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className={`text-3xl font-semibold mb-1 ${incompleteInitiatives > 0 ? 'text-yellow-400' : 'text-gray-100'}`}>
                                {incompleteInitiatives}
                            </div>
                            <div className="text-sm text-gray-400">Incomplete (Blocking)</div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-3xl font-semibold text-gray-100 mb-1">{totalScenarios}</div>
                            <div className="text-sm text-gray-400">Scenarios Created</div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-sm text-gray-400 mb-2">Scenario Status</div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Draft:</span>
                                    <span className="text-gray-300">{draftScenarios}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Submitted:</span>
                                    <span className="text-gray-300">{submittedScenarios}</span>
                                </div>
                                {returnedScenarios > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Returned:</span>
                                        <span className="text-yellow-400">{returnedScenarios}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3️⃣ Initiative Readiness Table */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-100">Initiative Readiness</h2>
                        <button
                            onClick={() => router.push(`/portfolio/${portfolio.id}/initiatives`)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                            Manage Initiatives
                        </button>
                    </div>
                    
                    {initiatives.length === 0 ? (
                        <div className="bg-gray-900/40 border border-gray-800 p-8 text-center">
                            <p className="text-gray-400">No initiatives added yet. Start by adding initiatives to your portfolio.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-900/40 border border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-800/50 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Initiative Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strategic Alignment</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Value</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Capacity Demand</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Level</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Blocking Fields</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {initiatives.map((initiative) => (
                                        <tr key={initiative.id} className="hover:bg-gray-800/30">
                                            <td className="px-4 py-3 text-sm text-gray-200">{initiative.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-300">{initiative.strategicAlignment || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-300 text-right">
                                                ${(initiative.estimatedValue / 1000000).toFixed(1)}M
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300 text-right">
                                                {initiative.capacityDemand.toFixed(1)} FTE
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    initiative.riskLevel === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                                                    initiative.riskLevel === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-green-900/30 text-green-400'
                                                }`}>
                                                    {initiative.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    initiative.completenessStatus === 'COMPLETE' 
                                                        ? 'bg-green-900/30 text-green-400' 
                                                        : 'bg-yellow-900/30 text-yellow-400'
                                                }`}>
                                                    {initiative.completenessStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-400">
                                                {initiative.blockingFields && initiative.blockingFields.length > 0 
                                                    ? initiative.blockingFields.join(', ')
                                                    : '—'
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(initiative.updatedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 4️⃣ Scenario Workspace Access */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-100">Scenario Workspace</h2>
                        <button
                            onClick={() => router.push(`/portfolio/${portfolio.id}/scenarios`)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            disabled={incompleteInitiatives > 0}
                        >
                            Create New Scenario
                        </button>
                    </div>

                    {incompleteInitiatives > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-800/50 p-4 mb-4 rounded">
                            <p className="text-sm text-yellow-400">
                                Complete all initiatives before creating scenarios. {incompleteInitiatives} initiative(s) remain incomplete.
                            </p>
                        </div>
                    )}

                    {scenarios.length === 0 ? (
                        <div className="bg-gray-900/40 border border-gray-800 p-8 text-center">
                            <p className="text-gray-400">No scenarios created yet. Create your first scenario to explore trade-offs.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-900/40 border border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-800/50 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Scenario Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created By</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Modified</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {scenarios.map((scenario) => (
                                        <tr key={scenario.id} className="hover:bg-gray-800/30">
                                            <td className="px-4 py-3 text-sm text-gray-200">{scenario.name}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    scenario.status === 'DRAFT' ? 'bg-gray-700 text-gray-300' :
                                                    scenario.status === 'SUBMITTED' ? 'bg-blue-900/30 text-blue-400' :
                                                    scenario.status === 'RETURNED' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-green-900/30 text-green-400'
                                                }`}>
                                                    {scenario.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">{scenario.createdBy.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(scenario.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {scenario.status === 'DRAFT' || scenario.status === 'RETURNED' ? (
                                                    <button
                                                        onClick={() => router.push(`/portfolio/${portfolio.id}/scenarios/${scenario.id}`)}
                                                        className="text-blue-400 hover:text-blue-300 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => router.push(`/portfolio/${portfolio.id}/scenarios/${scenario.id}`)}
                                                        className="text-gray-500 hover:text-gray-400"
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 5️⃣ Trade-off Signals */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Trade-off Signals</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Budget Pressure</div>
                            <div className="text-lg font-semibold text-gray-100 mb-1">
                                ${(totalValue / 1000000).toFixed(1)}M Total Value
                            </div>
                            <div className="text-xs text-gray-500">
                                Aggregate initiative value across portfolio
                            </div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Capacity Hotspots</div>
                            <div className="text-lg font-semibold text-gray-100 mb-1">
                                {totalCapacity.toFixed(1)} FTE Required
                            </div>
                            <div className="text-xs text-gray-500">
                                Total capacity demand across initiatives
                            </div>
                        </div>
                        <div className="bg-gray-900/40 border border-gray-800 p-4">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Risk Concentration</div>
                            <div className={`text-lg font-semibold mb-1 ${
                                highRiskCount > 3 ? 'text-red-400' : 
                                highRiskCount > 0 ? 'text-yellow-400' : 
                                'text-green-400'
                            }`}>
                                {highRiskCount} High-Risk Initiatives
                            </div>
                            <div className="text-xs text-gray-500">
                                Initiatives marked as high risk
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6️⃣ Feedback & Required Actions */}
                {(feedback.length > 0 || returnedScenarios > 0) && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-100 mb-4">Feedback & Required Actions</h2>
                        
                        {returnedScenarios > 0 && (
                            <div className="bg-yellow-900/20 border border-yellow-800/50 p-6 mb-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <div className="font-semibold text-yellow-400 mb-1">Action Required</div>
                                        <div className="text-sm text-gray-300">
                                            {returnedScenarios} scenario(s) returned with feedback. Review executive comments and revise accordingly.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {feedback.length === 0 ? (
                            <div className="bg-gray-900/40 border border-gray-800 p-6 text-center">
                                <p className="text-gray-400 text-sm">No feedback received yet. Submit scenarios for executive review.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedback.map((item) => (
                                    <div key={item.id} className="bg-gray-900/40 border border-gray-800 p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    item.type === 'EXECUTIVE' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
                                                }`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-4">{item.comment}</p>
                                        {item.requiredActions && item.requiredActions.length > 0 && (
                                            <div>
                                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Required Actions:</div>
                                                <ul className="space-y-1">
                                                    {item.requiredActions.map((action, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <span className="text-blue-400 mt-1">→</span>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
