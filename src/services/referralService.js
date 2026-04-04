import { useState, useEffect } from 'react';

// Simulated latency for realism
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'carly_referrals_v1';

const getLocalData = (userId) => {
    const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
};

const saveLocalData = (userId, data) => {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
};

export const referralService = {
    /**
     * Fetch all referrals for a given user
     */
    getReferrals: async (userId) => {
        await delay(500); // Simulate network
        return getLocalData(userId);
    },

    /**
     * Create a new referral (simulating someone signing up with a code)
     */
    createMockReferral: async (referrerId, referralCode) => {
        await delay(800);
        const data = getLocalData(referrerId);
        
        const newReferral = {
            id: `ref_${Date.now()}`,
            referrer_id: referrerId,
            referred_id: `mock_user_${Math.floor(Math.random() * 10000)}`,
            referral_code: referralCode,
            status: 'Pending', // Pending -> Signed Up -> First Order -> Rewarded
            reward_amount: 5.00,
            created_at: new Date().toISOString(),
            converted_at: null,
            rewarded_at: null
        };

        data.push(newReferral);
        saveLocalData(referrerId, data);
        return newReferral;
    },

    /**
     * Simulate a referral progressing through the funnel to "Rewarded"
     */
    progressReferralFunnel: async (referrerId, referralId) => {
        await delay(1000);
        const data = getLocalData(referrerId);
        
        const index = data.findIndex(r => r.id === referralId);
        if (index === -1) throw new Error('Referral not found');

        const ref = data[index];
        const now = new Date().toISOString();

        if (ref.status === 'Pending') {
            ref.status = 'Signed Up';
        } else if (ref.status === 'Signed Up') {
            ref.status = 'First Order';
            ref.converted_at = now;
        } else if (ref.status === 'First Order') {
            ref.status = 'Rewarded';
            ref.rewarded_at = now;
        }

        saveLocalData(referrerId, data);
        return ref;
    },

    /**
     * Mark a referral as rewarded and claim the cash
     */
    claimReward: async (referrerId, referralId) => {
        await delay(400);
        const data = getLocalData(referrerId);
        const index = data.findIndex(r => r.id === referralId);
        
        if (index > -1 && data[index].status === 'First Order') {
            data[index].status = 'Rewarded';
            data[index].rewarded_at = new Date().toISOString();
            saveLocalData(referrerId, data);
            return data[index].reward_amount;
        }
        return 0;
    }
};
