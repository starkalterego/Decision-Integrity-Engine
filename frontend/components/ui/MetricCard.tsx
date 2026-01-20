import React from 'react';

interface MetricCardProps {
    label: string;
    value: string | number;
    status?: 'green' | 'red' | 'neutral';
    statusText?: string;
    className?: string;
}

export function MetricCard({
    label,
    value,
    status = 'neutral',
    statusText,
    className = ''
}: MetricCardProps) {
    const statusColors = {
        green: 'border-l-green-500 bg-linear-to-br from-green-50 to-white',
        red: 'border-l-red-500 bg-linear-to-br from-red-50 to-white',
        neutral: 'border-l-neutral-300 bg-white',
    };

    return (
        <div className={`p-6 border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${statusColors[status]} ${className}`}>
            <div className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">{label}</div>
            <div className="text-3xl font-bold text-neutral-900 mb-1">{value}</div>
            {statusText && (
                <div className={`text-sm font-medium mt-2 ${
                    status === 'green' ? 'text-green-700' :
                    status === 'red' ? 'text-red-700' :
                    'text-neutral-600'
                }`}>
                    {statusText}
                </div>
            )}
        </div>
    );
}
