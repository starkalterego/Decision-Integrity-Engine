'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-1">
                        Decision Integrity Engine
                    </h1>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">
                        Portfolio Governance Platform
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg">
                    <div className="px-8 py-6 border-b border-gray-800">
                        <h2 className="text-lg font-medium text-white">Secure Access</h2>
                        <p className="text-sm text-gray-400 mt-1">Restricted to authorized personnel only</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-950 text-blue-600 focus:ring-0"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Only pre-registered users with assigned roles can access this platform. 
                                Contact your system administrator for access requests.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    <p>Authorized Roles: Portfolio Lead • Executive • PMO</p>
                </div>
            </div>
        </div>
    );
}
