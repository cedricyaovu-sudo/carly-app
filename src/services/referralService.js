import { supabase } from '../lib/supabase';

export const referralService = {
    /**
     * Fetch all referrals for a given user
     */
    getReferrals: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Could not fetch referrals (table may be missing). Returning empty array.");
                return [];
            }
            return data || [];
        } catch (e) {
            console.error("Referral fetch error:", e);
            return [];
        }
    },

    /**
     * Create a new referral (someone signing up with a code)
     */
    createMockReferral: async (referrerId, referralCode) => {
        try {
            // Check if profile exists
            const { data: prof } = await supabase.from('profiles').select('id').eq('id', referrerId).single();
            if (!prof) return null;

            const newReferral = {
                referrer_id: referrerId,
                referred_id: `generated_${Date.now()}`,
                referral_code: referralCode,
                status: 'Pending',
                reward_amount: 5.00
            };

            const { data, error } = await supabase
                .from('referrals')
                .insert([newReferral])
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("Failed to create referral mock:", e);
            return null;
        }
    },

    /**
     * Simulate a referral progressing through the funnel to "Rewarded"
     */
    progressReferralFunnel: async (referrerId, referralId) => {
        try {
            const { data: ref } = await supabase
                .from('referrals')
                .select('*')
                .eq('id', referralId)
                .single();

            if (!ref) return null;

            let newStatus = ref.status;
            let updates = {};

            if (ref.status === 'Pending') {
                updates = { status: 'Signed Up' };
            } else if (ref.status === 'Signed Up') {
                updates = { status: 'First Order', converted_at: new Date().toISOString() };
            } else if (ref.status === 'First Order') {
                updates = { status: 'Rewarded', rewarded_at: new Date().toISOString() };
            }

            const { data, error } = await supabase
                .from('referrals')
                .update(updates)
                .eq('id', referralId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error("Funnel progress failed:", e);
            return null;
        }
    },

    /**
     * Mark a referral as rewarded and claim the cash
     */
    claimReward: async (referrerId, referralId) => {
        try {
            const { data: ref, error: fetchErr } = await supabase
                .from('referrals')
                .select('status, reward_amount')
                .eq('id', referralId)
                .single();

            if (fetchErr || !ref || ref.status !== 'First Order') return 0;

            const { error: updErr } = await supabase
                .from('referrals')
                .update({ 
                    status: 'Rewarded', 
                    rewarded_at: new Date().toISOString() 
                })
                .eq('id', referralId);

            if (updErr) return 0;
            return ref.reward_amount;
        } catch (e) {
            console.error("Claim reward failed:", e);
            return 0;
        }
    }
};
