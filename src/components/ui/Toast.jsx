import { Toaster, toast } from 'react-hot-toast';

// Toast container component
export const ToastContainer = () => (
    <Toaster
        position="top-center"
        toastOptions={{
            duration: 4000,
            style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-heading)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '12px 16px',
                fontSize: '14px',
            },
            success: {
                iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                },
            },
            error: {
                iconTheme: {
                    primary: '#EF4444',
                    secondary: 'white',
                },
            },
        }}
    />
);

// Toast helper functions
export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showInfo = (message) => toast(message, { icon: 'ℹ️' });
export const showLoading = (message) => toast.loading(message);
export const dismissToast = (id) => toast.dismiss(id);

export default toast;
