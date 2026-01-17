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

    return (
        <span className={`status-badge ${statusClasses[status]} ${className} inline-flex items-center gap-2`}>
            <span className={`w-2 h-2 rounded-full ${status === 'green' ? 'bg-status-green' : 'bg-status-red'}`} />
            <span>{text}</span>
        </span>
    );
}
