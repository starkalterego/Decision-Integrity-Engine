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
        <header className={`border-b border-neutral-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95 ${className}`}>
            <div className="max-w-350 mx-auto px-8 py-5">
                <div className="flex items-center justify-between">
                    {/* Brand Section */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-3 transition-all hover:opacity-80"
                        >
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                                    Decision Integrity Engine
                                </h1>
                                {portfolioName && (
                                    <p className="text-xs text-neutral-500 font-semibold mt-1 tracking-wide">
                                        {portfolioName}
                                    </p>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    {portfolioId && (
                        <nav className="flex items-center gap-2">
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

                    {/* User Menu */}
                    {isAuthenticated && user && (
                        <div className="flex items-center gap-4 ml-6 pl-6 border-l border-neutral-200">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                                <p className="text-xs text-neutral-500">{user.role.replace('_', ' ')}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                    {!isAuthenticated && (
                        <Link
                            href="/auth"
                            className="px-4 py-2 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all"
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
            className={`
                relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                ${active
                    ? 'text-neutral-900 bg-neutral-100 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }
            `}
        >
            <span>{children}</span>
            {active && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-900 rounded-t-full" />
            )}
        </Link>
    );
}
