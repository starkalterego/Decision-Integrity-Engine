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
    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center focus:outline-none';
    
    const sizeClasses = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-3.5 text-base',
    };

    const getVariantStyles = () => {
        if (disabled) {
            return {
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
                cursor: 'not-allowed',
                opacity: '0.5'
            };
        }

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)'
                };
            case 'secondary':
                return {
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)'
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

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${className}`}
            style={getVariantStyles()}
            disabled={disabled}
            onMouseEnter={(e) => {
                if (disabled) return;
                if (variant === 'primary') {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.5)';
                } else if (variant === 'secondary') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                } else if (variant === 'text') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
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
