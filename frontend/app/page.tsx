'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet, authPost } from '@/lib/api';

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
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreatePortfolio = useCallback(async () => {
    if (isCreating) return; // Prevent double submit
    
    setIsCreating(true);
    try {
      // Create a new portfolio with default values
      const response = await authPost('/api/portfolios', {
        name: 'New Portfolio',
        fiscalPeriod: new Date().getFullYear().toString(),
        totalBudget: 100,
        totalCapacity: 450,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data && result.data.portfolioId) {
          router.push(`/portfolio/${result.data.portfolioId}/setup`);
        }
      } else {
        console.error('Failed to create portfolio:', result.errors);
        const errorMessage = result.errors?.[0]?.message || 'Failed to create portfolio';
        alert(`Error: ${errorMessage}`);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert('Failed to create portfolio. Please try again.');
      setIsCreating(false);
    }
  }, [isCreating, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1e293b] border-t-[#00d9ff]"></div>
          <p className="mt-6 font-medium" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will be redirected by useAuth)
  if (!user) {
    return null;
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1e293b] border-t-[#00d9ff]"></div>
          <p className="mt-6 font-medium" style={{ color: 'var(--text-secondary)' }}>Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Navigation */}
      <nav style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight transition-colors" style={{ color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(0, 217, 255, 0.3)' }}>
            Decision Integrity Engine
          </Link>
          <div className="text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--text-tertiary)' }}>
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
              <h1 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                Portfolio Decision Management
              </h1>
              <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Manage portfolios, initiatives, scenarios, and generate decision reports with governance-first design principles
              </p>
            </div>
            <button
              onClick={handleCreatePortfolio}
              disabled={isCreating}
              className="shrink-0 px-8 py-3.5 font-semibold rounded-lg transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'var(--bg-primary)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)'}
            >
              {isCreating ? 'Creating...' : '+ New Portfolio'}
            </button>
          </div>
        </div>

        {/* Existing Portfolios */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-neutral-900"></div>
            <p className="text-neutral-600 mt-6 font-medium">Loading portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-xl p-16 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-elevated) 100%)' }}>
              <svg className="w-10 h-10" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>No Portfolios Yet</h3>
            <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Create your first portfolio to get started with portfolio decision management and governance</p>
            <button
              onClick={handleCreatePortfolio}
              disabled={isCreating}
              className="px-8 py-3.5 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'var(--bg-primary)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)'}
            >
              {isCreating ? 'Creating...' : 'Create Your First Portfolio'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="rounded-xl p-6 transition-all duration-300 group hover:scale-[1.02]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', boxShadow: '0 4px 6px rgba(0, 217, 255, 0.05)' }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{portfolio.name}</h3>
                    {portfolio.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{portfolio.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Budget</div>
                    <div className="font-mono text-base font-bold" style={{ color: 'var(--accent-primary)' }}>₹{portfolio.totalBudget}Cr</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Capacity</div>
                    <div className="font-mono text-base font-bold" style={{ color: 'var(--accent-primary)' }}>{portfolio.totalCapacity} units</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/portfolio/${portfolio.id}/setup`}
                    className="text-xs text-center px-3 py-2.5 font-semibold rounded-lg transition-all"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    Setup
                  </Link>
                  <Link
                    href={`/portfolio/${portfolio.id}/initiatives`}
                    className="text-xs text-center px-3 py-2.5 font-semibold rounded-lg transition-all"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    Initiatives
                  </Link>
                  <Link
                    href={`/portfolio/${portfolio.id}/output`}
                    className="text-xs text-center px-3 py-2.5 font-semibold rounded-lg transition-all"
                    style={{ 
                      backgroundColor: 'var(--accent-primary)', 
                      color: 'var(--bg-primary)',
                      boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)'
                    }}
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
          <div 
            className="rounded-xl p-10 shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 
                className="text-2xl font-bold mb-4 tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Portfolio Governance Platform
              </h2>
              <p 
                className="text-base leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Backend-enforced completeness validation • Capacity constraints as hard limits • Immutable audit trail • Binary status reporting
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div 
          className="rounded-xl p-16 text-center shadow-lg mt-16"
          style={{ 
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            border: '1px solid var(--border-default)'
          }}
        >
          <h2 
            className="text-3xl font-bold mb-5 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to Start?
          </h2>
          <p 
            className="mb-10 max-w-2xl mx-auto text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Create your first portfolio, add initiatives, build scenarios, and generate a comprehensive decision report
          </p>
          <button 
            onClick={handleCreatePortfolio}
            disabled={isCreating}
            className="inline-block px-10 py-4 font-bold rounded-lg hover:shadow-xl transition-all duration-200 shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
              boxShadow: '0 0 25px rgba(0, 217, 255, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 217, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 217, 255, 0.4)';
            }}
          >
            {isCreating ? 'Creating Portfolio...' : 'Create Portfolio Now'}
          </button>
        </div>

      </main>
    </div>
  );
}
