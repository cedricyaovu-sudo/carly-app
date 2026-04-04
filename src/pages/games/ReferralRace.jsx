import { useState, useEffect } from 'react';
import { Users, Copy, Check, TrendingUp, Gift, RefreshCw, ArrowLeft, Trophy, Medal } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { referralService } from '../../services/referralService';
import { showSuccess, showError } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReferralRace = () => {
    const { isDarkMode } = useTheme();
    const { addCash } = useGame();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    // Mock referral code base on user email prefix
    const refCode = user?.email ? `CARLY_${user.email.split('@')[0].toUpperCase().substring(0, 5)}` : 'CARLY_GUEST';

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await referralService.getReferrals(user.id);
            setReferrals(data);

            // Generate mock leaderboard based on user's current referrals
            const userRefsCount = data.length;
            
            const mockBoard = [
                { id: 'u1', name: 'Alex M.', refs: 42, isCurrentUser: false },
                { id: 'u2', name: 'Sarah J.', refs: 38, isCurrentUser: false },
                { id: 'u3', name: 'Mike T.', refs: 25, isCurrentUser: false },
                { id: 'u4', name: 'Emily R.', refs: 19, isCurrentUser: false },
                { id: 'u5', name: 'David L.', refs: 14, isCurrentUser: false },
                { id: user.id, name: user.email?.split('@')[0] || 'You', refs: userRefsCount, isCurrentUser: true }
            ];
            
            // Sort leaderboard
            mockBoard.sort((a, b) => b.refs - a.refs);
            
            // Limit to top 5 + user if not in top 5
            const finalBoard = [];
            let userFound = false;
            
            for (let i = 0; i < 5; i++) {
                if (mockBoard[i].isCurrentUser) userFound = true;
                finalBoard.push({ ...mockBoard[i], rank: i + 1 });
            }
            
            if (!userFound) {
                const userIndex = mockBoard.findIndex(u => u.isCurrentUser);
                finalBoard.push({ ...mockBoard[userIndex], rank: userIndex + 1 });
            }

            setLeaderboard(finalBoard);

        } catch(err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#8B5CF6',
        success: '#10B981'
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://carly.app/signup?ref=${refCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSuccess('Referral link copied!');
    };

    const handleSimulateSignup = async () => {
        if (!user) return;
        setIsSimulating(true);
        try {
            await referralService.createMockReferral(user.id, refCode);
            showSuccess('New user signed up with your code!');
            loadData();
        } catch(err) {
            showError('Simulation failed');
        }
        setIsSimulating(false);
    };

    const handleProgressReferral = async (refId) => {
        if (!user) return;
        try {
            await referralService.progressReferralFunnel(user.id, refId);
            loadData();
        } catch(err) {
            console.error(err);
        }
    };

    const handleClaim = async (refId) => {
        if (!user) return;
        try {
            const amount = await referralService.claimReward(user.id, refId);
            if (amount > 0) {
                addCash(amount, 'referral_bonus');
                showSuccess(`Claimed $${amount.toFixed(2)} GoFuel Cash!`);
                loadData();
            }
        } catch(err) {
            showError('Failed to claim reward');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return '#F59E0B'; // Amber
            case 'Signed Up': return '#3B82F6'; // Blue
            case 'First Order': return '#10B981'; // Green
            case 'Rewarded': return '#64748B'; // Gray
            default: return theme.textSecondary;
        }
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
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.text }}>Referral Race</h2>
                </div>
            </div>

            {/* Banner */}
            <div style={{
                background: `linear-gradient(135deg, ${theme.primary}, #6D28D9)`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl) var(--spacing-md)',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)'
            }}>
                <Trophy size={32} color="#FBBF24" style={{ marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Race to the Top!</h2>
                <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                    Earn $5.00 GoFuel Cash for every friend who completes their first order. Climb the leaderboard for ultimate bragging rights.
                </p>
            </div>

            {/* Link & Code */}
            <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>Your Unique Referral Link</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        flex: 1,
                        background: isDarkMode ? '#1E293B' : '#F1F5F9',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        color: theme.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${theme.border}`
                    }}>
                        carly.app/signup?ref={refCode}
                    </div>
                    <button
                        onClick={handleCopy}
                        style={{
                            background: copied ? theme.success : theme.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            width: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            {/* Simulator Controls */}
            <div style={{ border: `1px dashed ${theme.primary}`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', background: isDarkMode ? 'rgba(139, 92, 246, 0.05)' : '#F5F3FF' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: theme.primary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} /> Backend Simulator
                </h3>
                <p style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '12px' }}>
                    Simulate backend database webhooks tracking a user's journey to test the referral funnel.
                </p>
                <button
                    onClick={handleSimulateSignup}
                    disabled={isSimulating}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: `2px solid ${theme.primary}`,
                        color: theme.primary,
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        cursor: isSimulating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={18} /> {isSimulating ? 'Simulating...' : 'Simulate New Signup'}
                </button>
            </div>

            {/* Leaderboard Section */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} color="#F59E0B" /> Leaderboard
                </h3>
                <div style={{ background: theme.cardBg, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-sm) 0', boxShadow: 'var(--shadow-sm)', border: `1px solid ${theme.border}` }}>
                    {leaderboard.map((userBoard) => (
                        <div key={userBoard.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: userBoard.isCurrentUser ? (isDarkMode ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF') : 'transparent',
                            borderLeft: userBoard.isCurrentUser ? `4px solid ${theme.primary}` : '4px solid transparent',
                            borderBottom: `1px solid ${theme.border}`
                        }}>
                            <div style={{ width: '40px', fontWeight: '800', color: userBoard.rank <= 3 ? '#F59E0B' : theme.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {userBoard.rank === 1 ? <Medal size={24} color="#FBBF24" /> : userBoard.rank === 2 ? <Medal size={20} color="#9CA3AF" /> : userBoard.rank === 3 ? <Medal size={18} color="#B45309" /> : `#${userBoard.rank}`}
                            </div>
                            <div style={{ flex: 1, paddingLeft: '12px' }}>
                                <div style={{ fontWeight: '700', color: userBoard.isCurrentUser ? theme.primary : theme.text, fontSize: '15px' }}>
                                    {userBoard.name} {userBoard.isCurrentUser && '(You)'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: theme.text, background: isDarkMode ? '#1E293B' : '#F1F5F9', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
                                {userBoard.refs} <span style={{ fontSize: '10px', color: theme.textSecondary, fontWeight: '600', textTransform: 'uppercase' }}>Refs</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tracking List */}
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: 'var(--spacing-md)' }}>Your Referrals</h3>
                
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: theme.textSecondary }}>Loading tracking data...</div>
                ) : referrals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: theme.cardBg, borderRadius: 'var(--radius-lg)', border: `1px solid ${theme.border}` }}>
                        <Gift size={32} color={theme.textSecondary} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <p style={{ color: theme.textSecondary, fontSize: '14px' }}>No referrals yet. Share your code to start racing!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {referrals.slice().reverse().map((ref) => (
                            <div key={ref.id} style={{
                                background: theme.cardBg,
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-md)',
                                border: `1px solid ${theme.border}`,
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>
                                        User {ref.referred_id.substring(0,8)}...
                                    </div>
                                    <div style={{ fontSize: '12px', color: getStatusColor(ref.status), fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(ref.status) }} />
                                        {ref.status}
                                    </div>
                                </div>
                                
                                {ref.status === 'First Order' ? (
                                    <button
                                        onClick={() => handleClaim(ref.id)}
                                        style={{ background: theme.success, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
                                    >
                                        Claim $5
                                    </button>
                                ) : ref.status !== 'Rewarded' ? (
                                    <button
                                        onClick={() => handleProgressReferral(ref.id)}
                                        title="Simulate Next Step"
                                        style={{ background: isDarkMode ? '#1E293B' : '#F1F5F9', color: theme.text, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                ) : (
                                    <div style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: '600', paddingRight: '8px' }}>
                                        Rewarded
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default ReferralRace;
