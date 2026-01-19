import React from 'react';

type Status = 'green' | 'red';

interface StatusBadgeProps {
    status: Status;
    text: string;
    className?: string;
}

export function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
    const statusClasses = {
        green: 'bg-green-100 text-green-800 border-green-200',
        red: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusClasses[status]} ${className}`}>
            <span className={`w-2 h-2 rounded-full ${status === 'green' ? 'bg-green-600' : 'bg-red-600'}`} />
            <span>{text}</span>
        </span>
    );
}
