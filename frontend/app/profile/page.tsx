'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!user) return null;

    const handleSave = async () => {
        // API call to update profile would go here
        setIsEditing(false);
    };

    return (
        <>
            <Header currentPage="profile" />
            <div className="min-h-screen" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="max-w-4xl mx-auto px-6 py-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-100">My Profile</h1>
                        <p className="text-sm text-gray-500 mt-2">Manage your account information and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                                <div className="flex flex-col items-center">
                                    <div 
                                        className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
                                        style={{ 
                                            backgroundColor: 'var(--accent-primary)',
                                            color: 'var(--accent-primary-text)',
                                        }}
                                    >
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-100 text-center">{user.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                    <div 
                                        className="mt-4 px-3 py-1.5 rounded-full text-xs font-medium capitalize"
                                        style={{ 
                                            backgroundColor: 'var(--bg-tertiary)',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        {user.role.replace('_', ' ').toLowerCase()}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Account Status</span>
                                        <span className="flex items-center gap-1.5 text-green-400">
                                            <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Member Since</span>
                                        <span className="text-gray-300">Jan 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Card */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Personal Information */}
                            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-100">Personal Information</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <Button onClick={handleSave} variant="primary">
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors"
                                            />
                                        ) : (
                                            <p className="text-gray-200 py-2.5">{user.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors"
                                            />
                                        ) : (
                                            <p className="text-gray-200 py-2.5">{user.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                        <p className="text-gray-200 py-2.5 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-100 mb-6">Security Settings</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter current password"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors placeholder-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors placeholder-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors placeholder-gray-600"
                                        />
                                    </div>

                                    <Button variant="secondary" className="w-full">
                                        Update Password
                                    </Button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-[#0f1419] border border-red-900/30 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    These actions are irreversible. Please proceed with caution.
                                </p>
                                <button 
                                    className="px-4 py-2 text-sm font-medium text-red-400 border border-red-900/50 rounded-lg hover:bg-red-950/20 transition-colors"
                                >
                                    Deactivate Account
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
