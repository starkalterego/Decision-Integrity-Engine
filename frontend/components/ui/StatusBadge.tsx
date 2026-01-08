import React from 'react';

type Status = 'green' | 'red';

interface StatusBadgeProps {
    status: Status;
    text: string;
    className?: string;
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
    const statusClasses = {
        green: 'status-badge-green',
        red: 'status-badge-red',
    };

    const icon = status === 'green' ? '✓' : '!';

    return (
        <span className={`status-badge ${statusClasses[status]} ${className}`}>
            <span className="font-semibold">{icon}</span>
            <span>{text}</span>
        </span>
    );
}
