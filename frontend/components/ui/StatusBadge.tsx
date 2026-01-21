import React from 'react';

type Status = 'green' | 'red';

interface StatusBadgeProps {
    status: Status;
    text: string;
    className?: string;
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
    const getStatusStyle = (s: Status) => {
        if (s === 'green') {
            return {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-success)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
            };
        }
        return {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-error)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
        };
    };

    const styles = getStatusStyle(status);

    return (
        <span 
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${className}`}
            style={styles}
        >
            <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: status === 'green' ? 'var(--accent-success)' : 'var(--accent-error)' }} 
            />
            <span>{text}</span>
        </span>
    );
}
