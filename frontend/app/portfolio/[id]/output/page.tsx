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
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="output" />

            <main className="page-container">
                <div className="section-header no-print">
                    <h1 className="text-2xl font-semibold">Executive One-Pager</h1>
                    <Button onClick={handleDownloadPDF}>Download PDF</Button>
                </div>

                {/* Executive One-Pager - Professional Design */}
                <div className="bg-white shadow-lg mx-auto border border-neutral-200" style={{ maxWidth: '1400px', borderRadius: '2px' }}>

                    {/* Header Section */}
                    <div className="border-b-4 border-accent-primary bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6">
                        <div className="grid grid-cols-3 gap-6 items-center">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Portfolio</div>
                                <div className="text-lg font-bold">Digital Transformation</div>
                                <div className="text-sm text-neutral-300">Scenario: Optimization B</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold tracking-tight">PORTFOLIO DECISION TOOL</div>
                                <div className="text-xs text-neutral-400 mt-1">Executive Decision Document</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Decision Owner</div>
                                <div className="text-base font-semibold">J. Doe</div>
                                <div className="text-sm text-neutral-300">January 8, 2026</div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 gap-0 border-b-2 border-neutral-200 bg-neutral-100">
                        <div className="p-5 border-r border-neutral-300">
                            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Total Investment</div>
                            <div className="text-3xl font-bold text-neutral-900 font-mono">120 Cr</div>
                            <div className="text-sm text-status-red font-semibold mt-1">-10% vs Baseline</div>
                        </div>
                        <div className="p-5 border-r border-neutral-300">
                            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Expected Value</div>
                            <div className="text-3xl font-bold text-neutral-900 font-mono">185 Cr</div>
                            <div className="text-sm text-status-green font-semibold mt-1">+18% vs Baseline</div>
                        </div>
                        <div className="p-5">
                            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Risk Exposure</div>
                            <div className="text-3xl font-bold text-neutral-900 font-mono">Medium</div>
                            <div className="text-sm text-status-green font-semibold mt-1">2 High-Risk Removed</div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-2 gap-8 p-8">

                        {/* Left Column */}
                        <div className="space-y-6">

                            {/* Section 1: The Ask */}
                            <div className="border-l-4 border-l-accent-primary bg-neutral-50 p-5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
                                    Section 1: The Decision Ask
                                </h3>
                                <div className="text-base leading-relaxed text-neutral-900">
                                    <strong className="font-semibold">DECISION:</strong> Approve Scenario B — a ₹120 Cr funded portfolio
                                    delivering ₹185 Cr expected value with controlled capacity utilization (92%) and reduced risk exposure.
                                </div>
                            </div>

                            {/* Section 2: Executive Snapshot */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 2: Executive Snapshot
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-neutral-50">
                                        <span className="text-sm font-medium text-neutral-700">Portfolio Value</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold font-mono">185 Cr</div>
                                            <div className="text-xs text-status-green font-semibold">+18%</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white border border-neutral-200">
                                        <span className="text-sm font-medium text-neutral-700">Total Cost</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold font-mono">120 Cr</div>
                                            <div className="text-xs text-status-red font-semibold">-10%</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-neutral-50">
                                        <span className="text-sm font-medium text-neutral-700">Capacity Utilization</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold font-mono">92%</div>
                                            <div className="text-xs text-status-green font-semibold">Within Tolerance</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white border border-neutral-200">
                                        <span className="text-sm font-medium text-neutral-700">Risk Level</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold font-mono">Medium</div>
                                            <div className="text-xs text-status-green font-semibold">Lower</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Trade-off Summary */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 3: Trade-off Summary (The Why)
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-status-red-bg border-l-4 border-l-status-red p-4">
                                        <div className="text-xs font-bold text-neutral-900 mb-2">WHAT CHANGED:</div>
                                        <ul className="text-sm text-neutral-700 space-y-1">
                                            <li>• Stopped 3 initiatives (freed ₹22 Cr)</li>
                                            <li>• Delayed 2 initiatives (protects capacity)</li>
                                            <li>• Shifted funding to high NPV programs</li>
                                        </ul>
                                    </div>
                                    <div className="bg-status-green-bg border-l-4 border-l-status-green p-4">
                                        <div className="text-xs font-bold text-neutral-900 mb-2">WHAT GAINED:</div>
                                        <ul className="text-sm text-neutral-700 space-y-1">
                                            <li>• +₹28 Cr incremental value</li>
                                            <li>• Lower delivery risk profile</li>
                                            <li>• Improved capacity headroom</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: What We Are Not Funding */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 5: What We Are Not Funding
                                </h3>
                                <div className="bg-neutral-100 p-4 border border-neutral-300">
                                    <div className="mb-3">
                                        <div className="text-xs font-bold text-neutral-900 mb-2">STOPPED / PAUSED:</div>
                                        <ul className="text-sm text-neutral-700 space-y-1">
                                            <li>• Program X (Low ROI / High Drag)</li>
                                            <li>• Program Y (Capacity Heavy)</li>
                                            <li>• Legacy Migration Phase 2</li>
                                        </ul>
                                    </div>
                                    <div className="pt-3 border-t border-neutral-300">
                                        <div className="text-xs font-bold text-neutral-900 mb-2">IMPACT:</div>
                                        <ul className="text-sm text-neutral-700 space-y-1">
                                            <li>• ₹22 Cr cost avoided</li>
                                            <li>• 14 FTE months released</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Section 7: Decision & Next 30 Days */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 7: Decision & Next 30 Days
                                </h3>
                                <div className="bg-white border-2 border-neutral-300 p-4">
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-neutral-900 mb-3">DECISION REQUIRED:</div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-2 hover:bg-neutral-50 cursor-pointer">
                                                <input type="radio" name="decision" className="w-4 h-4" />
                                                <span className="text-sm font-medium">Approve Scenario B (Recommended)</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-2 hover:bg-neutral-50 cursor-pointer">
                                                <input type="radio" name="decision" className="w-4 h-4" />
                                                <span className="text-sm font-medium">Modify</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-2 hover:bg-neutral-50 cursor-pointer">
                                                <input type="radio" name="decision" className="w-4 h-4" />
                                                <span className="text-sm font-medium">Reject</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-200">
                                        <div className="text-xs font-bold text-neutral-900 mb-2">IF APPROVED:</div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <div className="text-xs text-neutral-600">Funding Released</div>
                                                <div className="font-semibold">15-Jan</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-neutral-600">Execution Kickoff</div>
                                                <div className="font-semibold">20-Jan</div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-xs text-neutral-600">First Value Checkpoint</div>
                                                <div className="font-semibold">20-Apr (+90 Days)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">

                            {/* Section 4: Scenario Comparison */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 4: Scenario Comparison
                                </h3>
                                <div className="overflow-hidden border border-neutral-300">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-neutral-900 text-white">
                                                <th className="text-left p-3 font-semibold text-xs uppercase">Metric</th>
                                                <th className="text-center p-3 font-semibold text-xs uppercase">Baseline</th>
                                                <th className="text-center p-3 font-semibold text-xs uppercase">Scenario A</th>
                                                <th className="text-center p-3 font-semibold text-xs uppercase bg-accent-primary">
                                                    Scenario B
                                                    <div className="text-xs font-normal mt-1 text-status-green">(REC)</div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-neutral-200 bg-white">
                                                <td className="p-3 font-medium">Investment</td>
                                                <td className="text-center p-3 font-mono bg-neutral-50">135 Cr</td>
                                                <td className="text-center p-3 font-mono">125 Cr</td>
                                                <td className="text-center p-3 font-mono font-bold bg-status-green-bg">120 Cr</td>
                                            </tr>
                                            <tr className="border-b border-neutral-200 bg-white">
                                                <td className="p-3 font-medium">Value</td>
                                                <td className="text-center p-3 font-mono bg-neutral-50">157 Cr</td>
                                                <td className="text-center p-3 font-mono">172 Cr</td>
                                                <td className="text-center p-3 font-mono font-bold bg-status-green-bg">185 Cr</td>
                                            </tr>
                                            <tr className="border-b border-neutral-200 bg-white">
                                                <td className="p-3 font-medium">Capacity Used</td>
                                                <td className="text-center p-3 font-mono bg-neutral-50">109%</td>
                                                <td className="text-center p-3 font-mono">96%</td>
                                                <td className="text-center p-3 font-mono font-bold bg-status-green-bg">92%</td>
                                            </tr>
                                            <tr className="bg-white">
                                                <td className="p-3 font-medium">Risk Level</td>
                                                <td className="text-center p-3 font-mono bg-neutral-50">High</td>
                                                <td className="text-center p-3 font-mono">Medium</td>
                                                <td className="text-center p-3 font-mono font-bold bg-status-green-bg">Medium</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Section 6: Key Risks */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 pb-2 border-b border-neutral-300">
                                    Section 6: Key Risks (Top 3)
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white border border-neutral-300 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-status-red text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                1
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900 mb-1">Adoption lag in Market A</div>
                                                <div className="text-xs text-neutral-600">
                                                    <strong>Mitigation:</strong> Phased rollout + Change Management kept
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-neutral-300 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                2
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900 mb-1">Vendor dependency on Program Z</div>
                                                <div className="text-xs text-neutral-600">
                                                    <strong>Mitigation:</strong> Contract renegotiation planned
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-neutral-300 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                3
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-neutral-900 mb-1">Resource availability Q2</div>
                                                <div className="text-xs text-neutral-600">
                                                    <strong>Mitigation:</strong> Early hiring pipeline established
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Branding/Logo Section */}
                            <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-neutral-300 p-8 text-center">
                                <div className="text-6xl mb-3">⚓</div>
                                <div className="text-lg font-bold text-neutral-900">Smartprojects</div>
                                <div className="text-xs text-neutral-600 mt-1">Decision Integrity Platform</div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-neutral-300 bg-neutral-50 p-6">
                        <div className="grid grid-cols-4 gap-6 text-sm">
                            <div>
                                <div className="text-xs text-neutral-600 mb-1">Prepared By</div>
                                <div className="font-semibold text-neutral-900">Portfolio Lead</div>
                            </div>
                            <div>
                                <div className="text-xs text-neutral-600 mb-1">Decision Date</div>
                                <div className="font-semibold text-neutral-900">January 8, 2026</div>
                            </div>
                            <div>
                                <div className="text-xs text-neutral-600 mb-1">Scenario ID</div>
                                <div className="font-mono text-xs text-neutral-900">SC-FY26-001-B</div>
                            </div>
                            <div>
                                <div className="text-xs text-neutral-600 mb-1">Status</div>
                                <div className="inline-block px-3 py-1 bg-status-green text-white text-xs font-semibold" style={{ borderRadius: '2px' }}>
                                    Recommended
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-neutral-600 no-print">
                    <p>This document is system-generated and represents an immutable decision record.</p>
                    <p className="mt-2 text-xs">Press Ctrl+P or click Download PDF to print</p>
                </div>
            </main>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>
        </div>
    );
}
