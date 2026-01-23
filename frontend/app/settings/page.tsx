'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuth(true);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        portfolioUpdates: true,
        scenarioAlerts: false,
        weeklyDigest: true,
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
    });

    if (!user) return null;

    const handleSave = async () => {
        // API call to save settings would go here
        console.log('Settings saved:', settings);
    };

    return (
        <>
            <Header currentPage="settings" />
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
                        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
                        <p className="text-sm text-gray-500 mt-2">Manage your application preferences and notifications</p>
                    </div>

                    <div className="space-y-6">
                        
                        {/* Notifications */}
                        <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-100 mb-6">Notifications</h3>
                            
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Email Notifications"
                                    description="Receive email updates about your account activity"
                                    checked={settings.emailNotifications}
                                    onChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                                />
                                <ToggleSetting
                                    label="Portfolio Updates"
                                    description="Get notified when portfolios you manage are updated"
                                    checked={settings.portfolioUpdates}
                                    onChange={(checked) => setSettings({...settings, portfolioUpdates: checked})}
                                />
                                <ToggleSetting
                                    label="Scenario Alerts"
                                    description="Receive alerts for scenario finalization and comparisons"
                                    checked={settings.scenarioAlerts}
                                    onChange={(checked) => setSettings({...settings, scenarioAlerts: checked})}
                                />
                                <ToggleSetting
                                    label="Weekly Digest"
                                    description="Get a weekly summary of your portfolio activities"
                                    checked={settings.weeklyDigest}
                                    onChange={(checked) => setSettings({...settings, weeklyDigest: checked})}
                                />
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-100 mb-6">Appearance</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-3">Theme</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSettings({...settings, theme: 'dark'})}
                                            className={`px-4 py-3 rounded-lg border transition-all ${
                                                settings.theme === 'dark'
                                                    ? 'border-blue-500 bg-blue-950/20 text-blue-400'
                                                    : 'border-gray-700 bg-[#14191f] text-gray-400 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                </svg>
                                                <span className="font-medium">Dark</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setSettings({...settings, theme: 'light'})}
                                            className={`px-4 py-3 rounded-lg border transition-all ${
                                                settings.theme === 'light'
                                                    ? 'border-blue-500 bg-blue-950/20 text-blue-400'
                                                    : 'border-gray-700 bg-[#14191f] text-gray-400 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <span className="font-medium">Light</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional */}
                        <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-100 mb-6">Regional Settings</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-lg bg-[#14191f] border border-gray-700 text-gray-200 focus:border-gray-600 focus:outline-none transition-colors"
                                    >
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="EST">EST (Eastern Standard Time)</option>
                                        <option value="PST">PST (Pacific Standard Time)</option>
                                        <option value="CST">CST (Central Standard Time)</option>
                                        <option value="IST">IST (Indian Standard Time)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* System */}
                        <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-100 mb-6">System</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">Application Version</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Current version installed</p>
                                    </div>
                                    <span className="text-sm text-gray-400">v1.0.0</span>
                                </div>
                                <div className="border-t border-gray-800 pt-3">
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-300">Data Storage</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Clear cached data</p>
                                        </div>
                                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                            Clear Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button onClick={handleSave} variant="primary">
                                Save All Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function ToggleSetting({
    label,
    description,
    checked,
    onChange
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between py-3">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? 'bg-blue-500' : 'bg-gray-700'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
}
