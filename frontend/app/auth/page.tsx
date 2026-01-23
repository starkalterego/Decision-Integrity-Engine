'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AuthPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div 
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-linear-to-br from-neutral-100 via-white to-neutral-100 opacity-50"></div>

            {/* Auth Card */}
            <div className="relative w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 
                            className="text-3xl font-bold tracking-tight"
                            style={{ 
                                color: 'var(--accent-primary)',
                                textShadow: '0 0 25px rgba(0, 217, 255, 0.4)'
                            }}
                        >
                            Decision Integrity Engine
                        </h1>
                        <p 
                            className="text-sm mt-2 tracking-wide uppercase font-medium"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Portfolio Governance Platform
                        </p>
                    </Link>
                </div>

                {/* Auth Card */}
                <div 
                    className="rounded-xl shadow-lg overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)'
                    }}
                >
                    {/* Header */}
                    <div 
                        className="py-6 px-8 text-center"
                        style={{ borderBottom: '1px solid var(--border-default)' }}
                    >
                        <h2 
                            className="text-xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Secure Access
                        </h2>
                        <p 
                            className="text-sm mt-1"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Restricted to authorized personnel only
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div 
                                className="mb-6 p-4 rounded-lg"
                                style={{ 
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <p 
                                    className="text-sm font-medium"
                                    style={{ color: '#fca5a5' }}
                                >
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label 
                                    className="block text-sm font-semibold mb-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, email: e.target.value })
                                    }
                                    placeholder="you@company.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label 
                                    className="block text-sm font-semibold mb-2"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, password: e.target.value })
                                    }
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label 
                                    className="flex items-center gap-2 cursor-pointer"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded"
                                        style={{ 
                                            accentColor: 'var(--accent-primary)',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderColor: 'var(--border-default)'
                                        }}
                                    />
                                    <span>Remember me</span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {/* Access Notice */}
                        <div 
                            className="mt-6 p-4 rounded-lg text-center"
                            style={{ 
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)'
                            }}
                        >
                            <p 
                                className="text-xs"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                <strong>Restricted Access:</strong> Only pre-registered users with assigned roles can access this platform. 
                                Contact your system administrator for access requests.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <p>
                        Authorized Roles: Portfolio Lead • Executive • PMO
                    </p>
                </div>
            </div>
        </div>
    );
}
