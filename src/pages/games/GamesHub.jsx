import { Trophy, Car, Users, Navigation, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';

const GamesHub = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { goFuelCash } = useGame();

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#00C2CB',
        accent: '#F59E0B' // Gold for cash
    };

    const games = [
        {
            id: 'car-collector',
            title: 'Car Collector',
            desc: 'Explore a 3D open world, walk the map, and collect unique cars.',
            icon: <Car size={20} color="white" />,
            color: '#00C2CB',
            path: '/games/car-collector',
            banner: '/car-collector-banner.svg'
        },
        {
            id: 'racer',
            title: 'Highway Racer',
            desc: 'Dodge traffic and set high scores for bonuses.',
            icon: <Navigation size={20} color="white" />,
            color: '#10B981',
            path: '/games/racer',
            banner: '/racer_banner.png'
        },
        {
            id: 'trivia',
            title: 'Daily Trivia',
            desc: 'Test your car knowledge and win daily cash.',
            icon: <HelpCircle size={20} color="white" />,
            color: '#F59E0B',
            path: '/games/trivia',
            banner: '/trivia_banner_v2.png'
        },
        {
            id: 'referral-race',
            title: 'Referral Race',
            desc: 'Climb the leaderboard! Earn $5 GoFuel Cash per signup.',
            icon: <Users size={20} color="white" />,
            color: '#8B5CF6',
            path: '/games/referral-race',
            banner: '/referral_banner.png'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header & Balance */}
            <div style={{
                background: `linear-gradient(135deg, ${theme.primary}, #007AFF)`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl) var(--spacing-md)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 8px 16px rgba(0, 194, 203, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={24} color="#FBBF24" />
                    <span style={{ fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>GoFuel Cash</span>
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '24px', marginTop: '6px' }}>$</span>
                    {goFuelCash.toFixed(2)}
                </div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px', textAlign: 'center' }}>
                    *Virtual currency. Not applicable to real-world services.
                </p>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginTop: '8px' }}>Active Challenges</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {games.map(game => (
                    <div 
                        key={game.id}
                        onClick={() => navigate(game.path)}
                        style={{
                            background: theme.cardBg,
                            borderRadius: 'var(--radius-xl)',
                            border: `1px solid ${theme.border}`,
                            boxShadow: 'var(--shadow-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        {/* Banner Image */}
                        <div style={{
                            width: '100%',
                            height: '160px',
                            backgroundImage: `url(${game.banner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: game.id === 'trivia' ? 'center 75%' : 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                left: '16px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: game.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 12px ${game.color}60`,
                                border: '2px solid white'
                            }}>
                                {game.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 'var(--spacing-lg)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: theme.text, marginBottom: '4px' }}>
                                {game.title}
                            </h3>
                            <p style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
                                {game.desc}
                            </p>
                        </div>

                        {/* Play Button Overlay Scent */}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            Play Now
                        </div>
                    </div>
                ))}

                {/* Coming Soon Message */}
                <div style={{ 
                    textAlign: 'center', 
                    padding: 'var(--spacing-xl) 0 var(--spacing-xxl)', 
                    color: theme.textSecondary,
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: 0.7,
                    letterSpacing: '0.5px'
                }}>
                    More games coming soon!
                </div>
            </div>

        </div>
    );
};

export default GamesHub;
