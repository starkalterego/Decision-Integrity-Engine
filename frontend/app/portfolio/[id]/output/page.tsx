'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function ExecutiveOutputPage() {
    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(0)}Cr`;

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-neutral-200">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="output" />

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

                    {/* ==================================================================================
                        TIER 1: DECISION & OUTCOME (IMMEDIATE ATTENTION)
                       ================================================================================== */}

                    {/* 1️⃣ Header Block - Reduced Height, De-emphasized Metadata */}
                    <div className="px-10 py-4 border-b border-neutral-100 flex justify-between items-end">
                        <div>
                            <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-1">Portfolio Decision Artifact</div>
                            <div className="text-3xl font-bold tracking-tight text-neutral-900">Digital Transformation</div>
                            <div className="text-sm text-neutral-400 mt-0.5 font-normal">Scenario: Optimization B</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">Decision Owner</div>
                            <div className="text-sm font-medium text-neutral-500">J. Doe</div>
                            <div className="text-xs text-neutral-400 font-mono mt-0.5">January 8, 2026</div>
                        </div>
                    </div>

                    <div className="p-10 pb-14 space-y-16">

                        {/* 2️⃣ Top Metric Cards - Enlarged Numbers, Reduced Label Weight */}
                        <div className="grid grid-cols-4 gap-8">
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Investment</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">120 Cr</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-status-red bg-status-red-bg px-2 py-0.5 rounded">-10%</span>
                                    <span className="text-[11px] text-neutral-400 font-normal">vs Baseline</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Expected Value</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">185 Cr</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-status-green bg-status-green-bg px-2 py-0.5 rounded">+18%</span>
                                    <span className="text-[11px] text-neutral-400 font-normal">vs Baseline</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Capacity Use</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">92%</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-status-green bg-status-green-bg px-2 py-0.5 rounded">Optimal</span>
                                    <span className="text-[11px] text-neutral-400 font-normal">Tolerance &lt;95%</span>
                                </div>
                            </div>
                            <div className="bg-neutral-50/40 rounded-lg p-7 border-0 hover:bg-neutral-50/60 transition-all">
                                <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mb-4">Risk Exposure</div>
                                <div className="text-5xl font-bold text-neutral-900 tracking-tight font-mono mb-3">Medium</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-status-green bg-status-green-bg px-2 py-0.5 rounded">Reduced</span>
                                    <span className="text-[11px] text-neutral-400 font-normal">2 High Risks Removed</span>
                                </div>
                            </div>
                        </div>

                        {/* 4️⃣ THE DECISION ASK - Visually Dominant */}
                        <div className="relative bg-neutral-50 border border-neutral-200 rounded-lg p-14 pl-16 overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-accent-primary"></div>
                            <div className="flex items-start gap-8">
                                <div className="flex-1">
                                    <h2 className="text-[11px] font-bold text-accent-primary uppercase tracking-[0.15em] mb-5">The Decision Ask</h2>
                                    <p className="text-[32px] font-medium text-neutral-900 leading-[1.5]">
                                        Approve <span className="font-bold underline decoration-accent-primary/30 decoration-2 underline-offset-8">Scenario B</span> — a ₹120 Cr funded portfolio delivering ₹185 Cr expected value with controlled capacity utilization (92%) and reduced risk exposure.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <button className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-accent-primary rounded-lg shadow-sm hover:shadow-md transition-all group cursor-pointer text-left">
                                        <div className="w-5 h-5 rounded-full border-2 border-accent-primary flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900">Approve</div>
                                            <div className="text-xs text-neutral-500">Recommended</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* ==================================================================================
                            TIER 2: WHY THIS DECISION (THE CONTEXT)
                           ================================================================================== */}

                        <div className="py-12"></div> {/* Increased Whitespace separator */}

                        {/* Single Column Layout for Clean Presentation */}
                        <div className="space-y-14">

                            {/* Executive Snapshot - Primary */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Executive Snapshot
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: "Portfolio Value", value: "185 Cr", sub: "+18%", trend: "up" },
                                        { label: "Total Cost", value: "120 Cr", sub: "-10%", trend: "down" },
                                        { label: "Capacity Utilization", value: "92%", sub: "Optimal", trend: "neutral" },
                                        { label: "Risk Level", value: "Medium", sub: "Lower", trend: "down" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-baseline py-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors px-3 -mx-3 rounded">
                                            <span className="text-sm font-medium text-neutral-600">{item.label}</span>
                                            <div className="text-right flex items-baseline gap-8">
                                                <span className={`text-[11px] font-medium ${item.trend === 'up' || (item.trend === 'down' && item.label.includes('Risk')) || (item.trend === 'down' && item.label.includes('Cost')) ? 'text-status-green' : 'text-neutral-400'}`}>
                                                    {item.sub}
                                                </span>
                                                <span className="text-2xl font-bold font-mono text-neutral-900 w-32 text-right">{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trade-Off Summary - The Why */}
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
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• Stopped 3 initiatives <span className="text-neutral-500 text-xs ml-1">(freed ₹22 Cr)</span></li>
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• Delayed 2 initiatives <span className="text-neutral-500 text-xs ml-1">(protects capacity)</span></li>
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• Shifted funding to high NPV programs</li>
                                        </ul>
                                    </div>
                                    <div className="bg-status-green-bg/40 p-7 rounded-lg border border-status-green-border/40">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2 h-2 rounded-full bg-status-green"></div>
                                            <span className="text-[11px] font-bold text-status-green uppercase tracking-[0.08em]">What Gained</span>
                                        </div>
                                        <ul className="space-y-4">
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• +₹28 Cr incremental value</li>
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• Lower delivery risk profile</li>
                                            <li className="text-sm text-neutral-700 leading-relaxed font-medium break-words">• Improved capacity headroom</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Scenario Comparison - Supporting */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Scenario Comparison
                                </h3>
                                <div className="border border-neutral-200 rounded-lg overflow-hidden text-sm max-w-2xl">
                                    <div className="grid grid-cols-4 bg-neutral-50 border-b border-neutral-200">
                                        <div className="p-4 font-semibold text-[10px] text-neutral-500 uppercase tracking-wider">Metric</div>
                                        <div className="p-4 text-center font-medium text-[10px] text-neutral-400 uppercase tracking-wider">Baseline</div>
                                        <div className="p-4 text-center font-medium text-[10px] text-neutral-400 uppercase tracking-wider">A</div>
                                        <div className="p-4 text-center font-bold text-[10px] text-accent-primary uppercase tracking-wider bg-accent-primary/10">B ★</div>
                                    </div>
                                    {[
                                        { label: 'Investment', b: '135', a: '125', r: '120', u: 'Cr' },
                                        { label: 'Value', b: '157', a: '172', r: '185', u: 'Cr' },
                                        { label: 'Cap. Used', b: '109', a: '96', r: '92', u: '%' },
                                        { label: 'Risk', b: 'High', a: 'Med', r: 'Med', u: '' },
                                    ].map((row, i) => (
                                        <div key={i} className="grid grid-cols-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30">
                                            <div className="p-4 font-medium text-neutral-600">{row.label}</div>
                                            <div className="p-4 text-center text-neutral-300 font-mono text-sm">{row.b}</div>
                                            <div className="p-4 text-center text-neutral-400 font-mono text-sm">{row.a}</div>
                                            <div className="p-4 text-center font-bold font-mono text-neutral-900 bg-accent-primary/10 relative text-sm">
                                                {row.r}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Risks - Controlled */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-100">
                                    Key Risks
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { id: 1, title: "Adoption lag in Market A", risk: "Medium", mitigation: "Phased rollout + Change Management" },
                                        { id: 2, title: "Vendor dependency on Program Z", risk: "Medium", mitigation: "Contract renegotiation planned" },
                                        { id: 3, title: "Resource availability Q2", risk: "Low", mitigation: "Early hiring pipeline established" }
                                    ].map((risk) => (
                                        <div key={risk.id} className="border-l-2 border-neutral-200 pl-6 py-3 hover:border-neutral-400 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-neutral-800 text-sm">{risk.title}</div>
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 py-1 px-2.5 rounded-full whitespace-nowrap">{risk.risk}</span>
                                            </div>
                                            <div className="text-xs text-neutral-500 leading-relaxed mt-2">
                                                <span className="font-semibold text-neutral-400 uppercase tracking-wide text-[9px] mr-2">Mitigation:</span>
                                                {risk.mitigation}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>


                        {/* ==================================================================================
                            TIER 3: AUDIT & EXECUTION (EXECUTION PLAN)
                           ================================================================================== */}

                        <div className="py-12"></div> {/* Increased Whitespace separator */}

                        <div className="bg-neutral-50 rounded-lg p-10 border border-neutral-100">
                            <div className="grid grid-cols-2 gap-16">

                                {/* What We Are Not Funding - Value Protection */}
                                <div>
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-200/50">
                                        What We Are Not Funding
                                    </h3>

                                    {/* Impact Strip - Promoted */}
                                    <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10 pb-8 border-b border-neutral-200/60">
                                        <div>
                                            <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Initiatives Stopped</div>
                                            <div className="text-2xl font-bold text-neutral-900 font-mono">3</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Cost Avoided</div>
                                            <div className="text-2xl font-bold text-status-green font-mono">₹22 Cr</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Capacity Released</div>
                                            <div className="text-2xl font-bold text-neutral-900 font-mono">14 Mo <span className="text-xs text-neutral-400 font-sans font-medium">FTE</span></div>
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        <li className="text-sm text-neutral-400 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></span>
                                            Program X (Low ROI / High Drag)
                                        </li>
                                        <li className="text-sm text-neutral-400 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></span>
                                            Program Y (Capacity Heavy)
                                        </li>
                                        <li className="text-sm text-neutral-400 flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></span>
                                            Legacy Migration Phase 2
                                        </li>
                                    </ul>
                                </div>

                                {/* Next 30 Days Execution - Precision */}
                                <div>
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-8 pb-2 border-b border-neutral-200/50">
                                        Next 30 Days Execution
                                    </h3>
                                    <div className="relative mt-12">
                                        {/* Timeline Line */}
                                        <div className="absolute top-2 left-0 right-0 h-px bg-neutral-200"></div>

                                        <div className="grid grid-cols-4 gap-1 relative z-10">
                                            {[
                                                { label: "Decision", date: "Jan 8", status: "done" },
                                                { label: "Funding Rel.", date: "Jan 15", status: "pending" },
                                                { label: "Kickoff", date: "Jan 20", status: "pending" },
                                                { label: "Checkpoint", date: "Apr 20", status: "pending" }
                                            ].map((step, i) => (
                                                <div key={i} className="flex flex-col items-center text-center">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-accent-primary border-accent-primary' : 'bg-white border-neutral-300'} mb-4 shadow-sm`}></div>
                                                    <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-wide leading-tight">{step.label}</div>
                                                    <div className="text-[11px] text-neutral-400 mt-2 font-mono">{step.date}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Consolidated Audit & Footer */}
                        <div className="mt-16 pt-8 border-t border-neutral-200/50">
                            <div className="flex flex-wrap justify-between items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                                <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">Audit Record</div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] text-neutral-400">
                                    <span className="font-mono whitespace-nowrap">ID: SC-FY26-001-B</span>
                                    <span className="font-mono whitespace-nowrap">VER: 2.1</span>
                                    <span className="font-mono whitespace-nowrap">US-EAST-1</span>
                                    <span className="whitespace-nowrap">Prepared By: J. Doe</span>
                                    <span className="whitespace-nowrap">January 8, 2026</span>
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

{/* End of Component */ }
