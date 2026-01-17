'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

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
        fund: any[];
        pause: any[];
        stop: any[];
    };
    unfundedInitiatives: any[];
    keyRisks: string[];
    scenarioComparison: {
        baseline: any;
        current: any;
    };
}

export default function ExecutiveOutputPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = React.use(params);
    const router = useRouter();
    const [data, setData] = useState<ExecutiveSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
    const [scenarios, setScenarios] = useState<any[]>([]);

    useEffect(() => {
        loadScenarios();
    }, [resolvedParams.id]);

    useEffect(() => {
        if (selectedScenarioId) {
            loadExecutiveSummary(selectedScenarioId);
        }
    }, [selectedScenarioId]);

    const loadScenarios = async () => {
        try {
            const res = await fetch(`/api/scenarios?portfolioId=${resolvedParams.id}`);
            const result = await res.json();

            if (result.success && result.data.length > 0) {
                setScenarios(result.data);
                // Find first finalized scenario or use first scenario
                const finalizedScenario = result.data.find((s: any) => s.isFinalized);
                if (finalizedScenario) {
                    setSelectedScenarioId(finalizedScenario.id);
                }
            }
        } catch (err) {
            console.error('Error loading scenarios:', err);
        }
    };

    const loadExecutiveSummary = async (scenarioId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/scenarios/${scenarioId}/executive-summary`);
            const result = await res.json();

            if (!result.success) {
                console.error('Error:', result.errors);
                return;
            }

            setData(result.data);
        } catch (err) {
            console.error('Error loading executive summary:', err);
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
            <div className="min-h-screen bg-neutral-50">
                <Header portfolioName="Portfolio" portfolioId={resolvedParams.id} currentPage="output" />
                <main className="page-container mx-auto max-w-[1400px] p-8">
                    <div className="text-center py-20">
                        <p className="text-neutral-600">
                            {isLoading ? 'Loading executive summary...' : 'No finalized scenario available. Please finalize a scenario first.'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-neutral-200">
            <Header portfolioName={data.portfolio.name} portfolioId={resolvedParams.id} currentPage="output" />

            <main className="page-container mx-auto max-w-[1400px] p-8">
                <div className="section-header no-print flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Executive One-Pager</h1>
                        <p className="text-sm text-neutral-500 mt-1">Board-Ready Decision Artifact</p>
                    </div>
                    <Button onClick={handleDownloadPDF} variant="secondary">Download PDF</Button>
                </div>

                {/* BOARD-READY ARTIFACT CONTAINER */}
                <div className="bg-white shadow-xl rounded-sm border border-neutral-200 overflow-hidden print:shadow-none print:border-none">

                    {/* Header Block */}
                    <div className="px-10 py-4 border-b border-neutral-100 flex justify-between items-end">
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-1">Portfolio Decision Artifact</div>
                            <div className="text-3xl font-bold tracking-tight text-neutral-900">{data.portfolio.name}</div>
                            <div className="text-sm text-neutral-400 mt-0.5 font-normal">Scenario: {data.scenario.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">Decision Owner</div>
                            <div className="text-sm font-medium text-neutral-500">{data.scenario.decisionOwner}</div>
                            <div className="text-xs text-neutral-400 font-mono mt-0.5">
                                {new Date(data.scenario.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 pb-14 space-y-16">

                        {/* Top Metric Cards */}
                        <div className="grid grid-cols-4 gap-8">
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Investment</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">{formatCurrency(data.metrics.investment)}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-semibold ${data.deltas.investment < 0 ? 'text-status-red bg-status-red-bg' : 'text-neutral-600 bg-neutral-100'} px-2 py-0.5 rounded`}>
                                        {formatDelta(data.deltas.investment)}
                                    </span>
                                    <span className="text-[11px] text-neutral-400 font-normal">vs Baseline</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Expected Value</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">{formatCurrency(data.metrics.expectedValue)}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-semibold ${data.deltas.value > 0 ? 'text-status-green bg-status-green-bg' : 'text-neutral-600 bg-neutral-100'} px-2 py-0.5 rounded`}>
                                        {formatDelta(data.deltas.value)}
                                    </span>
                                    <span className="text-[11px] text-neutral-400 font-normal">vs Baseline</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Capacity Use</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">{data.metrics.capacityUse.toFixed(0)}%</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-semibold ${data.metrics.capacityUse < 95 ? 'text-status-green bg-status-green-bg' : 'text-neutral-600 bg-neutral-100'} px-2 py-0.5 rounded`}>
                                        {data.metrics.capacityUse < 95 ? 'Optimal' : 'High'}
                                    </span>
                                    <span className="text-[11px] text-neutral-400 font-normal">Tolerance &lt;95%</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Risk Exposure</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">{data.metrics.riskExposure}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-semibold ${data.deltas.risk < 0 ? 'text-status-green bg-status-green-bg' : 'text-neutral-600 bg-neutral-100'} px-2 py-0.5 rounded`}>
                                        {data.deltas.risk < 0 ? 'Reduced' : 'Managed'}
                                    </span>
                                    <span className="text-[11px] text-neutral-400 font-normal">vs {data.baseline.risk}</span>
                                </div>
                            </div>
                        </div>

                        {/* THE DECISION ASK */}
                        <div className="relative bg-neutral-50 border border-neutral-200 rounded-lg p-14 pl-16 overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-accent-primary"></div>
                            <div className="flex items-start gap-8">
                                <div className="flex-1">
                                    <h2 className="text-[11px] font-bold text-accent-primary uppercase tracking-[0.15em] mb-5">The Decision Ask</h2>
                                    <p className="text-[32px] font-medium text-neutral-900 leading-[1.5]">
                                        {data.decisionAsk}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <button className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-accent-primary rounded-lg shadow-sm hover:shadow-md transition-all group cursor-pointer text-left">
                                        <div className="w-5 h-5 rounded-full border-2 border-accent-primary flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900">Approve</div>
                                            <div className="text-xs text-neutral-500">{data.scenario.status}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="py-12"></div>

                        {/* Single Column Layout */}
                        <div className="space-y-14">

                            {/* Executive Snapshot */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Executive Snapshot
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: "Portfolio Value", value: formatCurrency(data.executiveSnapshot.portfolioValue), sub: formatDelta(data.deltas.value), trend: data.deltas.value > 0 ? "up" : "neutral" },
                                        { label: "Total Cost", value: formatCurrency(data.executiveSnapshot.totalCost), sub: formatDelta(data.deltas.investment), trend: data.deltas.investment < 0 ? "down" : "neutral" },
                                        { label: "Capacity Utilization", value: `${data.executiveSnapshot.capacityUtilization.toFixed(0)}%`, sub: data.executiveSnapshot.capacityUtilization < 95 ? "Optimal" : "High", trend: "neutral" },
                                        { label: "Risk Level", value: data.executiveSnapshot.riskLevel, sub: data.deltas.risk < 0 ? "Lower" : "Managed", trend: data.deltas.risk < 0 ? "down" : "neutral" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-baseline py-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors px-3 -mx-3 rounded">
                                            <span className="text-sm font-medium text-neutral-600">{item.label}</span>
                                            <div className="text-right flex items-baseline gap-8">
                                                <span className={`text-[11px] font-medium ${item.trend === 'up' || (item.trend === 'down' && (item.label.includes('Risk') || item.label.includes('Cost'))) ? 'text-status-green' : 'text-neutral-400'}`}>
                                                    {item.sub}
                                                </span>
                                                <span className="text-2xl font-bold font-mono text-neutral-900 w-32 text-right">{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trade-Off Summary */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Trade-Off Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-status-red-bg/40 p-7 rounded-lg border border-status-red-border/40">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2 h-2 rounded-full bg-status-red"></div>
                                            <span className="text-[11px] font-bold text-status-red uppercase tracking-[0.08em]">What Changed</span>
                                        </div>
                                        <ul className="space-y-4">
                                            {data.tradeOffSummary.whatChanged.map((item, idx) => (
                                                <li key={idx} className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-status-green-bg/40 p-7 rounded-lg border border-status-green-border/40">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2 h-2 rounded-full bg-status-green"></div>
                                            <span className="text-[11px] font-bold text-status-green uppercase tracking-[0.08em]">What Gained</span>
                                        </div>
                                        <ul className="space-y-4">
                                            {data.tradeOffSummary.whatGained.map((item, idx) => (
                                                <li key={idx} className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Scenario Comparison */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Scenario Comparison
                                </h3>
                                <div className="border border-neutral-200 rounded-lg overflow-hidden text-sm max-w-2xl">
                                    <div className="grid grid-cols-3 bg-neutral-50 border-b border-neutral-200">
                                        <div className="p-4 font-semibold text-[10px] text-neutral-500 uppercase tracking-wider">Metric</div>
                                        <div className="p-4 text-center font-medium text-[10px] text-neutral-400 uppercase tracking-wider">Baseline</div>
                                        <div className="p-4 text-center font-bold text-[10px] text-accent-primary uppercase tracking-wider bg-accent-primary/10">{data.scenario.name.split(' ')[0]} ★</div>
                                    </div>
                                    {[
                                        { label: 'Investment', b: formatCurrency(data.scenarioComparison.baseline.investment), r: formatCurrency(data.scenarioComparison.current.investment) },
                                        { label: 'Value', b: formatCurrency(data.scenarioComparison.baseline.value), r: formatCurrency(data.scenarioComparison.current.value) },
                                        { label: 'Cap. Used', b: `${data.scenarioComparison.baseline.capacityUsed.toFixed(0)}%`, r: `${data.scenarioComparison.current.capacityUsed.toFixed(0)}%` },
                                        { label: 'Risk', b: data.scenarioComparison.baseline.risk, r: data.scenarioComparison.current.risk },
                                    ].map((row, i) => (
                                        <div key={i} className="grid grid-cols-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30">
                                            <div className="p-4 font-medium text-neutral-600">{row.label}</div>
                                            <div className="p-4 text-center text-neutral-400 font-mono text-sm">{row.b}</div>
                                            <div className="p-4 text-center font-bold font-mono text-neutral-900 bg-accent-primary/10 text-sm">
                                                {row.r}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Risks */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Key Risks
                                </h3>
                                <div className="space-y-6">
                                    {data.keyRisks.map((risk, idx) => (
                                        <div key={idx} className="border-l-2 border-neutral-200 pl-6 py-3 hover:border-neutral-400 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-neutral-800 text-sm">{risk}</div>
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 py-1 px-2.5 rounded-full whitespace-nowrap">
                                                    {idx === 0 || idx === 1 ? 'MEDIUM' : 'LOW'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="py-12"></div>

                        {/* What We Are Not Funding */}
                        {data.unfundedInitiatives.length > 0 && (
                            <div className="bg-neutral-50 rounded-lg p-10 border border-neutral-100">
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-200/50">
                                    What We Are Not Funding
                                </h3>
                                <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10 pb-8 border-b border-neutral-200/60">
                                    <div>
                                        <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Initiatives Stopped</div>
                                        <div className="text-2xl font-bold text-neutral-900 font-mono">{data.decisions.stop.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Capacity Released</div>
                                        <div className="text-2xl font-bold text-neutral-900 font-mono">
                                            {data.unfundedInitiatives.reduce((sum: number, init: any) => sum + init.capacityReleased, 0)} <span className="text-xs text-neutral-400 font-sans font-medium">FTE</span>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {data.unfundedInitiatives.slice(0, 5).map((init: any) => (
                                        <li key={init.id} className="text-sm text-neutral-400 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></span>
                                            {init.name} <span className="text-xs text-neutral-500">({init.decision})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t border-neutral-200/50">
                            <div className="flex flex-wrap justify-between items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                                <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">Audit Record</div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] text-neutral-400">
                                    <span className="font-mono whitespace-nowrap">ID: {data.scenario.id.substring(0, 12)}</span>
                                    <span className="whitespace-nowrap">Prepared By: {data.scenario.decisionOwner}</span>
                                    <span className="whitespace-nowrap">{new Date(data.scenario.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-neutral-400 no-print pb-10">
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
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
          .page-container {
             padding: 10mm;
             max-width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
