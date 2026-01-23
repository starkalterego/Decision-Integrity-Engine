'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { authGet } from '@/lib/api';

interface Initiative {
    id: string;
    name: string;
    decision: string;
}

interface UnfundedInitiative {
    id: string;
    name: string;
    decision: string;
    capacityReleased: number;
}

interface ScenarioMetrics {
    investment: number;
    value: number;
    capacityUsed: number;
    risk: string;
}

interface Scenario {
    id: string;
    name: string;
    isFinalized: boolean;
}

interface ExecutiveSummaryData {
    portfolio: {
        name: string;
        fiscalPeriod: string;
        totalBudget: number;
        totalCapacity: number;
    };
    scenario: {
        id: string;
        name: string;
        assumptions: string;
        isFinalized: boolean;
        createdAt: Date;
        decisionOwner: string;
        status: string;
    };
    decisionAsk: string;
    metrics: {
        investment: number;
        expectedValue: number;
        capacityUse: number;
        riskExposure: string;
        fundedCount: number;
    };
    deltas: {
        investment: number;
        value: number;
        capacity: number;
        risk: number;
    };
    baseline: {
        investment: number;
        value: number;
        capacityUse: number;
        risk: string;
    };
    executiveSnapshot: {
        portfolioValue: number;
        totalCost: number;
        capacityUtilization: number;
        riskLevel: string;
    };
    tradeOffSummary: {
        whatChanged: string[];
        whatGained: string[];
    };
    decisions: {
        fund: Initiative[];
        pause: Initiative[];
        stop: Initiative[];
    };
    unfundedInitiatives: UnfundedInitiative[];
    keyRisks: string[];
    scenarioComparison: {
        baseline: ScenarioMetrics;
        current: ScenarioMetrics;
    };
}

