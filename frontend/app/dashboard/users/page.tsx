'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authGet, authPost, authPatch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Header from '@/components/layout/Header';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    _count?: {
        portfolios: number;
    };
}

export default function UsersPage() {
    const router = useRouter();
    const { user: currentUser, loading: authLoading } = useAuth(true);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('');

    useEffect(() => {
        if (currentUser && (currentUser.role !== 'PMO' && currentUser.role !== 'EXECUTIVE')) {
            router.push('/dashboard');
            return;
        }

        const fetchUsers = async () => {
            try {
                const url = roleFilter ? `/api/admin/users?role=${roleFilter}` : '/api/admin/users';
                const response = await authGet(url);
                if (response.ok) {
                    const result = await response.json();
                    setUsers(result.data?.users || []);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser, roleFilter, router]);

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await authPatch('/api/admin/users', {
                userId,
                isActive: !currentStatus,
            });

            if (response.ok) {
                setUsers(users.map(u => 
                    u.id === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <Header currentPage="users" />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1e293b] border-t-[#00d9ff]"></div>
                        <p className="mt-6 font-medium" style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser || (currentUser.role !== 'PMO' && currentUser.role !== 'EXECUTIVE')) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Header currentPage="users" />
            
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 
                            className="text-4xl font-bold mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            User Management
                        </h1>
                        <p 
                            className="text-lg"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Manage system users and access control
                        </p>
                    </div>
                    <Button 
                        onClick={() => setShowCreateModal(true)}
                        variant="primary"
                    >
                        + Create User
                    </Button>
                </div>

                {/* Filters */}
                <div 
                    className="rounded-xl p-6 mb-6 flex items-center gap-4"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <label 
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Filter by Role:
                    </label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border text-sm font-medium"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-default)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="PMO">PMO</option>
                        <option value="EXECUTIVE">Executive</option>
                        <option value="PORTFOLIO_LEAD">Portfolio Lead</option>
                    </select>
                    <div className="flex-1" />
                    <span 
                        className="text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {users.length} users found
                    </span>
                </div>

                {/* Users List */}
                <div 
                    className="rounded-xl overflow-hidden"
                    style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)'
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead 
                                className="text-left text-xs font-semibold uppercase tracking-wider"
                                style={{ 
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-tertiary)'
                                }}
                            >
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Portfolios</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr 
                                        key={user.id}
                                        className="border-t transition-colors"
                                        style={{ borderColor: 'var(--border-subtle)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="h-10 w-10 rounded-full flex items-center justify-center font-bold"
                                                    style={{ 
                                                        backgroundColor: user.isActive ? 'var(--accent-success-bg)' : 'var(--bg-elevated)',
                                                        color: user.isActive ? 'var(--accent-success)' : 'var(--text-muted)'
                                                    }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p 
                                                        className="font-semibold"
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        {user.name}
                                                    </p>
                                                    <p 
                                                        className="text-sm"
                                                        style={{ color: 'var(--text-tertiary)' }}
                                                    >
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className="text-sm font-semibold px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: 'var(--bg-elevated)',
                                                    color: 'var(--text-secondary)'
                                                }}
                                            >
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className="text-sm font-semibold px-3 py-1 rounded-full"
                                                style={{
                                                    backgroundColor: user.isActive ? 'var(--accent-success-bg)' : 'var(--bg-elevated)',
                                                    color: user.isActive ? 'var(--accent-success)' : 'var(--text-muted)'
                                                }}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className="text-sm"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                {user._count?.portfolios || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className="text-sm"
                                                style={{ color: 'var(--text-tertiary)' }}
                                            >
                                                {user.lastLoginAt 
                                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                                    : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                onClick={() => handleToggleActive(user.id, user.isActive)}
                                                variant="secondary"
                                                className="text-sm"
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'PORTFOLIO_LEAD',
        isActive: true,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authPost('/api/admin/users', formData);
            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.errors?.[0]?.message || 'Failed to create user');
            }
        } catch (err) {
            console.error('Create user error:', err);
            setError('An error occurred while creating the user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={onClose}
        >
            <div 
                className="rounded-xl p-8 max-w-md w-full"
                style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 
                    className="text-2xl font-bold mb-6"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Create New User
                </h2>

                {error && (
                    <div 
                        className="mb-4 p-3 rounded-lg text-sm"
                        style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5'
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label 
                            className="block text-sm font-semibold mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Full Name
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label 
                            className="block text-sm font-semibold mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={loading}
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
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                        <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Minimum 8 characters
                        </p>
                    </div>

                    <div>
                        <label 
                            className="block text-sm font-semibold mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border-default)',
                                color: 'var(--text-primary)'
                            }}
                            disabled={loading}
                        >
                            <option value="PORTFOLIO_LEAD">Portfolio Lead</option>
                            <option value="EXECUTIVE">Executive</option>
                            <option value="PMO">PMO</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
