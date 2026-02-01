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
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]';
    
    const sizeClasses = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-3.5 text-base',
    };

    const getVariantStyles = () => {
        if (disabled) {
            return {
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-disabled)',
                cursor: 'not-allowed',
                opacity: '0.6'
            };
        }

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-text)',
                    border: 'none',
                    boxShadow: 'var(--shadow-md)'
                };
            case 'secondary':
                return {
                    backgroundColor: 'transparent',
                    color: 'var(--secondary-text)',
                    border: '1px solid var(--secondary-border)'
                };
            case 'text':
                return {
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)'
                };
            default:
                return {};
        }
    };

    const hoverClass = !disabled && variant === 'primary' ? 'hover:scale-105 active:scale-95' : '';

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${hoverClass} ${className}`}
            style={getVariantStyles()}
            disabled={disabled}
            onMouseEnter={(e) => {
                if (disabled) return;
                if (variant === 'primary') {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                } else if (variant === 'secondary') {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-hover-bg)';
                } else if (variant === 'text') {
                    e.currentTarget.style.backgroundColor = 'var(--state-hover)';
                }
            }}
            onMouseLeave={(e) => {
                if (disabled) return;
                const styles = getVariantStyles();
                Object.assign(e.currentTarget.style, styles);
            }}
            {...props}
        >
            {children}
        </button>
    );
}
