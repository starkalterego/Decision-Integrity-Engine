import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    portfolioName?: string;
    portfolioId?: string;
    currentPage?: string;
}

export function Header({ portfolioName, portfolioId, currentPage }: HeaderProps) {
    return (
        <header className="bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/" className="text-2xl font-semibold text-neutral-900 hover:text-neutral-700">
                            Decision Integrity Engine
                        </Link>
                        {portfolioName && (
                            <p className="text-sm text-neutral-600 mt-1">
                                Portfolio: <span className="font-medium">{portfolioName}</span>
                            </p>
                        )}
                    </div>

                    {portfolioId && (
                        <nav className="flex gap-1">
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
            className={`px-4 py-2 text-sm font-medium transition-colors ${active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
            style={{ borderRadius: '2px' }}
        >
            {children}
        </Link>
    );
}
