import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const GameContext = createContext();

export const useGame = () => {
    return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const [goFuelCash, setGoFuelCash] = useState(0);

    // Fetch initial balance from database
    const fetchBalance = useCallback(async () => {
        if (!user) {
            setGoFuelCash(0);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('virtual_cash')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching virtual cash:', error);
                setGoFuelCash(0);
            } else if (data) {
                setGoFuelCash(Number(data.virtual_cash) || 0);
            }
        } catch (err) {
            console.error('Failed to parse virtual cash', err);
            setGoFuelCash(0);
        }
    }, [user]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Function to add cash (positive or negative)
    const addCash = async (amount, reason = 'game_reward') => {
        if (!user) return;
        
        // Optimistic UI update
        const newBalance = goFuelCash + amount;
        setGoFuelCash(newBalance);

        // Persist to database
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ virtual_cash: newBalance })
                .eq('id', user.id);

            if (error) {
                console.error('Failed to update virtual cash in db:', error);
                // Optionally revert state here if needed
                // setGoFuelCash(goFuelCash);
            }
        } catch (err) {
            console.error('Error executing query for virtual cash', err);
        }
    };

    const val = {
        goFuelCash,
        addCash
    };

    return (
        <GameContext.Provider value={val}>
            {children}
        </GameContext.Provider>
    );
};
