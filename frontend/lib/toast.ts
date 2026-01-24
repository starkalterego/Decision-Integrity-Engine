import toast, { Toaster, ToastOptions } from 'react-hot-toast';

/**
 * Centralized toast notification system
 * Replaces alert() calls with better UX
 */

const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
    style: {
        background: '#1a1f2e',
        color: '#e5e7eb',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '16px',
    },
};

export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        toast.success(message, {
            ...defaultOptions,
            ...options,
            style: {
                ...defaultOptions.style,
                border: '1px solid #10b981',
            },
            iconTheme: {
                primary: '#10b981',
                secondary: '#1a1f2e',
            },
        });
    },

    error: (message: string, options?: ToastOptions) => {
        toast.error(message, {
            ...defaultOptions,
            ...options,
            duration: 6000, // Longer for errors
            style: {
                ...defaultOptions.style,
                border: '1px solid #ef4444',
            },
            iconTheme: {
                primary: '#ef4444',
                secondary: '#1a1f2e',
            },
        });
    },

    warning: (message: string, options?: ToastOptions) => {
        toast(message, {
            ...defaultOptions,
            ...options,
            icon: '⚠️',
            style: {
                ...defaultOptions.style,
                border: '1px solid #f59e0b',
            },
        });
    },

    info: (message: string, options?: ToastOptions) => {
        toast(message, {
            ...defaultOptions,
            ...options,
            icon: 'ℹ️',
            style: {
                ...defaultOptions.style,
                border: '1px solid #3b82f6',
            },
        });
    },

    loading: (message: string) => {
        return toast.loading(message, defaultOptions);
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) => {
        return toast.promise(promise, messages, defaultOptions);
    },

    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
};

export { Toaster };
export default showToast;
