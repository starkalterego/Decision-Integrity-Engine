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
        <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
            <Header portfolioName={data.portfolio.name} portfolioId={resolvedParams.id} currentPage="output" className="no-print" />

            <main className="max-w-7xl mx-auto px-8 py-6">
                {/* Page Header */}
                <div className="no-print flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Executive One-Pager</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Board-Ready Decision Artifact</p>
                    </div>
                    <Button onClick={handleDownloadPDF} variant="secondary">Download PDF</Button>
                </div>

                {/* White Paper Container */}
                <div className="bg-white border border-gray-300 rounded shadow-sm">
                    
                    {/* Header Section */}
                    <div className="px-10 py-5 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                                    PORTFOLIO DECISION ARTIFACT
                                </div>
                                <div className="text-2xl font-semibold text-gray-900 mb-1">
                                    {data.portfolio.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Scenario: {data.scenario.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">DECISION OWNER</div>
                                <div className="text-sm text-gray-600">{data.scenario.decisionOwner}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(data.scenario.createdAt).toLocaleDateString('en-US', { 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Compact Top Metrics */}
                        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">INVESTMENT</div>
                                <div className="text-xl font-semibold text-gray-900">{formatCurrency(data.metrics.investment)}</div>
                                <div className="text-xs text-red-600 mt-0.5">
                                    <span className={data.deltas.investment < 0 ? 'text-red-600' : 'text-gray-500'}>
                                        {formatDelta(data.deltas.investment)} Baseline
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">EXPECTED VALUE</div>
                                <div className="text-xl font-semibold text-gray-900">{formatCurrency(data.metrics.expectedValue)}</div>
                                <div className="text-xs mt-0.5">
                                    <span className={data.deltas.value > 0 ? 'text-green-600' : 'text-gray-500'}>
                                        +{formatDelta(data.deltas.value)} Baseline
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">CAPACITY USE</div>
                                <div className="text-xl font-semibold text-gray-900">{data.metrics.capacityUse.toFixed(0)}%</div>
                                <div className="text-xs text-green-600 mt-0.5">
                                    Optimal/Tolerance +{(100 - data.metrics.capacityUse).toFixed(0)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">RISK EXPOSURE</div>
                                <div className="text-xl font-semibold text-gray-900">{data.metrics.riskExposure}</div>
                                <div className="text-xs text-red-600 mt-0.5">
                                    <span className={data.deltas.risk < 0 ? 'text-red-600' : 'text-gray-500'}>
                                        Reduced/High Risk Removed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-10 py-5">
                        
                        {/* The Decision Ask */}
                        <div className="mb-5">
                            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5">THE DECISION ASK</h2>
                            <p className="text-lg text-gray-800 leading-relaxed mb-3">
                                {data.decisionAsk}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded">
                                    <div className="w-3 h-3 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                                    </div>
                                    <span className="font-medium">Approve</span>
                                </div>
                                <span className="text-gray-500">Recommended</span>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-2 gap-6">

                            {/* Left Column */}
                            <div className="space-y-5">

                                {/* Executive Snapshot */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">EXECUTIVE SNAPSHOT</h3>
                                    <div className="space-y-2 text-sm">
                                        {[
                                            { label: "Portfolio Value", value: formatCurrency(data.executiveSnapshot.portfolioValue) },
                                            { label: "Total Cost", value: formatCurrency(data.executiveSnapshot.totalCost) },
                                            { label: "Capacity Utilization", value: `${data.executiveSnapshot.capacityUtilization.toFixed(0)}%` },
                                            { label: "Risk Level", value: data.executiveSnapshot.riskLevel }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                                                <span className="text-gray-600">{item.label}</span>
                                                <span className="font-semibold text-gray-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Trade-Off Summary */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">TRADE OFF SUMMARY</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-red-50 border border-red-200 rounded p-3">
                                            <div className="text-xs font-semibold text-red-600 uppercase mb-2">WHAT CHANGED</div>
                                            <ul className="space-y-1">
                                                {data.tradeOffSummary.whatChanged.map((item, idx) => (
                                                    <li key={idx} className="text-xs text-gray-700">• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded p-3">
                                            <div className="text-xs font-semibold text-green-600 uppercase mb-2">WHAT GAINED</div>
                                            <ul className="space-y-1">
                                                {data.tradeOffSummary.whatGained.map((item, idx) => (
                                                    <li key={idx} className="text-xs text-gray-700">• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Scenario Comparison */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">SCENARIO COMPARISON</h3>
                                    <div className="border border-gray-200 rounded overflow-hidden text-sm">
                                        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Metric</div>
                                            <div className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase border-l border-gray-200">Baseline</div>
                                            <div className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase border-l border-gray-200">{data.scenario.name.substring(0, 12)}</div>
                                        </div>
                                        {[
                                            { label: 'Investment', b: formatCurrency(data.scenarioComparison.baseline.investment), r: formatCurrency(data.scenarioComparison.current.investment) },
                                            { label: 'Value', b: formatCurrency(data.scenarioComparison.baseline.value), r: formatCurrency(data.scenarioComparison.current.value) },
                                            { label: 'Cap. Used', b: `${data.scenarioComparison.baseline.capacityUsed.toFixed(0)}%`, r: `${data.scenarioComparison.current.capacityUsed.toFixed(0)}%` },
                                            { label: 'Risk', b: data.scenarioComparison.baseline.risk, r: data.scenarioComparison.current.risk },
                                        ].map((row, i) => (
                                            <div key={i} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
                                                <div className="px-3 py-2 text-gray-700">{row.label}</div>
                                                <div className="px-3 py-2 text-center text-gray-600 border-l border-gray-100">{row.b}</div>
                                                <div className="px-3 py-2 text-center font-semibold text-gray-900 border-l border-gray-100">{row.r}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Risks */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">KEY RISKS</h3>
                                    <div className="space-y-2 text-sm">
                                        {data.keyRisks.slice(0, 4).map((risk, idx) => (
                                            <div key={idx} className="flex justify-between items-start gap-3 pb-2 border-b border-gray-100 last:border-0">
                                                <span className="text-gray-700 flex-1">{risk}</span>
                                                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                                                    idx === 0 ? 'bg-orange-100 text-orange-700' : 
                                                    idx === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {idx === 0 ? 'MEDIUM' : idx === 1 ? 'LOW' : 'LOW'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">

                                {/* What We Are Not Funding */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">WHAT WE ARE NOT FUNDING</h3>
                                    <div className="text-sm">
                                        <div className="mb-3 text-xs uppercase tracking-wide text-gray-400">
                                            INITIATIVES STOPPED/SIGNIFICANTLY RELEASED
                                        </div>
                                        <div className="space-y-1.5">
                                            {data.unfundedInitiatives.slice(0, 5).map((init: UnfundedInitiative) => (
                                                <div key={init.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                                                    <span className="text-gray-700">{init.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{formatCurrency(init.capacityReleased * 1000000)}</span>
                                                        <span className="text-xs text-gray-400">{init.capacityReleased} Cr</span>
                                                        <span className="text-xs text-gray-400">{init.capacityReleased} Mo FTE</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Next 30 Days Execution */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2.5 pb-1.5 border-b border-gray-300">NEXT 30 DAYS EXECUTION</h3>
                                    <div className="border border-gray-200 rounded overflow-hidden">
                                        <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 text-xs">
                                            <div className="px-3 py-2 font-semibold text-gray-600 uppercase">Decision</div>
                                            <div className="px-3 py-2 text-center font-semibold text-gray-600 uppercase border-l border-gray-200">Funding Rel.</div>
                                            <div className="px-3 py-2 text-center font-semibold text-gray-600 uppercase border-l border-gray-200">Kickoffs</div>
                                            <div className="px-3 py-2 text-center font-semibold text-gray-600 uppercase border-l border-gray-200">Checkpoint</div>
                                        </div>
                                        <div className="grid grid-cols-4 text-xs">
                                            <div className="px-3 py-2 text-gray-700">Jan 8</div>
                                            <div className="px-3 py-2 text-center text-gray-600 border-l border-gray-100">Jan 15</div>
                                            <div className="px-3 py-2 text-center text-gray-600 border-l border-gray-100">Jan 20</div>
                                            <div className="px-3 py-2 text-center text-gray-600 border-l border-gray-100">Apr 20</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Footer */}
                        <div className="mt-5 pt-3.5 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span className="uppercase tracking-wide">CONFIDENTIAL • INTERNAL USE ONLY</span>
                                <div className="flex gap-3">
                                    <span>ID: {data.scenario.id.substring(0, 8)}</span>
                                    <span>By: {data.scenario.decisionOwner}</span>
                                    <span>{new Date(data.scenario.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                    </div>
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
            margin: 8mm;
          }
        }
      `}</style>
        </div>
    );
}
