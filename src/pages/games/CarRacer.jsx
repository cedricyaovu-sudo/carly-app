import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation, Play, RotateCcw, Award, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { showSuccess } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const CarRacer = () => {
    const { isDarkMode } = useTheme();
    const { addCash } = useGame();
    const navigate = useNavigate();
    const requestRef = useRef();

    const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [milestoneReached, setMilestoneReached] = useState(false);

    // Player Logic (0: Left, 1: Middle, 2: Right)
    const [playerLane, setPlayerLane] = useState(1);
    const [obstacles, setObstacles] = useState([]);
    
    // Engine speed
    const baseSpeed = 5;
    const [speed, setSpeed] = useState(baseSpeed);

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#10B981',
        road: '#374151',
        laneLine: '#9CA3AF'
    };

    useEffect(() => {
        const savedHS = localStorage.getItem('carly_racer_hs');
        if (savedHS) setHighScore(parseInt(savedHS));
    }, []);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setPlayerLane(1);
        setObstacles([]);
        setSpeed(baseSpeed);
        setMilestoneReached(false);
    };

    const gameOver = () => {
        setGameState('gameover');
        if (score > highScore) {
            setHighScore(Math.floor(score));
            localStorage.setItem('carly_racer_hs', Math.floor(score).toString());
        }
    };

    // Game Loop
    const updateGame = useCallback(() => {
        if (gameState !== 'playing') return;

        setScore(prev => prev + 0.1);
        setSpeed(prev => Math.min(prev + 0.005, 12)); // Max speed 12

        // Check milestones for rewards
        if (!milestoneReached && score > 500) {
            addCash(50, 'racer_milestone_500');
            showSuccess('500 Score Reached! Earned $50 GoFuel Cash!');
            setMilestoneReached(true); // Prevent multiple awards in same run
        }

        setObstacles(prev => {
            let nextObstacles = prev.map(obs => ({ ...obs, y: obs.y + speed }));
            
            // Remove off-screen
            nextObstacles = nextObstacles.filter(obs => obs.y < 120);

            // Add new obstacle randomly (based on speed to avoid impossible walls)
            if (Math.random() < (0.02 + speed/500)) {
                // To prevent impossible overlaps, check spacing roughly
                const lastY = nextObstacles.length > 0 ? Math.min(...nextObstacles.map(o => o.y)) : Infinity;
                if (lastY > 30 || nextObstacles.length === 0) {
                     nextObstacles.push({
                         id: Date.now() + Math.random(),
                         lane: Math.floor(Math.random() * 3),
                         y: -20
                     });
                }
            }

            // Collision Detection
            // Player is roughly at y: 80-95 in percentage. Obstacle is roughly 15% height.
            const playerHitbox = { lane: playerLane, top: 80, bottom: 95 };
            
            for (let obs of nextObstacles) {
                const obsHitbox = { lane: obs.lane, top: obs.y, bottom: obs.y + 15 };
                
                if (
                    playerHitbox.lane === obsHitbox.lane &&
                    playerHitbox.top < obsHitbox.bottom &&
                    playerHitbox.bottom > obsHitbox.top
                ) {
                    gameOver();
                }
            }

            return nextObstacles;
        });

        requestRef.current = requestAnimationFrame(updateGame);
    }, [gameState, playerLane, score, speed, milestoneReached, addCash]);

    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(updateGame);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, updateGame]);

    const moveLeft = () => setPlayerLane(prev => Math.max(0, prev - 1));
    const moveRight = () => setPlayerLane(prev => Math.min(2, prev + 1));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.text }}>Highway Racer</h2>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                        <div style={{ color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>Score: {Math.floor(score)}</div>
                        <div style={{ color: theme.primary, fontSize: '14px', fontWeight: '700' }}>High Score: {highScore}</div>
                    </div>
                </div>
            </div>

            {/* Game Canvas container */}
            <div style={{
                background: theme.road,
                borderRadius: 'var(--radius-lg)',
                height: '400px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                display: 'flex'
            }}>
                {/* Lanes */}
                <div style={{ flex: 1, borderRight: `2px dashed ${theme.laneLine}` }} />
                <div style={{ flex: 1, borderRight: `2px dashed ${theme.laneLine}` }} />
                <div style={{ flex: 1 }} />

                {gameState === 'playing' && (
                    <>
                        {/* Player Car */}
                        <div style={{
                            position: 'absolute',
                            bottom: '5%',
                            left: `${(playerLane * 33.33) + 16.66}%`,
                            transform: 'translateX(-50%)',
                            width: '40px',
                            height: '60px',
                            background: '#00C2CB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                            transition: 'left 0.1s ease-out'
                        }}>
                             <div style={{ width: '30px', height: '15px', background: '#111', margin: '10px auto 0', borderRadius: '4px' }} />
                        </div>

                        {/* Obstacles */}
                        {obstacles.map(obs => (
                            <div key={obs.id} style={{
                                position: 'absolute',
                                top: `${obs.y}%`,
                                left: `${(obs.lane * 33.33) + 16.66}%`,
                                transform: 'translateX(-50%)',
                                width: '40px',
                                height: '60px',
                                background: '#EF4444',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                            }}>
                                <div style={{ width: '30px', height: '15px', background: '#111', margin: '35px auto 0', borderRadius: '4px' }} />
                            </div>
                        ))}
                    </>
                )}

                {/* Overlays */}
                {gameState === 'menu' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Navigation size={48} color={theme.primary} style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Highway Racer</h3>
                        <p style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.8 }}>Reach 500 points for a $50 GoFuel bonus!</p>
                        <button onClick={startGame} style={{ background: theme.primary, border: 'none', padding: '12px 32px', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Play size={20} /> Play Now
                        </button>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#EF4444', marginBottom: '8px' }}>CRASHED!</h3>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Score: {Math.floor(score)}</div>
                        <div style={{ fontSize: '14px', color: theme.primary, marginBottom: '24px' }}>High Score: {highScore}</div>
                        <button onClick={startGame} style={{ background: theme.primary, border: 'none', padding: '12px 32px', borderRadius: 'var(--radius-full)', color: 'white', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <RotateCcw size={20} /> Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            {gameState === 'playing' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={moveLeft}
                        style={{ flex: 1, padding: '24px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 'var(--radius-lg)', fontSize: '24px', fontWeight: '900', cursor: 'pointer', color: theme.text, touchAction: 'manipulation' }}
                    >
                        &larr; LEFT
                    </button>
                    <button
                        onClick={moveRight}
                        style={{ flex: 1, padding: '24px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 'var(--radius-lg)', fontSize: '24px', fontWeight: '900', cursor: 'pointer', color: theme.text, touchAction: 'manipulation' }}
                    >
                        RIGHT &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default CarRacer;
