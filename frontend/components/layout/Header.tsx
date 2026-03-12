'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    portfolioName?: string;
    portfolioId?: string;
    currentPage?: string;
    className?: string;
}

export default function Header({ portfolioName, portfolioId, currentPage, className = '' }: HeaderProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
    };

    return (
        <header 
            className={`sticky top-0 z-50 w-full backdrop-blur-xl ${className}`}
            style={{ 
                backgroundColor: 'rgba(11, 15, 20, 0.95)',
                borderBottom: '1px solid var(--border-default)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.5)'
            }}
        >
            <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">
                {/* Brand Section */}
                <div className="flex items-center gap-4">
                    {/* Brand — clickable inside a portfolio, static on dashboard */}
                    {portfolioId ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 group"
                            aria-label="Decision Integrity Engine — go to Dashboard"
                        >
                            <BrandMark />
                            <div className="flex flex-col justify-center leading-none min-w-0">
                                <span
                                    style={{
                                        fontSize: '9px',
                                        fontWeight: 500,
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-tertiary)',
                                    }}
                                >
                                    Decision Integrity
                                </span>
                                <span
                                    className="transition-opacity group-hover:opacity-80"
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.025em',
                                        color: 'var(--text-primary)',
                                        marginTop: '2px',
                                    }}
                                >
                                    ENGINE
                                </span>
                            </div>
                            {portfolioName && (
                                <>
                                    <div
                                        className="shrink-0 self-stretch"
                                        style={{
                                            width: '1px',
                                            background: 'var(--border-default)',
                                            margin: '4px 0',
                                        }}
                                    />
                                    <span
                                        className="text-xs font-medium truncate max-w-[9rem]"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        {portfolioName}
                                    </span>
                                </>
                            )}
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <BrandMark />
                            <div className="flex flex-col justify-center leading-none">
                                <span
                                    style={{
                                        fontSize: '9px',
                                        fontWeight: 500,
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-tertiary)',
                                    }}
                                >
                                    Decision Integrity
                                </span>
                                <span
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.025em',
                                        color: 'var(--text-primary)',
                                        marginTop: '2px',
                                    }}
                                >
                                    ENGINE
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Global Navigation */}
                    {isAuthenticated && !portfolioId && (
                        <nav 
                            className="hidden md:flex items-center gap-0.5 ml-3 pl-3" 
                            style={{ borderLeft: '1px solid var(--border-default)' }}
                        >
                            <NavLink
                                href="/dashboard"
                                active={currentPage === 'dashboard'}
                            >
                                Dashboard
                            </NavLink>
                            {user?.role === 'PMO' && (
                                <NavLink
                                    href="/dashboard/users"
                                    active={currentPage === 'users'}
                                >
                                    Users
                                </NavLink>
                            )}
                        </nav>
                    )}

                    {/* Portfolio Navigation */}
                    {portfolioId && (
                        <nav 
                            className="hidden md:flex items-center gap-0.5 ml-3 pl-3" 
                            style={{ borderLeft: '1px solid var(--border-default)' }}
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
                        <div className="relative" ref={profileRef}>
                            {/* Profile Button */}
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 rounded-lg transition-all duration-150"
                                style={{
                                    padding: '4px 8px 4px 4px',
                                    border: '1px solid',
                                    borderColor: isProfileOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    backgroundColor: isProfileOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isProfileOpen) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isProfileOpen) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }
                                }}
                            >
                                {/* Monogram avatar */}
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        border: '1.5px solid rgba(0,217,255,0.35)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        color: '#e2e8f0',
                                        flexShrink: 0,
                                        boxShadow: '0 0 0 2px rgba(0,217,255,0.08)',
                                    }}
                                >
                                    {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                {/* Name + role */}
                                <div className="hidden sm:flex flex-col items-start leading-none">
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                    <RolePill role={user.role} small />
                                </div>
                                {/* Chevron */}
                                <svg
                                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                                    className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                    style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                                >
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-68 rounded-xl overflow-hidden"
                                    style={{
                                        width: 264,
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        zIndex: 100,
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 24px 40px -8px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    {/* Profile header */}
                                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {/* Large monogram */}
                                            <div style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                                border: '2px solid rgba(0,217,255,0.3)',
                                                boxShadow: '0 0 0 3px rgba(0,217,255,0.07)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '15px',
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                                color: '#e2e8f0',
                                                flexShrink: 0,
                                            }}>
                                                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {user.name}
                                                </p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {user.email}
                                                </p>
                                                <div style={{ marginTop: 6 }}>
                                                    <RolePill role={user.role} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div style={{ padding: '6px 0' }}>
                                        <DropdownItem
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            }
                                            label="My Profile"
                                            description="View and edit profile"
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                router.push('/profile');
                                            }}
                                        />
                                        <DropdownItem
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            }
                                            label={user.role === 'EXECUTIVE' ? 'Decision Dashboard' : 'My Portfolios'}
                                            description={user.role === 'EXECUTIVE' ? 'Review and approve decisions' : 'View all portfolios'}
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                if (user.role === 'EXECUTIVE') {
                                                    router.push('/dashboard/executive');
                                                } else {
                                                    router.push('/dashboard');
                                                }
                                            }}
                                        />
                                        {user.role === 'PMO' && (
                                            <DropdownItem
                                                icon={
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                }
                                                label="User Management"
                                                description="Manage system users"
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    router.push('/dashboard/users');
                                                }}
                                            />
                                        )}
                                        <DropdownItem
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            }
                                            label="Settings"
                                            description="Account preferences"
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                router.push('/settings');
                                            }}
                                        />
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: 1, margin: '0 12px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

                                    {/* Sign out */}
                                    <div style={{ padding: '6px 0' }}>
                                        <DropdownItem
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            }
                                            label="Sign Out"
                                            onClick={handleLogout}
                                            danger
                                        />
                                    </div>
                                </div>
                            )}
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

