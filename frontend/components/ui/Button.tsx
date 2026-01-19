import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'text';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
        primary: 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-lg focus:ring-neutral-900 disabled:bg-neutral-400 disabled:cursor-not-allowed',
        secondary: 'bg-white border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 focus:ring-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed',
        text: 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed',
    };
    
    const sizeClasses = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-3.5 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
