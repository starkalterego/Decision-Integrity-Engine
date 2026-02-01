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
    const getStatusStyles = () => {
        switch (status) {
            case 'green':
                return {
                    borderLeftColor: 'var(--accent-success)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-md)'
                };
            case 'red':
                return {
                    borderLeftColor: 'var(--accent-error)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-md)'
                };
            default:
                return {
                    borderLeftColor: 'var(--accent-primary)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-md)'
                };
        }
    };

    const getStatusTextColor = () => {
        switch (status) {
            case 'green':
                return 'var(--accent-success)';
            case 'red':
                return 'var(--accent-error)';
            default:
                return 'var(--text-secondary)';
        }
    };

    return (
        <div 
            className={`p-6 border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
            style={getStatusStyles()}
        >
            <div 
                className="text-sm font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-tertiary)' }}
            >
                {label}
            </div>
            <div 
                className="text-3xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
            >
                {value}
            </div>
            {statusText && (
                <div 
                    className="text-sm font-medium mt-2"
                    style={{ color: getStatusTextColor() }}
                >
                    {statusText}
                </div>
            )}
        </div>
    );
}
