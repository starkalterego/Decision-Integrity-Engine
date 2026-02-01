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
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Enhanced Brand Section */}
                <div className="flex items-center gap-6">
                    {/* Logo - clickable only when inside a portfolio */}
                    {portfolioId ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 group"
                        >
                            {/* Logo/Icon */}
                            <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                                style={{ 
                                    backgroundColor: 'var(--accent-primary)',
                                    boxShadow: '0 2px 8px rgba(0, 217, 255, 0.3)'
                                }}
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                                        style={{ color: 'var(--accent-primary-text)' }}
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 
                                    className="text-lg font-bold leading-none transition-opacity group-hover:opacity-80"
                                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                                >
                                    Decision Integrity <span style={{ color: 'var(--accent-primary)' }}>Engine</span>
                                </h1>
                                {portfolioName && (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div 
                                            className="w-1 h-1 rounded-full"
                                            style={{ backgroundColor: 'var(--accent-primary)' }}
                                        />
                                        <span 
                                            className="text-xs font-medium truncate max-w-64"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {portfolioName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Logo/Icon - non-clickable on dashboard */}
                            <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{ 
                                    backgroundColor: 'var(--accent-primary)',
                                    boxShadow: '0 2px 8px rgba(0, 217, 255, 0.3)'
                                }}
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                                        style={{ color: 'var(--accent-primary-text)' }}
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 
                                    className="text-lg font-bold leading-none"
                                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                                >
                                    Decision Integrity <span style={{ color: 'var(--accent-primary)' }}>Engine</span>
                                </h1>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Global Navigation */}
                    {isAuthenticated && !portfolioId && (
                        <nav 
                            className="hidden md:flex items-center gap-1 ml-6 pl-6" 
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

                    {/* Enhanced Portfolio Navigation */}
                    {portfolioId && (
                        <nav 
                            className="hidden md:flex items-center gap-1 ml-6 pl-6" 
                            style={{ borderLeft: '1px solid var(--border-default)' }}
                        >
                            <NavLink
                                href="/dashboard"
                                active={false}
                            >
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </NavLink>
                            <div 
                                className="h-4 w-px mx-1.5"
                                style={{ backgroundColor: 'var(--border-subtle)' }}
                            />
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

                {/* Enhanced User Menu */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <div className="relative" ref={profileRef}>
                            {/* Profile Button */}
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
                                style={{ 
                                    border: '1px solid',
                                    borderColor: isProfileOpen ? 'var(--border-default)' : 'transparent',
                                    backgroundColor: isProfileOpen ? 'var(--bg-elevated)' : 'transparent',
                                    boxShadow: isProfileOpen ? 'var(--shadow-sm)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isProfileOpen) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isProfileOpen) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }
                                }}
                            >
                                <div 
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                    style={{ 
                                        backgroundColor: 'var(--accent-primary)',
                                        color: 'var(--accent-primary-text)',
                                        boxShadow: '0 2px 4px rgba(0, 217, 255, 0.2)'
                                    }}
                                >
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p 
                                        className="text-sm font-semibold leading-none"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {user.name.split(' ')[0]}
                                    </p>
                                    <p 
                                        className="text-xs mt-1 capitalize"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    >
                                        {user.role.replace('_', ' ').toLowerCase()}
                                    </p>
                                </div>
                                <svg 
                                    className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Enhanced Dropdown Menu */}
                            {isProfileOpen && (
                                <div 
                                    className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden animate-fadeIn"
                                    style={{ 
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-default)',
                                        zIndex: 100,
                                        boxShadow: '0 20px 30px -8px rgba(0, 0, 0, 0.6), var(--shadow-xl)'
                                    }}
                                >
                                    {/* Enhanced Profile Header */}
                                    <div 
                                        className="px-5 py-4"
                                        style={{ 
                                            background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                                            borderBottom: '1px solid var(--border-default)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div 
                                                className="h-12 w-12 rounded-lg flex items-center justify-center text-base font-bold"
                                                style={{ 
                                                    backgroundColor: 'var(--accent-primary)',
                                                    color: 'var(--accent-primary-text)',
                                                    boxShadow: '0 4px 8px rgba(0, 217, 255, 0.25)'
                                                }}
                                            >
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p 
                                                    className="text-sm font-bold leading-tight mb-1"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {user.name}
                                                </p>
                                                <p 
                                                    className="text-xs truncate"
                                                    style={{ color: 'var(--text-tertiary)' }}
                                                >
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div 
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                                            style={{ 
                                                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                                                color: 'var(--accent-primary)',
                                                border: '1px solid rgba(0, 217, 255, 0.2)'
                                            }}
                                        >
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                                            {user.role.replace('_', ' ').toLowerCase()}
                                        </div>
                                    </div>

                                    {/* Enhanced Menu Items */}
                                    <div className="py-2">
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

                                    {/* Enhanced Divider */}
                                    <div 
                                        className="h-px mx-3 my-2"
                                        style={{ backgroundColor: 'var(--border-subtle)' }}
                                    />

                                    {/* Enhanced Logout */}
                                    <div className="py-2">
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
