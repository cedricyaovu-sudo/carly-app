import { useState, useEffect } from 'react';
import { Car, Palette, Circle, Check, Save, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { showSuccess, showError } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const DreamCar = () => {
    const { isDarkMode } = useTheme();
    const { addCash } = useGame();
    const navigate = useNavigate();

    const [selectedColor, setSelectedColor] = useState('#EF4444');
    const [selectedWheels, setSelectedWheels] = useState('sport');
    const [hasSaved, setHasSaved] = useState(false);

    // Simple persistence for this specific game
    useEffect(() => {
        const saved = localStorage.getItem('carly_dream_car_saved');
        if (saved) setHasSaved(true);
    }, []);

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#00C2CB',
    };

    const colors = [
        { id: 'red', hex: '#EF4444' },
        { id: 'blue', hex: '#3B82F6' },
        { id: 'black', hex: '#111827' },
        { id: 'white', hex: '#F9FAFB' },
        { id: 'gold', hex: '#F59E0B' },
        { id: 'green', hex: '#10B981' },
    ];

    const wheels = [
        { id: 'sport', name: 'Sport Alloys' },
        { id: 'classic', name: 'Classic Spokes' },
        { id: 'offroad', name: 'Off-Road Tread' },
    ];

    const handleSave = () => {
        if (hasSaved) {
            showError('You already saved a design today!');
            return;
        }
        
        // Award $50 GoFuel cash for playing
        addCash(50.00, 'dream_car_save');
        setHasSaved(true);
        localStorage.setItem('carly_dream_car_saved', 'true');
        showSuccess('Design saved! Earned $50.00 GoFuel Cash!');
        
        setTimeout(() => navigate('/games'), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.text }}>Build My Dream Car</h2>
                    <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Customize your ride and earn a $50 cash bonus!</p>
                </div>
            </div>

            {/* Car Display Stage */}
            <div style={{
                background: `linear-gradient(to bottom, ${theme.cardBg}, ${theme.border})`,
                borderRadius: 'var(--radius-lg)',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    width: '80%',
                    height: '20px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(4px)'
                }} />
                <Car size={120} color={selectedColor} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))', zIndex: 10 }} />
                
                {/* Simulated wheel overlay based on selection */}
                <div style={{ position: 'absolute', bottom: '65px', left: '145px', zIndex: 11, background: selectedWheels === 'gold' ? '#FBBF24' : '#E5E7EB', width: 24, height: 24, borderRadius: '50%', border: '4px solid #111' }} />
                <div style={{ position: 'absolute', bottom: '65px', right: '145px', zIndex: 11, background: selectedWheels === 'gold' ? '#FBBF24' : '#E5E7EB', width: 24, height: 24, borderRadius: '50%', border: '4px solid #111' }} />
            </div>

            {/* Customization Options */}
            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
                    <Palette size={18} color={theme.textSecondary} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>Paint Color</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {colors.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedColor(c.hex)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: c.hex,
                                border: selectedColor === c.hex ? `3px solid ${theme.primary}` : '2px solid transparent',
                                outline: selectedColor === c.hex ? '2px solid white' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {selectedColor === c.hex && <Check size={20} color={c.hex === '#F9FAFB' ? 'black' : 'white'} />}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
                    <Circle size={18} color={theme.textSecondary} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>Wheels</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {wheels.map(w => (
                        <button
                            key={w.id}
                            onClick={() => setSelectedWheels(w.id)}
                            style={{
                                background: selectedWheels === w.id ? (isDarkMode ? 'rgba(0, 194, 203, 0.1)' : '#E0F2F1') : 'transparent',
                                border: `1px solid ${selectedWheels === w.id ? theme.primary : theme.border}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '12px',
                                color: selectedWheels === w.id ? theme.primary : theme.text,
                                fontWeight: selectedWheels === w.id ? '700' : '500',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            {w.name}
                            {selectedWheels === w.id && <Check size={18} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action */}
            <button
                onClick={handleSave}
                disabled={hasSaved}
                style={{
                    background: hasSaved ? theme.border : theme.primary,
                    color: hasSaved ? theme.textSecondary : 'white',
                    padding: '16px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: hasSaved ? 'not-allowed' : 'pointer',
                    boxShadow: hasSaved ? 'none' : '0 4px 12px rgba(0, 194, 203, 0.3)',
                    marginTop: 'var(--spacing-sm)'
                }}
            >
                <Save size={20} />
                {hasSaved ? 'Design Saved' : 'Save & Claim $50 GoFuel'}
            </button>
        </div>
    );
};

export default DreamCar;
