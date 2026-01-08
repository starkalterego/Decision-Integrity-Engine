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
        green: 'border-l-status-green',
        red: 'border-l-status-red',
        neutral: 'border-l-neutral-300',
    };

    return (
        <div className={`metric-card border-l-4 ${statusColors[status]} ${className}`}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {statusText && (
                <div className={`text-xs mt-2 ${status === 'green' ? 'text-status-green' :
                        status === 'red' ? 'text-status-red' :
                            'text-neutral-600'
                    }`}>
                    {statusText}
                </div>
            )}
        </div>
    );
}
