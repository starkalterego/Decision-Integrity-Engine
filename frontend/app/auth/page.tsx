'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Signup form state
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PORTFOLIO_LEAD',
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
                
                // Redirect to home
                router.push('/');
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (signupData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.name,
                    email: signupData.email,
                    password: signupData.password,
                    role: signupData.role,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Auto-login after signup
                localStorage.setItem('authToken', result.data.token);
                localStorage.setItem('userId', result.data.userId);
                localStorage.setItem('userRole', result.data.role);
                
                // Redirect to home
                router.push('/');
            } else {
                setError(result.errors?.[0]?.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An error occurred during signup. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-linear-to-br from-neutral-100 via-white to-neutral-100 opacity-50"></div>

            {/* Auth Card */}
            <div className="relative w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
                            Decision Integrity Engine
                        </h1>
                        <p className="text-sm text-neutral-500 mt-2 tracking-wide uppercase font-medium">
                            Portfolio Governance Platform
                        </p>
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-neutral-200">
                        <button
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${
                                mode === 'login'
                                    ? 'text-neutral-900 bg-white'
                                    : 'text-neutral-500 bg-neutral-50 hover:text-neutral-700'
                            }`}
                        >
                            Login
                            {mode === 'login' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-neutral-900"></div>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setMode('signup');
                                setError('');
                            }}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${
                                mode === 'signup'
                                    ? 'text-neutral-900 bg-white'
                                    : 'text-neutral-500 bg-neutral-50 hover:text-neutral-700'
                            }`}
                        >
                            Sign Up
                            {mode === 'signup' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-neutral-900"></div>
                            )}
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                                        />
                                        <span className="text-neutral-600">Remember me</span>
                                    </label>
                                    <a
                                        href="#"
                                        className="text-neutral-900 font-semibold hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        )}

                        {/* Signup Form */}
                        {mode === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Full Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={signupData.name}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, name: e.target.value })
                                        }
                                        placeholder="John Doe"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={signupData.email}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, email: e.target.value })
                                        }
                                        placeholder="you@company.com"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={signupData.role}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, role: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                                        disabled={isLoading}
                                    >
                                        <option value="PORTFOLIO_LEAD">Portfolio Lead</option>
                                        <option value="EXECUTIVE">Executive</option>
                                        <option value="PMO">PMO</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={signupData.password}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, password: e.target.value })
                                        }
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={signupData.confirmPassword}
                                        onChange={(e) =>
                                            setSignupData({
                                                ...signupData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="text-xs text-neutral-500">
                                    By signing up, you agree to our{' '}
                                    <a href="#" className="text-neutral-900 font-semibold hover:underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-neutral-900 font-semibold hover:underline">
                                        Privacy Policy
                                    </a>
                                    .
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-neutral-500">
                    <p>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                            }}
                            className="text-neutral-900 font-semibold hover:underline"
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
