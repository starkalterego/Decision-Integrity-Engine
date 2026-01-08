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
        <div className="form-group">
            {label && <label htmlFor={props.id}>{label}</label>}
            <input
                className={`${className} ${error ? 'border-status-red' : ''}`}
                {...props}
            />
            {error && <p className="error-message">{error}</p>}
            {helperText && !error && (
                <p className="text-xs text-neutral-600 mt-1">{helperText}</p>
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
        <div className="form-group">
            {label && <label htmlFor={props.id}>{label}</label>}
            <textarea
                className={`${className} ${error ? 'border-status-red' : ''}`}
                {...props}
            />
            {error && <p className="error-message">{error}</p>}
            {helperText && !error && (
                <p className="text-xs text-neutral-600 mt-1">{helperText}</p>
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
        <div className="form-group">
            {label && <label htmlFor={props.id}>{label}</label>}
            <select
                className={`${className} ${error ? 'border-status-red' : ''}`}
                {...props}
            >
                <option value="">Select...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}
