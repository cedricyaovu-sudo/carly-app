import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { showSuccess } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
    {
        q: "What does EV stand for?",
        options: ["Electric Vehicle", "Engine Valve", "Electronic Velocity", "Extra Volume"],
        answer: 0
    },
    {
        q: "Which car part mixes air with fuel?",
        options: ["Alternator", "Radiator", "Carburetor", "Distributor"],
        answer: 2
    },
    {
        q: "What is the primary purpose of a car's radiator?",
        options: ["To heat the cabin", "To cool the engine", "To block wind", "To filter oil"],
        answer: 1
    },
    {
        q: "What color is standard antifreeze/coolant usually?",
        options: ["Yellow or Red", "Green or Orange", "Blue or Purple", "Clear or White"],
        answer: 1
    },
    {
        q: "What type of paint protection lasts the longest?",
        options: ["Carnauba Wax", "Synthetic Sealant", "Ceramic Coating", "Detailing Spray"],
        answer: 2
    }
];

const CarTrivia = () => {
    const { isDarkMode } = useTheme();
    const { addCash } = useGame();
    const navigate = useNavigate();
    
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('menu'); // menu, playing, done
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasPlayedToday, setHasPlayedToday] = useState(false);

    useEffect(() => {
        const playedDate = localStorage.getItem('carly_trivia_last_played');
        const today = new Date().toDateString();
        if (playedDate === today) {
            setHasPlayedToday(true);
        }
    }, []);

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#F59E0B',
        success: '#10B981',
        error: '#EF4444'
    };

    const startGame = () => {
        setGameState('playing');
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
    };

    const handleAnswer = (index) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(index);
        
        if (index === QUESTIONS[currentQ].answer) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                finishGame(score + (index === QUESTIONS[currentQ].answer ? 1 : 0));
            }
        }, 1500);
    };

    const finishGame = (finalScore) => {
        setGameState('done');
        const reward = finalScore * 10; // $10 GoFuel Cash per correct answer
        if (reward > 0 && !hasPlayedToday) {
            addCash(reward, 'trivia_reward');
            showSuccess(`Trivia Complete! Earned $${reward} GoFuel Cash!`);
        }
        
        localStorage.setItem('carly_trivia_last_played', new Date().toDateString());
        setHasPlayedToday(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: isDarkMode ? 'white' : 'var(--color-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{
                    flex: 1,
                    background: `linear-gradient(135deg, ${theme.primary}, #D97706)`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl) var(--spacing-md)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)'
                }}>
                    <HelpCircle size={32} color="white" style={{ marginBottom: '8px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Daily Car Trivia</h2>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                        Answer 5 questions. Earn $10 GoFuel Cash per correct answer!
                    </p>
                </div>
            </div>

            {/* Game Content */}
            {gameState === 'menu' && (
                <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: `1px solid ${theme.border}` }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Ready to test your knowledge?</h3>
                    {hasPlayedToday ? (
                        <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>You've already earned your rewards for today, but you can play again for fun!</p>
                    ) : (
                        <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>Answer carefully! You only get one shot at today's rewards.</p>
                    )}
                    
                    <button
                        onClick={startGame}
                        style={{
                            background: theme.primary,
                            color: 'white',
                            border: 'none',
                            padding: '16px 32px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}
                    >
                        Start Trivia
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '14px', fontWeight: '600', color: theme.textSecondary }}>
                        <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                        <span>Score: {score}</span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '24px', lineHeight: '1.4' }}>
                        {QUESTIONS[currentQ].q}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {QUESTIONS[currentQ].options.map((opt, idx) => {
                            let bg = isDarkMode ? '#1E293B' : '#F8FAFC';
                            let border = theme.border;
                            let color = theme.text;
                            let icon = null;

                            if (selectedAnswer !== null) {
                                if (idx === QUESTIONS[currentQ].answer) {
                                    bg = isDarkMode ? '#064E3B' : '#D1FAE5';
                                    border = theme.success;
                                    color = isDarkMode ? '#34D399' : '#047857';
                                    icon = <CheckCircle size={20} color={color} />;
                                } else if (idx === selectedAnswer) {
                                    bg = isDarkMode ? '#7F1D1D' : '#FEE2E2';
                                    border = theme.error;
                                    color = isDarkMode ? '#F87171' : '#B91C1C';
                                    icon = <XCircle size={20} color={color} />;
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={selectedAnswer !== null}
                                    style={{
                                        background: bg,
                                        border: `2px solid ${border}`,
                                        borderRadius: 'var(--radius-md)',
                                        padding: '16px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: color,
                                        textAlign: 'left',
                                        cursor: selectedAnswer === null ? 'pointer' : 'default',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {opt}
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {gameState === 'done' && (
                <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: `1px solid ${theme.border}` }}>
                    <Award size={64} color={theme.primary} style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: theme.text, marginBottom: '8px' }}>Trivia Complete!</h3>
                    <p style={{ color: theme.textSecondary, fontSize: '16px', marginBottom: '24px' }}>
                        You answered {score} out of {QUESTIONS.length} correctly.
                    </p>
                    
                    <div style={{ background: isDarkMode ? '#1E293B' : '#F1F5F9', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontWeight: '700', fontSize: '18px', color: theme.primary }}>
                        Earned: ${score * 10} GoFuel Cash
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            background: 'transparent',
                            color: theme.textSecondary,
                            border: `2px solid ${theme.border}`,
                            padding: '12px 24px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Play Again (No Extra Reward)
                    </button>
                </div>
            )}

        </div>
    );
};

export default CarTrivia;
