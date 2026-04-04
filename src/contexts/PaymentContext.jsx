import React, { createContext, useContext, useState, useCallback } from 'react';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
    const [membershipIntent, setMembershipIntent] = useState({
        clientSecret: null,
        amount: null,
        isLoading: false,
        error: null
    });

    const prefetchMembershipIntent = useCallback(async (amount = 0.50) => {
        // Prevent redundant fetches if already loading or already have secret
        if (membershipIntent.isLoading || membershipIntent.clientSecret) return;

        setMembershipIntent(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('https://ugqjyfgcosjajazsdydw.supabase.co/functions/v1/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to prefetch payment intent');
            }

            const data = await response.json();
            setMembershipIntent({
                clientSecret: data.clientSecret,
                amount: data.amount,
                isLoading: false,
                error: null
            });
        } catch (err) {
            console.error('Prefetch error:', err);
            setMembershipIntent(prev => ({ ...prev, isLoading: false, error: err.message }));
        }
    }, [membershipIntent.isLoading, membershipIntent.clientSecret]);

    const value = {
        membershipIntent,
        prefetchMembershipIntent,
        setMembershipIntent
    };

    return (
        <PaymentContext.Provider value={value}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};
