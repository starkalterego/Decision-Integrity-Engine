'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ExecutiveOutputPage() {
    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`;

    const handleDownloadPDF = () => {
        alert('PDF export functionality would be implemented here');
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header portfolioName="FY26 Growth Portfolio" portfolioId="demo" currentPage="output" />

            <main className="page-container">
                <div className="section-header">
                    <h1 className="text-2xl font-semibold">Executive One-Pager</h1>
                    <Button onClick={handleDownloadPDF}>Download PDF</Button>
                </div>

                {/* Print-optimized output */}
                <div className="bg-white border border-neutral-200 p-12 max-w-5xl mx-auto" style={{ borderRadius: '2px' }}>
                    {/* Header Section */}
                    <div className="border-b border-neutral-300 pb-6 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-semibold mb-2">FY26 Growth Portfolio</h2>
                                <p className="text-neutral-600">Recommended Scenario: <span className="font-semibold">Scenario A - Aggressive Growth</span></p>
                                <p className="text-sm text-neutral-600">Fiscal Period: FY26</p>
                            </div>
                            <StatusBadge status="green" text="Approved" />
                        </div>
                    </div>

                    {/* Metrics Strip */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Key Metrics</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-300">
                                    <th className="text-left py-2">Metric</th>
                                    <th className="text-right py-2">Value</th>
                                    <th className="text-right py-2">Delta vs Baseline</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Total Investment</td>
                                    <td className="text-right font-mono">{formatCurrency(130000000)}</td>
                                    <td className="text-right font-mono text-status-red">+8.3%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Expected Value</td>
                                    <td className="text-right font-mono">{formatCurrency(210000000)}</td>
                                    <td className="text-right font-mono text-status-green">+13.5%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Capacity Utilization</td>
                                    <td className="text-right font-mono">430 / 450 units</td>
                                    <td className="text-right font-mono text-status-green">-4.4%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Risk Exposure</td>
                                    <td className="text-right font-mono">6.8 / 10</td>
                                    <td className="text-right font-mono text-status-green">-9.3%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* The Decision Ask */}
                    <div className="mb-8 p-6 bg-neutral-100 border-l-4 border-accent-primary">
                        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">The Decision Ask</h3>
                        <p className="text-lg font-semibold text-neutral-900 leading-relaxed">
                            Approve Scenario A: ₹130 Cr funded portfolio delivering ₹210 Cr expected value
                            with controlled capacity utilization (95.6%) and reduced risk exposure.
                        </p>
                    </div>

                    {/* Executive Snapshot */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Executive Snapshot</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-300">
                                    <th className="text-left py-2">Metric</th>
                                    <th className="text-right py-2">Selected Scenario</th>
                                    <th className="text-right py-2">Delta vs Baseline</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Portfolio Value</td>
                                    <td className="text-right font-mono">{formatCurrency(210000000)}</td>
                                    <td className="text-right font-mono text-status-green">+13.5%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Total Cost</td>
                                    <td className="text-right font-mono">{formatCurrency(130000000)}</td>
                                    <td className="text-right font-mono text-status-red">+8.3%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Capacity Utilization</td>
                                    <td className="text-right font-mono">95.6%</td>
                                    <td className="text-right font-mono text-status-green">-4.4%</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-3">Risk Exposure</td>
                                    <td className="text-right font-mono">6.8 / 10</td>
                                    <td className="text-right font-mono text-status-green">-9.3%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Initiative Decisions Summary */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Initiative Decisions Summary</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-300">
                                    <th className="text-left py-2">Initiative</th>
                                    <th className="text-center py-2">Decision</th>
                                    <th className="text-right py-2">Value</th>
                                    <th className="text-right py-2">Capacity</th>
                                    <th className="text-right py-2">Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2">CRM Modernization</td>
                                    <td className="text-center">
                                        <span className="bg-status-green text-white px-2 py-1 text-xs" style={{ borderRadius: '2px' }}>FUND</span>
                                    </td>
                                    <td className="text-right font-mono">{formatCurrency(35000000)}</td>
                                    <td className="text-right font-mono">50</td>
                                    <td className="text-right font-mono">3/5</td>
                                </tr>
                                <tr className="border-b border-neutral-200">
                                    <td className="py-2">Data Platform Upgrade</td>
                                    <td className="text-center">
                                        <span className="bg-status-green text-white px-2 py-1 text-xs" style={{ borderRadius: '2px' }}>FUND</span>
                                    </td>
                                    <td className="text-right font-mono">{formatCurrency(50000000)}</td>
                                    <td className="text-right font-mono">80</td>
                                    <td className="text-right font-mono">4/5</td>
                                </tr>
                                <tr className="border-b border-neutral-200 text-neutral-500">
                                    <td className="py-2">Mobile App Redesign</td>
                                    <td className="text-center">
                                        <span className="bg-neutral-300 text-neutral-700 px-2 py-1 text-xs" style={{ borderRadius: '2px' }}>PAUSE</span>
                                    </td>
                                    <td className="text-right font-mono">{formatCurrency(25000000)}</td>
                                    <td className="text-right font-mono">40</td>
                                    <td className="text-right font-mono">2/5</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Capacity & Risk Signals */}
                    <div className="mb-8 grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Capacity Status</h4>
                            <StatusBadge status="green" text="Within Limits" />
                            <p className="text-sm text-neutral-600 mt-2">
                                430 of 450 units allocated (95.6% utilization)
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Risk Status</h4>
                            <StatusBadge status="green" text="Acceptable" />
                            <p className="text-sm text-neutral-600 mt-2">
                                Average risk score of 6.8/10, within acceptable range
                            </p>
                        </div>
                    </div>

                    {/* Decision Record Footer */}
                    <div className="border-t border-neutral-300 pt-6 mt-8">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="text-neutral-600 mb-1">Recommended By</p>
                                <p className="font-semibold">Portfolio Lead</p>
                            </div>
                            <div>
                                <p className="text-neutral-600 mb-1">Decision Date</p>
                                <p className="font-semibold">January 8, 2026</p>
                            </div>
                            <div>
                                <p className="text-neutral-600 mb-1">Scenario ID</p>
                                <p className="font-mono text-xs">SC-FY26-001-A</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-neutral-600">
                    <p>This document is system-generated and represents an immutable decision record.</p>
                </div>
            </main>
        </div>
    );
}