function DropdownItem({
    icon,
    label,
    description,
    onClick,
    danger
}: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick: () => void;
    danger?: boolean;
}) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full px-5 py-3 flex items-center gap-3.5 transition-all text-left relative group"
            style={{ 
                backgroundColor: isHovered 
                    ? danger 
                        ? 'rgba(239, 68, 68, 0.08)' 
                        : 'rgba(59, 130, 246, 0.05)'
                    : 'transparent',
                borderLeft: isHovered ? '3px solid' : '3px solid transparent',
                borderLeftColor: isHovered ? (danger ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)') : 'transparent'
            }}
        >
            <div 
                className="shrink-0 transition-transform"
                style={{ 
                    color: danger 
                        ? isHovered ? 'rgb(239, 68, 68)' : 'rgb(248, 113, 113)'
                        : isHovered ? 'rgb(96, 165, 250)' : 'rgb(156, 163, 175)',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p 
                    className="text-sm font-semibold leading-tight transition-colors"
                    style={{ 
                        color: danger 
                            ? isHovered ? 'rgb(239, 68, 68)' : 'rgb(248, 113, 113)'
                            : isHovered ? 'rgb(243, 244, 246)' : 'rgb(209, 213, 219)'
                    }}
                >
                    {label}
                </p>
                {description && (
                    <p 
                        className="text-xs mt-1 transition-colors"
                        style={{ color: isHovered ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                    >
                        {description}
                    </p>
                )}
            </div>
            {isHovered && !danger && (
                <svg 
                    className="w-4 h-4 shrink-0"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'rgb(96, 165, 250)' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );
}

/**
 * Role-coloured pill — each role gets a distinct colour so users can
 * visually distinguish their access level at a glance (enterprise pattern).
 * PMO = indigo, EXECUTIVE = amber, PORTFOLIO_LEAD = teal.
 */
function RolePill({ role, small = false }: { role: string; small?: boolean }) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        PMO:            { bg: 'rgba(99,102,241,0.12)',  text: '#a5b4fc', dot: '#818cf8', label: 'PMO' },
        EXECUTIVE:      { bg: 'rgba(245,158,11,0.12)', text: '#fcd34d', dot: '#f59e0b', label: 'Executive' },
        PORTFOLIO_LEAD: { bg: 'rgba(20,184,166,0.12)', text: '#5eead4', dot: '#14b8a6', label: 'Portfolio Lead' },
    };
    const style = map[role] ?? { bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', dot: '#6b7280', label: role };
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: small ? '1px 6px' : '2px 8px',
            borderRadius: 99,
            background: style.bg,
            fontSize: small ? 9 : 10,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: style.text,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: style.dot, flexShrink: 0, display: 'inline-block' }} />
            {style.label}
        </span>
    );
}

/**
 * Enterprise-grade icon mark — a priority-cascade "D" shape
 * representing portfolio prioritisation / ranked decisions.
 */
function BrandMark() {
    return (
        <div
            className="shrink-0 flex items-center justify-center"
            style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: 'linear-gradient(135deg, rgba(0,217,255,0.12) 0%, rgba(0,217,255,0.04) 100%)',
                border: '1px solid rgba(0,217,255,0.18)',
                boxShadow: '0 0 12px rgba(0,217,255,0.08)',
            }}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
            >
                {/* Vertical stem — the backbone of the "D" */}
                <rect x="1.5" y="1.5" width="2.4" height="15" rx="1.2" fill="var(--accent-primary)" />
                {/* Top bar — full priority level */}
                <rect x="5.5" y="2.6" width="11" height="2" rx="1" fill="var(--accent-primary)" />
                {/* Mid bar — second priority level (70%) */}
                <rect x="5.5" y="8" width="7.7" height="2" rx="1" fill="var(--accent-primary)" opacity="0.65" />
                {/* Bottom bar — third priority level (45%) */}
                <rect x="5.5" y="13.4" width="4.5" height="2" rx="1" fill="var(--accent-primary)" opacity="0.38" />
            </svg>
        </div>
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
            className="px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center"
            style={{
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
            }}
        >
            {children}
        </Link>
    );
}
