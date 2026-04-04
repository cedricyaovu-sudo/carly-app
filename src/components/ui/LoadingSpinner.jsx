import { useState, useEffect } from 'react';

const LoadingSpinner = ({ size = 24, color = 'var(--color-primary)' }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                border: `3px solid ${color}20`,
                borderTop: `3px solid ${color}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
    );
};

// Full page loading overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 9999,
            }}
        >
            <LoadingSpinner size={40} color="white" />
            <span style={{ color: 'white', fontSize: '14px' }}>{message}</span>
        </div>
    );
};

// Inline loading with skeleton
export const LoadingSkeleton = ({ height = 60, borderRadius = 'var(--radius-md)' }) => {
    return (
        <div
            style={{
                height,
                background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
                backgroundSize: '200% 100%',
                borderRadius,
                animation: 'skeleton-shimmer 2s linear infinite'
            }}
        />
    );
};

export default LoadingSpinner;