export default function ExecutiveOutputPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = React.use(params);
    const [data, setData] = useState<ExecutiveSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);

    useEffect(() => {
        loadScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.id]);

    useEffect(() => {
        if (selectedScenarioId) {
            loadExecutiveSummary(selectedScenarioId);
        }
    }, [selectedScenarioId]);

    const loadScenarios = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await authGet(`/api/scenarios?portfolioId=${resolvedParams.id}`);
            const result = await res.json();

            console.log('Scenarios loaded:', result);

            if (result.success && result.data.length > 0) {
                setScenarios(result.data);
                // Find first finalized scenario
                const finalizedScenario = result.data.find((s: { isFinalized: boolean; id: string }) => s.isFinalized);
                console.log('Finalized scenario:', finalizedScenario);
                if (finalizedScenario) {
                    setSelectedScenarioId(finalizedScenario.id);
                } else {
                    setError('No finalized scenario found. Please finalize a scenario first.');
                    setIsLoading(false);
                }
            } else {
                setError('No scenarios found. Please create and finalize a scenario first.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error loading scenarios:', err);
            setError('Failed to load scenarios. Please try again.');
            setIsLoading(false);
        }
    };

    const loadExecutiveSummary = async (scenarioId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await authGet(`/api/scenarios/${scenarioId}/executive-summary`);
            const result = await res.json();

            console.log('Executive summary response:', result);

            if (!result.success) {
                console.error('Error:', result.errors);
                setError(result.errors[0]?.message || 'Failed to load executive summary');
                setIsLoading(false);
                return;
            }

            setData(result.data);
        } catch (err) {
            console.error('Error loading executive summary:', err);
            setError('Failed to load executive summary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(0)}Cr`;

    const formatDelta = (delta: number) => {
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta.toFixed(0)}%`;
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    if (isLoading || !data) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header portfolioName="Portfolio" portfolioId={resolvedParams.id} currentPage="output" />
                <main className="page-container mx-auto max-w-7xl p-8">
                    <div className="text-center py-20">
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }}></div>
                                <p style={{ color: 'var(--text-secondary)' }}>Loading executive summary...</p>
                            </>
                        ) : error ? (
                            <div>
                                <div className="mb-6">
                                    <svg className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--accent-warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{error}</h2>
                                </div>
                                {scenarios.length > 0 && (
                                    <div className="max-w-2xl mx-auto">
                                        <div 
                                            className="rounded-lg p-5 mb-4"
                                            style={{ 
                                                backgroundColor: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-default)'
                                            }}
                                        >
                                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Available Scenarios:</h3>
                                            <ul className="space-y-2 text-left">
                                                {scenarios.map((s) => (
                                                    <li 
                                                        key={s.id} 
                                                        className="flex items-center justify-between text-sm p-2 rounded"
                                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                                    >
                                                        <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                                                        <span 
                                                            className="px-2 py-1 text-xs font-semibold rounded"
                                                            style={{
                                                                backgroundColor: s.isFinalized ? 'rgba(63, 174, 106, 0.1)' : 'rgba(196, 162, 74, 0.1)',
                                                                color: s.isFinalized ? 'var(--accent-success)' : 'var(--accent-warning)',
                                                                border: s.isFinalized ? '1px solid rgba(63, 174, 106, 0.2)' : '1px solid rgba(196, 162, 74, 0.2)'
                                                            }}
                                                        >
                                                            {s.isFinalized ? 'Finalized' : 'Draft'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                            Go to the scenario workspace and finalize a scenario to generate the executive output.
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={() => window.location.href = `/portfolio/${resolvedParams.id}/scenarios/baseline`}
                                        >
                                            Go to Scenarios
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No data available.</p>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: '#f5f5f5', color: '#000000' }}>
            <Header portfolioName={data.portfolio.name} portfolioId={resolvedParams.id} currentPage="output" className="no-print" />

            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Page Header */}
                <div className="no-print flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Executive One-Pager</h1>
                        <p className="text-sm text-gray-500 mt-1">Board-Ready Decision Artifact</p>
                    </div>
                    <Button onClick={handleDownloadPDF} variant="secondary">Download PDF</Button>
                </div>

                {/* White Paper Container */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
                    
                    {/* Header Section */}
                    <div className="px-12 py-6 border-b border-gray-200 flex justify-between items-start">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                Portfolio Decision Artifact
                            </div>
                            <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                {data.portfolio.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Scenario: {data.scenario.name}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Decision Owner</div>
                            <div className="text-sm font-medium text-gray-600">{data.scenario.decisionOwner}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(data.scenario.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="p-12 space-y-12">
                        
                        {/* Top Metric Cards */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Investment</div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(data.metrics.investment)}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.deltas.investment < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {formatDelta(data.deltas.investment)}
                                    </span>
                                    <span className="text-xs text-gray-500">vs Baseline</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Expected Value</div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(data.metrics.expectedValue)}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.deltas.value > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {formatDelta(data.deltas.value)}
                                    </span>
                                    <span className="text-xs text-gray-500">vs Baseline</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Capacity Use</div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{data.metrics.capacityUse.toFixed(0)}%</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.metrics.capacityUse < 95 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {data.metrics.capacityUse < 95 ? 'Optimal' : 'High'}
                                    </span>
                                    <span className="text-xs text-gray-500">Tolerance &lt;95%</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Risk Exposure</div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{data.metrics.riskExposure}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.deltas.risk < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {data.deltas.risk < 0 ? 'Reduced' : 'Managed'}
                                    </span>
                                    <span className="text-xs text-gray-500">vs {data.baseline.risk}</span>
                                </div>
                            </div>
                        </div>

                        {/* The Decision Ask */}
                        <div className="bg-gray-50 border-l-4 border-blue-500 rounded-lg p-8">
                            <div className="flex items-start gap-8">
                                <div className="flex-1">
                                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">The Decision Ask</h2>
                                    <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                                        {data.decisionAsk}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-w-fit">
                                    <button className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-blue-500 rounded-lg shadow-sm hover:shadow transition-shadow">
                                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-gray-900">Approve</div>
                                            <div className="text-xs text-gray-500">{data.scenario.status}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Single Column Layout */}
                        <div className="space-y-14">

                        {/* Executive Snapshot */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 pb-3 border-b border-gray-200">
                                Executive Snapshot
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Portfolio Value", value: formatCurrency(data.executiveSnapshot.portfolioValue), delta: formatDelta(data.deltas.value) },
                                    { label: "Total Cost", value: formatCurrency(data.executiveSnapshot.totalCost), delta: formatDelta(data.deltas.investment) },
                                    { label: "Capacity Utilization", value: `${data.executiveSnapshot.capacityUtilization.toFixed(0)}%`, delta: data.executiveSnapshot.capacityUtilization < 95 ? "Optimal" : "High" },
                                    { label: "Risk Level", value: data.executiveSnapshot.riskLevel, delta: data.deltas.risk < 0 ? "Reduced" : "Managed" }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                        <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">{item.delta}</span>
                                            <span className="text-xl font-bold text-gray-900 min-w-25 text-right">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trade-Off Summary */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 pb-3 border-b border-gray-200">
                                Trade-Off Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">What Changed</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {data.tradeOffSummary.whatChanged.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">What Gained</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {data.tradeOffSummary.whatGained.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Scenario Comparison */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 pb-3 border-b border-gray-200">
                                Scenario Comparison
                            </h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-3 bg-gray-100 border-b border-gray-200">
                                    <div className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Metric</div>
                                    <div className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Baseline</div>
                                    <div className="p-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50">
                                        {data.scenario.name}
                                    </div>
                                </div>
                                {[
                                    { label: 'Investment', b: formatCurrency(data.scenarioComparison.baseline.investment), r: formatCurrency(data.scenarioComparison.current.investment) },
                                    { label: 'Value', b: formatCurrency(data.scenarioComparison.baseline.value), r: formatCurrency(data.scenarioComparison.current.value) },
                                    { label: 'Cap. Used', b: `${data.scenarioComparison.baseline.capacityUsed.toFixed(0)}%`, r: `${data.scenarioComparison.current.capacityUsed.toFixed(0)}%` },
                                    { label: 'Risk', b: data.scenarioComparison.baseline.risk, r: data.scenarioComparison.current.risk },
                                ].map((row, i) => (
                                    <div key={i} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
                                        <div className="p-3 text-sm font-medium text-gray-700">{row.label}</div>
                                        <div className="p-3 text-center text-sm text-gray-600">{row.b}</div>
                                        <div className="p-3 text-center text-sm font-bold text-gray-900 bg-blue-50">
                                            {row.r}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Risks */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 pb-3 border-b border-gray-200">
                                Key Risks
                            </h3>
                            <div className="space-y-3">
                                {data.keyRisks.map((risk, idx) => (
                                    <div key={idx} className="border-l-2 border-gray-300 pl-4 py-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-gray-700">{risk}</span>
                                            <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-gray-100 text-gray-600 ml-4">
                                                {idx === 0 || idx === 1 ? 'MEDIUM' : 'LOW'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What We Are Not Funding */}
                        {data.unfundedInitiatives.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6 pb-3 border-b border-gray-200">
                                    What We Are Not Funding
                                </h3>
                                <div className="flex gap-8 mb-6">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Initiatives Stopped</div>
                                        <div className="text-xl font-bold text-gray-900">{data.decisions.stop.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Capacity Released</div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {data.unfundedInitiatives.reduce((sum: number, init: UnfundedInitiative) => sum + init.capacityReleased, 0)} <span className="text-xs text-gray-500 font-normal">FTE</span>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {data.unfundedInitiatives.slice(0, 5).map((init: UnfundedInitiative) => (
                                        <li key={init.id} className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            {init.name} <span className="text-xs text-gray-400">({init.decision})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="pt-8 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span className="font-semibold uppercase tracking-wide">Audit Record</span>
                                <div className="flex gap-4">
                                    <span>ID: {data.scenario.id.substring(0, 12)}</span>
                                    <span>Prepared By: {data.scenario.decisionOwner}</span>
                                    <span>{new Date(data.scenario.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        </div>

                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400 no-print pb-8">
                    <p>Confidential • Internal Use Only • Board Decision Record</p>
                </div>
            </main>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
        }
      `}</style>
        </div>
    );
}
