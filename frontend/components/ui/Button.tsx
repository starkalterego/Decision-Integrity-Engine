import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'text';
    size?: 'sm' | 'md';
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        text: 'btn-text',
    };
    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
