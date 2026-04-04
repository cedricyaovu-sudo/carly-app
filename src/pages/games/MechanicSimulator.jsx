import { useState, useEffect } from 'react';
import { Store, UserCircle, Droplet, Settings, CheckCircle2, Factory, Package, ArrowLeft, Clock, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { showSuccess, showError } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

// Data Definitions
const ITEMS = {
    soap: { id: 'soap', name: 'Premium Soap', type: 'supply', icon: <Droplet size={14}/>, time: 5000, level: 1 },
    oil: { id: 'oil', name: 'Motor Oil', type: 'supply', icon: <Droplet size={14}/>, time: 15000, level: 2 },
    clean_car: { id: 'clean_car', name: 'Detailed Car', type: 'service', icon: <CheckCircle2 size={14}/>, req: { soap: 1 }, time: 10000, level: 1, station: 'detail_bay' },
    serviced_car: { id: 'serviced_car', name: 'Serviced Car', type: 'service', icon: <Settings size={14}/>, req: { oil: 1 }, time: 30000, level: 2, station: 'lube_bay' }
};

const STATIONS = {
    supply_truck: { id: 'supply_truck', name: 'Supply Delivery', icon: <Package size={18}/>, level: 1 },
    detail_bay: { id: 'detail_bay', name: 'Detailing Bay', icon: <Droplet size={18}/>, level: 1 },
    lube_bay: { id: 'lube_bay', name: 'Lube Bay', icon: <Settings size={18}/>, level: 2 }
};

const LEVELS = [0, 100, 300, 600, 1200, 2500]; // XP thresholds

const generateOrder = (level) => {
    const isAdvanced = level >= 2 && Math.random() > 0.5;
    return {
        id: Math.random().toString(36).substr(2, 9),
        reqs: isAdvanced ? { clean_car: 1, serviced_car: 1 } : { clean_car: Math.floor(Math.random() * 2) + 1 },
        reward: {
            bucks: isAdvanced ? 150 + Math.floor(Math.random()*50) : 40 + Math.floor(Math.random()*20),
            xp: isAdvanced ? 30 : 10
        }
    };
};

const MechanicSimulator = () => {
    const { isDarkMode } = useTheme();
    const { addCash } = useGame();
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState({ level: 1, xp: 0, bucks: 100 });
    const [inventory, setInventory] = useState({ soap: 0, oil: 0, clean_car: 0, serviced_car: 0 });
    const [queue, setQueue] = useState([]);
    const [orders, setOrders] = useState([]);
    const [now, setNow] = useState(Date.now());

    // Generate initial orders
    useEffect(() => {
        if (orders.length === 0) {
            setOrders([generateOrder(stats.level), generateOrder(stats.level), generateOrder(stats.level)]);
        }
    }, [stats.level, orders.length]);

    // Global Time Ticker for processing queue
    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);

            setQueue(currentQueue => {
                const finishedItems = currentQueue.filter(q => q.finishTime <= currentTime);
                const activeItems = currentQueue.filter(q => q.finishTime > currentTime);

                if (finishedItems.length > 0) {
                    setInventory(prevInv => {
                        const newInv = { ...prevInv };
                        finishedItems.forEach(item => {
                            newInv[item.itemId] = (newInv[item.itemId] || 0) + 1;
                        });
                        return newInv;
                    });
                }
                return activeItems;
            });
        }, 1000); // 1-second tick

        return () => clearInterval(interval);
    }, []);

    // Theme Variables
    const theme = {
        bg: isDarkMode ? 'var(--color-background)' : '#F8FAFC',
        text: isDarkMode ? 'var(--color-text-heading)' : '#111827',
        textSecondary: isDarkMode ? 'var(--color-text-body)' : '#64748B',
        cardBg: isDarkMode ? 'var(--color-surface)' : 'white',
        border: isDarkMode ? 'var(--color-border)' : '#E5E7EB',
        primary: '#3B82F6', // Blue for franchise
        bucks: '#10B981', // Green
        xp: '#8B5CF6' // Purple
    };

    // Actions
    const startAction = (itemId) => {
        const item = ITEMS[itemId];
        if (item.level > stats.level) return;

        // Check station capacity (allow 1 action per station type for now to simulate bays)
        // Wait, for supplies, we can queue multiple. For bays, let's limit to 2 concurrent per bay type.
        const stationType = item.type === 'supply' ? 'supply_truck' : item.station;
        const activeInStation = queue.filter(q => q.station === stationType).length;
        
        const capacity = item.type === 'supply' ? 3 : 2; // Can order 3 supplies at once, run 2 bays at once
        if (activeInStation >= capacity) {
            showError(`${STATIONS[stationType].name} is at full capacity! Wait for jobs to finish.`);
            return;
        }

        // Deduct Requirements
        if (item.req) {
            const hasReqs = Object.keys(item.req).every(reqItem => inventory[reqItem] >= item.req[reqItem]);
            if (!hasReqs) {
                showError(`Not enough materials to start ${item.name}!`);
                return;
            }
            
            setInventory(prev => {
                const newInv = { ...prev };
                Object.keys(item.req).forEach(reqItem => {
                    newInv[reqItem] -= item.req[reqItem];
                });
                return newInv;
            });
        }

        // Add to Queue
        setQueue(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            itemId: item.id,
            itemName: item.name,
            station: stationType,
            startTime: Date.now(),
            totalTime: item.time,
            finishTime: Date.now() + item.time
        }]);
    };

    const fulfillOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Check Inventory
        const hasItems = Object.keys(order.reqs).every(reqItem => inventory[reqItem] >= order.reqs[reqItem]);
        if (!hasItems) {
            showError("You don't have the finished cars to complete this order.");
            return;
        }

        // Deduct Inventory
        setInventory(prev => {
            const newInv = { ...prev };
            Object.keys(order.reqs).forEach(reqItem => {
                newInv[reqItem] -= order.reqs[reqItem];
            });
            return newInv;
        });

        // Grant Rewards
        setStats(prev => {
            let newXp = prev.xp + order.reward.xp;
            let newLevel = prev.level;
            
            // Check Level Up
            if (newLevel < LEVELS.length - 1 && newXp >= LEVELS[newLevel]) {
                newLevel += 1;
                addCash(100 * newLevel, 'township_levelup'); // Gofuel Cash reward
                showSuccess(`Level Up! Reached Level ${newLevel}! Earned $${100 * newLevel} GoFuel Cash!`);
            }
            
            return {
                ...prev,
                bucks: prev.bucks + order.reward.bucks,
                xp: newXp,
                level: newLevel
            };
        });

        // Replace Order
        setOrders(prev => prev.map(o => o.id === orderId ? generateOrder(stats.level) : o));
        showSuccess(`Order fulfilled! +$${order.reward.bucks} Sim Bucks`);
    };

    // UI Helpers
    const xpProgress = stats.level < LEVELS.length - 1 ? (stats.xp / LEVELS[stats.level]) * 100 : 100;
    
    // Derived states for visual scene
    const isTruckActive = queue.some(q => q.station === 'supply_truck');
    const isDetailingActive = queue.some(q => q.station === 'detail_bay');
    const isLubeActive = queue.some(q => q.station === 'lube_bay');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', paddingBottom: '100px' }}>
            
            {/* Header & Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: theme.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{
                    flex: 1,
                    background: theme.cardBg,
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    border: `1px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ background: theme.primary, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.4)' }}>
                        <span style={{ fontSize: '10px', marginTop: '-12px', marginRight: '2px' }}>LVL</span>
                        {stats.level}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: theme.xp, textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>{stats.xp} / {LEVELS[stats.level] || 'MAX'} XP</span>
                            <span style={{ fontSize: '15px', fontWeight: '900', color: theme.bucks, textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>${stats.bucks} Coins</span>
                        </div>
                        <div style={{ width: '100%', background: isDarkMode ? '#1E293B' : '#E2E8F0', height: '8px', borderRadius: '4px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                            <div style={{ height: '100%', background: `linear-gradient(90deg, ${theme.xp}, #A78BFA)`, width: `${Math.min(100, xpProgress)}%`, transition: 'width 0.3s ease-out' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Game Stage (The "Township" View) */}
            <div style={{
                height: '240px',
                backgroundImage: 'url(/garage_bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-lg)',
                border: `4px solid ${theme.border}`,
                boxShadow: '0 8px 16px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Dimmer */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 80%)' }} />

                {/* Sports Car (Center) */}
                <img 
                    src="/sports_car.png" 
                    alt="Sports Car" 
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: `translateX(-50%) ${isDetailingActive || isLubeActive ? 'scale(1.05)' : 'scale(1)'}`,
                        width: '200px',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.6))',
                        transition: 'transform 0.5s',
                        zIndex: 10,
                        animation: (isDetailingActive || isLubeActive) ? 'idleBounce 1s infinite alternate ease-in-out' : 'none'
                    }}
                />

                {/* Mechanic Character (Left) - Shows up when Lube/Service is active */}
                {isLubeActive && (
                    <img 
                        src="/mechanic_char.png" 
                        alt="Mechanic" 
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '15%',
                            width: '80px',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
                            zIndex: 15,
                            animation: 'bounce 0.5s infinite alternate ease-in-out'
                        }} 
                    />
                )}

                {/* Supplies Delivery Element (Right) - Shows up when Supply truck is active */}
                {isTruckActive && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '15%',
                        background: '#F59E0B',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 15,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                        border: '2px solid white',
                        animation: 'slideIn 1s infinite alternate'
                    }}>
                        <Package size={32} color="white" />
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', marginTop: '2px' }}>DELIVERING</span>
                    </div>
                )}

                {/* Detailing Visuals (Bubbles) */}
                {isDetailingActive && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                left: `${30 + Math.random() * 40}%`,
                                bottom: `${20 + Math.random() * 30}%`,
                                width: `${10 + Math.random() * 20}px`,
                                height: `${10 + Math.random() * 20}px`,
                                background: 'rgba(255, 255, 255, 0.4)',
                                border: '1px solid rgba(255,255,255,0.8)',
                                borderRadius: '50%',
                                animation: `floatBubbles ${1 + Math.random() * 2}s infinite linear`,
                                animationDelay: `${Math.random()}s`
                            }} />
                        ))}
                    </div>
                )}

                <style>{`
                    @keyframes idleBounce {
                        0% { transform: translateX(-50%) translateY(0); }
                        100% { transform: translateX(-50%) translateY(-5px); }
                    }
                    @keyframes bounce {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(-10px); }
                    }
                    @keyframes slideIn {
                        0% { transform: translateX(20px); opacity: 0.5; }
                        100% { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes floatBubbles {
                        0% { transform: translateY(0) scale(1); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
                    }
                `}</style>
            </div>

            {/* Inventory Storage */}
            <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={18} color={theme.primary} /> Warehouse
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {Object.values(ITEMS).map(item => {
                        const count = inventory[item.id] || 0;
                        if (item.level > stats.level && count === 0) return null; // Hide future items if don't have them
                        return (
                            <div key={item.id} style={{
                                background: theme.cardBg, border: `2px solid ${count > 0 ? theme.primary : theme.border}`, borderRadius: 'var(--radius-md)', padding: '12px 8px', textAlign: 'center',
                                opacity: count > 0 ? 1 : 0.6,
                                boxShadow: count > 0 ? `0 4px 6px rgba(59, 130, 246, 0.1)` : 'none',
                                position: 'relative'
                            }}>
                                {count > 0 && <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: theme.primary, color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</div>}
                                <div style={{ color: count > 0 ? theme.primary : theme.textSecondary, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                                <div style={{ fontSize: '10px', color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>{item.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Factory Grid (Production / Game Buttons) */}
            <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Factory size={18} color={theme.primary} /> Production Bays
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.values(ITEMS).filter(item => item.level <= stats.level).map(item => {
                        const isSupply = item.type === 'supply';
                        const reqString = isSupply ? 'Free' : Object.keys(item.req).map(k => `${item.req[k]}x ${ITEMS[k].name}`).join(', ');
                        
                        const hasReqs = !isSupply && Object.keys(item.req).every(reqItem => inventory[reqItem] >= item.req[reqItem]);
                        const activeCount = queue.filter(q => q.itemId === item.id).length;
                        const maxCount = isSupply ? 3 : 2; 
                        
                        const activeItem = queue.find(q => q.itemId === item.id);
                        const progress = activeItem ? Math.min(100, Math.max(0, 100 - ((activeItem.finishTime - now) / activeItem.totalTime) * 100)) : 0;
                        const timeLeft = activeItem ? Math.ceil((activeItem.finishTime - now) / 1000) : 0;

                        return (
                            <button key={item.id} 
                                onClick={() => startAction(item.id)}
                                disabled={(!isSupply && !hasReqs) || activeCount >= maxCount}
                                style={{
                                    background: ((!isSupply && !hasReqs) || activeCount >= maxCount) ? (isDarkMode ? '#1E293B' : '#F1F5F9') : `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
                                    border: 'none', 
                                    borderRadius: 'var(--radius-lg)', 
                                    padding: '12px',
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: ((!isSupply && !hasReqs) || activeCount >= maxCount) ? 'not-allowed' : 'pointer',
                                    color: ((!isSupply && !hasReqs) || activeCount >= maxCount) ? theme.textSecondary : 'white',
                                    boxShadow: ((!isSupply && !hasReqs) || activeCount >= maxCount) ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.4)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => { if(!((!isSupply && !hasReqs) || activeCount >= maxCount)) e.currentTarget.style.transform = 'scale(0.95)'; }}
                                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {/* Progress Bar Background overlay directly on button */}
                                {activeCount > 0 && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', background: '#10B981', width: `${progress}%`, transition: 'width 1s linear', zIndex: 1 }} />
                                )}

                                <div style={{ background: isSupply ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '50%', zIndex: 2 }}>
                                    {item.icon}
                                </div>
                                <div style={{ zIndex: 2, textAlign: 'center' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '2px', textShadow: ((!isSupply && !hasReqs) || activeCount >= maxCount) ? 'none' : '0 1px 2px rgba(0,0,0,0.4)' }}>{item.name}</h4>
                                    
                                    {activeCount > 0 ? (
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981' }}>{timeLeft}s remaining</div>
                                    ) : (
                                        <div style={{ fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <Zap size={10}/> {reqString} • <Clock size={10}/> {item.time / 1000}s
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dispatch Board (Orders) */}
            <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCircle size={18} color={theme.xp} /> Customer Orders
                </h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', snapType: 'x mandatory' }}>
                    {orders.map((order, idx) => {
                        // Check if we have resources
                        const canFulfill = Object.keys(order.reqs).every(reqItem => inventory[reqItem] >= order.reqs[reqItem]);

                        return (
                            <div key={order.id} style={{
                                minWidth: '220px',
                                background: canFulfill ? (isDarkMode ? '#064E3B' : '#ECFDF5') : theme.cardBg,
                                border: `2px solid ${canFulfill ? theme.bucks : theme.border}`,
                                borderRadius: 'var(--radius-lg)',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                snapAlign: 'start',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: canFulfill ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)'
                            }}>
                                {canFulfill && <div style={{ position: 'absolute', top: 0, right: 0, background: theme.bucks, color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderBottomLeftRadius: '8px' }}>READY</div>}
                                
                                <div style={{ fontSize: '12px', color: canFulfill ? '#047857' : theme.textSecondary, marginBottom: '12px', fontWeight: '800' }}>CUSTOMER #{idx + 1}</div>
                                
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    {Object.keys(order.reqs).map(reqId => (
                                        <div key={reqId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: theme.text, fontWeight: '600' }}>{ITEMS[reqId].icon} {ITEMS[reqId].name}</span>
                                            <span style={{ fontWeight: '800', color: inventory[reqId] >= order.reqs[reqId] ? theme.bucks : theme.textSecondary }}>
                                                {inventory[reqId] || 0} / {order.reqs[reqId]}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderTop: `1px solid ${canFulfill ? '#34D399' : theme.border}`, paddingTop: '12px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '900', color: theme.bucks }}>+ ${order.reward.bucks}</div>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: theme.xp }}>+ {order.reward.xp} XP</div>
                                </div>

                                <button
                                    onClick={() => fulfillOrder(order.id)}
                                    disabled={!canFulfill}
                                    style={{
                                        background: canFulfill ? `linear-gradient(135deg, ${theme.bucks}, #059669)` : isDarkMode ? '#1E293B' : '#F1F5F9',
                                        color: canFulfill ? 'white' : theme.textSecondary,
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '800',
                                        fontSize: '14px',
                                        cursor: canFulfill ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s',
                                        boxShadow: canFulfill ? '0 4px 6px rgba(16, 185, 129, 0.4)' : 'none'
                                    }}
                                >
                                    Deliver Order
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default MechanicSimulator;
