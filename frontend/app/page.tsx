'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet } from '@/lib/api';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  totalBudget: number;
  totalCapacity: number;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(true); // Require authentication
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = useCallback(async () => {
    try {
      const response = await authGet('/api/portfolios', {
        cache: 'no-store' // Ensure fresh data
      });
      if (response.ok) {
        const result = await response.json();
        setPortfolios(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-neutral-900"></div>
          <p className="text-neutral-600 mt-6 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight hover:text-neutral-700 transition-colors">
            Decision Integrity Engine
          </Link>
          <div className="text-sm font-medium text-neutral-500 tracking-wide uppercase">
            Portfolio Governance Platform
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        
        {/* Welcome Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight leading-tight">
                Portfolio Decision Management
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed">
                Manage portfolios, initiatives, scenarios, and generate decision reports with governance-first design principles
              </p>
            </div>
            <Link
              href="/portfolio/create"
              className="shrink-0 px-8 py-3.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 hover:shadow-lg transition-all duration-200 shadow-md text-base"
            >
              + New Portfolio
            </Link>
          </div>
        </div>

        {/* Existing Portfolios */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-neutral-900"></div>
            <p className="text-neutral-600 mt-6 font-medium">Loading portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-linear-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">No Portfolios Yet</h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">Create your first portfolio to get started with portfolio decision management and governance</p>
            <Link
              href="/portfolio/create"
              className="inline-block px-8 py-3.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 hover:shadow-lg transition-all"
            >
              Create Your First Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-xl hover:border-neutral-300 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">{portfolio.name}</h3>
                    {portfolio.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2">{portfolio.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pb-5 border-b border-neutral-200">
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Budget</div>
                    <div className="font-mono text-base font-bold text-neutral-900">₹{portfolio.totalBudget}Cr</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Capacity</div>
                    <div className="font-mono text-base font-bold text-neutral-900">{portfolio.totalCapacity} units</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/portfolio/${portfolio.id}/setup`}
                    className="text-xs text-center px-3 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 hover:shadow-sm transition-all"
                  >
                    Setup
                  </Link>
                  <Link
                    href={`/portfolio/${portfolio.id}/initiatives`}
                    className="text-xs text-center px-3 py-2.5 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 hover:shadow-sm transition-all"
                  >
                    Initiatives
                  </Link>
                  <Link
                    href={`/portfolio/${portfolio.id}/output`}
                    className="text-xs text-center px-3 py-2.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 hover:shadow-md transition-all"
                  >
                    Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner - Only show if portfolios exist */}
        {portfolios.length > 0 && (
          <div className="bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-xl p-10 shadow-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">Portfolio Governance Platform</h2>
              <p className="text-neutral-300 text-base leading-relaxed">
                Backend-enforced completeness validation • Capacity constraints as hard limits • Immutable audit trail • Binary status reporting
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-xl p-16 text-center shadow-lg mt-16">
          <h2 className="text-3xl font-bold mb-5 tracking-tight">Ready to Start?</h2>
          <p className="text-neutral-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Create your first portfolio, add initiatives, build scenarios, and generate a comprehensive decision report
          </p>
          <Link
            href="/portfolio/create"
            className="inline-block px-10 py-4 bg-white text-neutral-900 font-bold rounded-lg hover:bg-neutral-100 hover:shadow-xl transition-all duration-200 shadow-lg text-base"
          >
            Create Portfolio Now
          </Link>
        </div>

      </main>
    </div>
  );
}
