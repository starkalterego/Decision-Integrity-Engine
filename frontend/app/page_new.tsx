'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-neutral-900">
            Decision Integrity Engine
          </Link>
          <div className="text-sm text-neutral-600">
            Portfolio Governance Platform
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Portfolio Decision Management
          </h1>
          <p className="text-lg text-neutral-600">
            Create portfolios, add initiatives, build scenarios, and generate decision reports
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/portfolio/demo/setup"
            className="group bg-white rounded-lg border border-neutral-200 p-8 hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Create Portfolio</h3>
            <p className="text-sm text-neutral-600">
              Set up a new portfolio with budget, capacity, and governance constraints
            </p>
          </Link>

          <Link 
            href="/portfolio/demo/initiatives"
            className="group bg-white rounded-lg border border-neutral-200 p-8 hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Manage Initiatives</h3>
            <p className="text-sm text-neutral-600">
              Add and prioritize initiatives with value, cost, risk, and capacity data
            </p>
          </Link>

          <Link 
            href="/portfolio/demo/output"
            className="group bg-white rounded-lg border border-neutral-200 p-8 hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
          >
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">View Reports</h3>
            <p className="text-sm text-neutral-600">
              Generate portfolio analysis and decision reports with metrics
            </p>
          </Link>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div className="hidden md:block flex-1 h-0.5 bg-neutral-200 ml-4"></div>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">Setup Portfolio</h3>
              <p className="text-sm text-neutral-600">Define budget, capacity constraints, and baseline assumptions</p>
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div className="hidden md:block flex-1 h-0.5 bg-neutral-200 ml-4"></div>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">Add Initiatives</h3>
              <p className="text-sm text-neutral-600">Input value, cost, capacity, risk, and alignment scores</p>
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div className="hidden md:block flex-1 h-0.5 bg-neutral-200 ml-4"></div>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">Build Scenarios</h3>
              <p className="text-sm text-neutral-600">Create multiple decision scenarios with different assumptions</p>
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2">Generate Report</h3>
              <p className="text-sm text-neutral-600">Export comprehensive decision analysis and recommendations</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Governance Features</h3>
            <ul className="space-y-3 text-sm text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Backend-enforced completeness validation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Capacity constraints as hard limits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Immutable audit trail for all decisions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Binary status reporting (no amber gaming)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Automatic priority calculation and ranking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Output & Analysis</h3>
            <ul className="space-y-3 text-sm text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Single-page portfolio summary with key metrics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Scenario comparison and trade-off analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Executive summary with recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Priority-ranked initiative lists</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full mt-2"></span>
                <span>Capacity utilization and constraint validation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-neutral-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Create your first portfolio, add initiatives, build scenarios, and generate a comprehensive decision report
          </p>
          <Link 
            href="/portfolio/demo/setup"
            className="inline-block px-8 py-4 bg-white text-neutral-900 font-bold rounded hover:bg-neutral-100 transition-all duration-200 shadow-lg"
          >
            Get Started Now
          </Link>
        </div>

      </main>
    </div>
  );
}
