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
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                };
            case 'red':
                return {
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                };
            default:
                return {
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
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
            className={`p-5 rounded-xl ${className}`}
            style={getStatusStyles()}
        >
            <div className="flex items-start justify-between mb-3">
                <div 
                    className="text-xs font-semibold uppercase"
                    style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}
                >
                    {label}
                </div>
                {status !== 'neutral' && (
                    <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                        style={{
                            backgroundColor: status === 'green' ? 'var(--accent-success)'
                                : status === 'red' ? 'var(--accent-error)'
                                : 'var(--text-tertiary)'
                        }}
                    />
                )}
            </div>
            <div 
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
            >
                {value}
            </div>
            {statusText && (
                <div 
                    className="text-xs font-medium mt-2"
                    style={{ color: getStatusTextColor() }}
                >
                    {statusText}
                </div>
            )}
        </div>
    );
}
