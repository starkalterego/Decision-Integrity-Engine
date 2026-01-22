import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={props.id} 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${className}`}
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderColor: error ? 'var(--accent-error)' : 'var(--border-default)',
                }}
                onFocus={(e) => {
                    if (!error) {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--accent-error)' : 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
            />
            {error && (
                <p 
                    className="text-sm mt-2 font-medium"
                    style={{ color: '#fca5a5' }}
                >
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p 
                    className="text-xs mt-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Textarea({
    label,
    error,
    helperText,
    className = '',
    ...props
}: TextareaProps) {
    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={props.id} 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent resize-vertical ${className}`}
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderColor: error ? 'var(--accent-error)' : 'var(--border-default)',
                }}
                onFocus={(e) => {
                    if (!error) {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--accent-error)' : 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
            />
            {error && (
                <p 
                    className="text-sm mt-2 font-medium"
                    style={{ color: '#fca5a5' }}
                >
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p 
                    className="text-xs mt-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({
    label,
    error,
    options,
    className = '',
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={props.id} 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${className}`}
                style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    borderColor: error ? 'var(--accent-error)' : 'var(--border-default)',
                }}
                onFocus={(e) => {
                    if (!error) {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
                    }
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--accent-error)' : 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
            >
                <option value="">Select...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p 
                    className="text-sm mt-2 font-medium"
                    style={{ color: '#fca5a5' }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
