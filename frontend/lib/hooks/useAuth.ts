'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export function useAuth(requireAuth: boolean = false) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                setLoading(false);
                if (requireAuth) {
                    router.push('/auth');
                }
                return;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setUser(result.data.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token invalid, clear auth
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userRole');
                        if (requireAuth) {
                            router.push('/auth');
                        }
                    }
                } else {
                    // Token invalid, clear auth
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    if (requireAuth) {
                        router.push('/auth');
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                if (requireAuth) {
                    router.push('/auth');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requireAuth, router]);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            setUser(null);
            setIsAuthenticated(false);
            router.push('/auth');
        }
    };

    return {
        user,
        loading,
        isAuthenticated,
        logout,
    };
}
