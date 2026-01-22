'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface HeaderProps {
    portfolioName?: string;
    portfolioId?: string;
    currentPage?: string;
    className?: string;
}

export default function Header({ portfolioName, portfolioId, currentPage, className = '' }: HeaderProps) {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header 
            className={`sticky top-0 z-50 w-full backdrop-blur-md ${className}`}
            style={{ 
                backgroundColor: 'rgba(15, 22, 32, 0.90)',
                borderBottom: '1px solid var(--border-subtle)'
            }}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand Section */}
                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        className="flex items-center gap-3 transition-opacity hover:opacity-90"
                    >
                        <div className="flex flex-col justify-center">
                            <h1 
                                className="text-lg font-bold tracking-tight leading-none"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Decision Integrity<span style={{ color: 'var(--secondary-text)' }}>Engine</span>
                            </h1>
                            {portfolioName && (
                                <span 
                                    className="text-xs font-medium mt-1 truncate max-w-50"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {portfolioName}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Navigation */}
                    {portfolioId && (
                        <nav 
                            className="hidden md:flex items-center gap-1 ml-4 pl-6" 
                            style={{ borderLeft: '1px solid var(--border-subtle)' }}
                        >
                            <NavLink
                                href={`/portfolio/${portfolioId}/setup`}
                                active={currentPage === 'setup'}
                            >
                                Setup
                            </NavLink>
                            <NavLink
                                href={`/portfolio/${portfolioId}/initiatives`}
                                active={currentPage === 'initiatives'}
                            >
                                Initiatives
                            </NavLink>
                            <NavLink
                                href={`/portfolio/${portfolioId}/scenarios/baseline`}
                                active={currentPage === 'scenarios'}
                            >
                                Scenarios
                            </NavLink>
                            <NavLink
                                href={`/portfolio/${portfolioId}/scenarios/compare`}
                                active={currentPage === 'compare'}
                            >
                                Compare
                            </NavLink>
                            <NavLink
                                href={`/portfolio/${portfolioId}/output`}
                                active={currentPage === 'output'}
                            >
                                Output
                            </NavLink>
                        </nav>
                    )}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            <div 
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-white/5"
                                style={{ border: '1px solid transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <div 
                                    className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ring-1 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--bg-elevated)', 
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-default)'
                                    }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p 
                                        className="text-sm font-semibold leading-none"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {user.name}
                                    </p>
                                    <p 
                                        className="text-xs mt-1.5 capitalize"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    >
                                        {user.role.replace('_', ' ').toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            <div 
                                className="h-8 w-px"
                                style={{ backgroundColor: 'var(--border-subtle)' }}
                            />
                            <button
                                onClick={logout}
                                className="px-3 py-2 text-sm font-medium rounded-md transition-all"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--accent-error)';
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
                            style={{
                                color: 'var(--accent-primary-text)',
                                backgroundColor: 'var(--accent-primary)'
                            }}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

function NavLink({
    href,
    active,
    children
}: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="px-3 py-2 text-sm font-medium rounded-md transition-all duration-200"
            style={{
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
            }}
        >
            {children}
        </Link>
    );
}
