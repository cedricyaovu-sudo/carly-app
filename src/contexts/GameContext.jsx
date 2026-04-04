import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => {
    return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
    const { user } = useAuth();
    const [goFuelCash, setGoFuelCash] = useState(0);

    // Load initial balance
    useEffect(() => {
        if (user) {
            const storedCash = localStorage.getItem(`carly_gofuel_cash_${user.id}`);
            if (storedCash) {
                setGoFuelCash(parseFloat(storedCash));
            } else {
                setGoFuelCash(0);
            }
        } else {
            setGoFuelCash(0);
        }
    }, [user]);

    // Function to add cash (positive or negative)
    const addCash = (amount, reason = 'game_reward') => {
        if (!user) return;
        
        setGoFuelCash(prev => {
            const newBalance = prev + amount;
            // Optionally: log transaction history to localStorage or DB here
            // using the `reason` param for auditing
            localStorage.setItem(`carly_gofuel_cash_${user.id}`, newBalance.toString());
            return newBalance;
        });
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
