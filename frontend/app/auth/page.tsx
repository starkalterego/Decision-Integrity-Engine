'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();

            if (result.success) {
                // Store auth token/session
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userId', result.data.userId);
                localStorage.setItem('userRole', result.data.role);
                
                // Redirect to dashboard
                router.push('/dashboard');
            } else {
                setError(result.errors?.[0]?.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ 
            backgroundColor: 'var(--bg-primary)',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 217, 255, 0.02) 0%, transparent 50%)'
        }}>
            <div className="w-full max-w-md">
                {/* Enhanced Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ 
                        color: 'var(--text-primary)', 
                        letterSpacing: '-0.02em',
                        lineHeight: '1.2'
                    }}>
                        Decision Integrity Engine
                    </h1>
                    <p className="text-sm font-semibold uppercase tracking-widest" style={{ 
                        color: 'var(--text-tertiary)', 
                        letterSpacing: '0.15em' 
                    }}>
                        Portfolio Governance Platform
                    </p>
                </div>

                {/* Enhanced Login Card */}
                <div className="rounded-2xl overflow-hidden" style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)'
                }}>
                    {/* Card Header with Gradient */}
                    <div className="px-8 py-5" style={{ 
                        borderBottom: '1px solid var(--border-default)', 
                        background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)'
                    }}>
                        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Secure Access</h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Restricted to authorized personnel only</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-5 p-3 rounded-lg" style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                                <p className="text-sm font-medium" style={{ color: 'var(--accent-error)' }}>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Enhanced Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    placeholder="you@company.com"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                        style={{
                                            backgroundColor: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-default)',
                                            color: 'var(--text-primary)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--accent-primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1), var(--shadow-sm)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'var(--shadow-sm)';
                                    }}
                                />
                            </div>

                            {/* Enhanced Password Input with Eye Icon */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        placeholder="Enter your password"
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 pr-12 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                                        style={{
                                            backgroundColor: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-default)',
                                            color: 'var(--text-primary)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--accent-primary)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1), var(--shadow-sm)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--border-default)';
                                            e.target.style.boxShadow = 'var(--shadow-sm)';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                        style={{ 
                                            color: 'var(--text-tertiary)', 
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            padding: '0',
                                            paddingRight: '16px'
                                        }}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Remember Me Checkbox with Focus Indicator */}
                            <div className="flex items-center">
                                <label className="flex items-center group cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 appearance-none checked:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            style={{
                                                backgroundColor: rememberMe ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                                                borderColor: rememberMe ? 'var(--accent-primary)' : 'var(--border-default)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}

                                        />
                                        {rememberMe && (
                                            <svg 
                                                className="absolute inset-0 w-5 h-5 pointer-events-none" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                                style={{ color: 'var(--accent-primary-text)' }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="ml-3 text-sm font-medium group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                                        Remember me
                                    </span>
                                </label>
                            </div>

                            {/* Enhanced Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isLoading ? 'var(--bg-elevated)' : 'var(--accent-primary)',
                                    color: isLoading ? 'var(--text-tertiary)' : 'var(--accent-primary-text)',
                                    boxShadow: isLoading ? 'none' : '0 4px 12px -2px rgba(0, 217, 255, 0.4), var(--shadow-md)',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0, 217, 255, 0.5), var(--shadow-lg)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 217, 255, 0.4), var(--shadow-md)';
                                    }
                                }}
                            >
                                {isLoading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Enhanced Footer Note */}
                        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Restricted Access</p>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                    Only pre-registered users with assigned roles can access this platform. 
                                    Contact your system administrator for access requests.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Authorized Roles:</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Portfolio Lead • Executive • PMO</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
