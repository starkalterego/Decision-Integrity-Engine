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
                    className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                    error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 focus:ring-neutral-900'
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-neutral-500 mt-1.5">{helperText}</p>
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
                    className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                    {label}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent resize-vertical ${
                    error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 focus:ring-neutral-900'
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-neutral-500 mt-1.5">{helperText}</p>
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
                    className="block text-sm font-semibold text-neutral-700 mb-2"
                >
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
                    error 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 focus:ring-neutral-900'
                } ${className}`}
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
                <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
            )}
        </div>
    );
}
