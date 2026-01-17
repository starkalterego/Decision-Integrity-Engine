import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    portfolioName?: string;
    portfolioId?: string;
    currentPage?: string;
}

export function Header({ portfolioName, portfolioId, currentPage }: HeaderProps) {
    return (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Brand Section - Text Only */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-3 transition-all"
                        >
                            <div>
                                <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
                                    Decision Integrity Engine
                                </h1>
                                {portfolioName && (
                                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                                        {portfolioName}
                                    </p>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Navigation - Clean Text Links */}
                    {portfolioId && (
                        <nav className="flex items-center gap-1">
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
                relative px-4 py-2 text-sm font-medium rounded-sm transition-colors duration-200
                ${active
                    ? 'text-neutral-900 font-semibold bg-neutral-50'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }
            `}
        >
            <span>{children}</span>
            {/* Minimal active indicator bar */}
            {active && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-neutral-900" />
            )}
        </Link>
    );
}
