import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const syncLeadForUser = async (sessionUser, accessToken) => {
    const email = sessionUser?.email?.trim().toLowerCase();
    if (!email || !accessToken) return;

    const name =
        sessionUser?.user_metadata?.full_name ||
        sessionUser?.user_metadata?.name ||
        null;
    const phone =
        sessionUser?.phone ||
        sessionUser?.user_metadata?.phone_number ||
        sessionUser?.user_metadata?.phone ||
        null;

    try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                email,
                name,
                phone,
            }),
        });
    } catch (err) {
        console.error('Lead sync failed:', err);
    }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, onboarding_completed, is_gofuel_pro, avatar_url')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching auth profile:', err);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession()
            .then(async ({ data: { session } }) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    await syncLeadForUser(currentUser, session?.access_token);
                    await fetchProfile(currentUser.id);
                }
            })
            .catch(err => {
                console.error('Auth initialization error:', err);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                if (currentUser) {
                    syncLeadForUser(currentUser, session?.access_token);
                    fetchProfile(currentUser.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signUp = useCallback(async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        if (error) throw error;
        return data;
    }, []);

    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }, []);

    const value = useMemo(() => ({
        signUp,
        signIn,
        signOut,
        user,
        profile,
        loading,
        refreshProfile: (userId) => {
            const id = userId || user?.id;
            return id ? fetchProfile(id) : Promise.resolve();
        }
    }), [signUp, signIn, signOut, user, profile, loading, fetchProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
