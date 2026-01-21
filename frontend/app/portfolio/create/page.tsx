'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authPost } from '@/lib/api';
import Header from '@/components/layout/Header';

export default function CreatePortfolioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(true); // Require authentication
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    fiscalPeriod: '',
    totalBudget: '',
    totalCapacity: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) return; // Prevent double submit
    
    setIsCreating(true);
    setError('');
    
    try {
      const response = await authPost('/api/portfolios', {
        name: newPortfolio.name,
        fiscalPeriod: newPortfolio.fiscalPeriod,
        totalBudget: parseFloat(newPortfolio.totalBudget),
        totalCapacity: parseInt(newPortfolio.totalCapacity),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          router.push(`/portfolio/${result.data.portfolioId}/setup`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.[0]?.message || 'Failed to create portfolio');
      }
    } catch (err) {
      console.error('Failed to create portfolio:', err);
      setError('Failed to create portfolio. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading) {
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
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-8 md:p-12 shadow-lg">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create New Portfolio</h1>
          <p className="text-neutral-600 mb-8">Set up a new portfolio for decision management and governance</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleCreatePortfolio} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Portfolio Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newPortfolio.name}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="e.g., Q1 2026 Portfolio"
              />
              <p className="mt-1.5 text-xs text-neutral-500">Choose a descriptive name for your portfolio</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Fiscal Period <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newPortfolio.fiscalPeriod}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, fiscalPeriod: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="e.g., FY2026-Q1, 2026, Jan-Mar 2026"
              />
              <p className="mt-1.5 text-xs text-neutral-500">Specify the fiscal period or year for this portfolio</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Total Budget (₹ Cr) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newPortfolio.totalBudget}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, totalBudget: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="e.g., 100"
              />
              <p className="mt-1.5 text-xs text-neutral-500">Enter the total budget in Crores of Rupees</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Total Capacity (Units) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={newPortfolio.totalCapacity}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, totalCapacity: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="e.g., 450"
              />
              <p className="mt-1.5 text-xs text-neutral-500">Specify the total capacity available in person-days or units</p>
            </div>

            <div className="flex gap-4 pt-6 border-t border-neutral-200">
              <Link
                href="/"
                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Portfolio'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
