import { useState, useCallback, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const PullToRefresh = ({ onRefresh, children }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const containerRef = useRef(null);
    const threshold = 80;

    const handleTouchStart = useCallback((e) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            setPullDistance(Math.min(diff * 0.5, 120));
            e.preventDefault();
        }
    }, [isPulling, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(60);

            try {
                await onRefresh?.();
            } finally {
                setIsRefreshing(false);
            }
        }

        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, isRefreshing, onRefresh]);

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                height: '100%',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                position: 'relative'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pullDistance > 20 ? 1 : 0,
                    zIndex: 10,
                    pointerEvents: 'none',
                    transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`
                }}
            >
                <div
                    style={{
                        transform: `rotate(${isRefreshing ? 0 : (pullDistance / threshold) * 180}deg)`,
                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    }}
                >
                    <LoadingSpinner size={24} />
                </div>
            </div>
            <div style={{
                transform: `translateY(${pullDistance}px)`,
                height: '100%'
            }}>
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
