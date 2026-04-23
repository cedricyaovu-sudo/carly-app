import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ArrowLeft, CarFront, Coins, MapPinned, Trees } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useGame } from '../../contexts/GameContext';
import { showSuccess } from '../../components/ui/Toast';
import CarCollectorExperience from './car-collector/CarCollectorScene';
import MobileControls from './car-collector/MobileControls';
import { DISCOVERY_REWARD, VEHICLE_SPAWNS, WORLD_ZONES } from './car-collector/gameData';

const STORAGE_KEY = 'carly_car_collector_discovered';

const defaultInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  boost: false,
  cameraLeft: false,
  cameraRight: false,
};

const KEY_TO_CONTROL = {
  w: 'forward',
  arrowup: 'forward',
  s: 'backward',
  arrowdown: 'backward',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
  shift: 'boost',
  q: 'cameraLeft',
  r: 'cameraRight',
};

const CarCollector = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { addCash } = useGame();
  const [mode, setMode] = useState('walking');
  const [nearbyVehicle, setNearbyVehicle] = useState(null);
  const [interactionTick, setInteractionTick] = useState(0);
  const [inputState, setInputState] = useState(defaultInput);
  const [collectedIds, setCollectedIds] = useState([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );
  const inputRef = useRef(defaultInput);

  const isCompactMobile = viewportWidth < 640;
  const isMobileLike = isTouchDevice || viewportWidth < 900;

  const theme = {
    pageBg: isDarkMode ? 'var(--color-background)' : '#eef6ff',
    text: isDarkMode ? 'var(--color-text-heading)' : '#0f172a',
    textMuted: isDarkMode ? 'var(--color-text-body)' : '#475569',
    card: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    border: isDarkMode ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.28)',
    accent: '#00C2CB',
  };

  useEffect(() => {
    inputRef.current = inputState;
  }, [inputState]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) {
        setCollectedIds(saved);
      }
    } catch {
      setCollectedIds([]);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setIsTouchDevice(mediaQuery.matches || window.innerWidth < 900);
    };

    updateViewport();
    mediaQuery.addEventListener?.('change', updateViewport);
    window.addEventListener('resize', updateViewport);

    return () => {
      mediaQuery.removeEventListener?.('change', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useEffect(() => {
    const updateControl = (event, pressed) => {
      const key = event.key.toLowerCase();
      if (key === ' ' || key === 'enter' || key === 'e') {
        if (pressed) {
          event.preventDefault();
          setInteractionTick((value) => value + 1);
        }
        return;
      }

      const controlName = KEY_TO_CONTROL[key];
      if (!controlName) return;

      event.preventDefault();
      setInputState((previous) =>
        previous[controlName] === pressed ? previous : { ...previous, [controlName]: pressed },
      );
    };

    const handleKeyDown = (event) => updateControl(event, true);
    const handleKeyUp = (event) => updateControl(event, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSetControl = (name, pressed) => {
    setInputState((previous) =>
      previous[name] === pressed ? previous : { ...previous, [name]: pressed },
    );
  };

  const handleVehicleDiscovered = async (vehicle) => {
    setCollectedIds((previous) => {
      if (previous.includes(vehicle.id)) return previous;

      const next = [...previous, vehicle.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    showSuccess(`Collected ${vehicle.name}! +$${DISCOVERY_REWARD} GoFuel Cash`);
    await addCash(DISCOVERY_REWARD, `car_collector_${vehicle.id}`);
  };

  const progressLabel = `${collectedIds.length}/${VEHICLE_SPAWNS.length} cars collected`;
  const interactionLabel = useMemo(() => {
    if (mode === 'driving') return 'Tap or press the interact button to exit your car.';
    if (nearbyVehicle) return `Walk up to ${nearbyVehicle.name} and interact to jump in.`;
    return 'Explore the map and walk up to a parked car to collect it.';
  }, [mode, nearbyVehicle]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isCompactMobile ? '12px' : '16px',
        paddingBottom: isCompactMobile ? '112px' : '96px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <button
          onClick={() => navigate('/games')}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.text,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '3px',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={24} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: isCompactMobile ? '22px' : '24px',
              fontWeight: '800',
              color: theme.text,
              margin: 0,
            }}
          >
            Car Collector
          </h2>
          <p
            style={{
              margin: '6px 0 0',
              color: theme.textMuted,
              lineHeight: 1.5,
              fontSize: isCompactMobile ? '14px' : '15px',
            }}
          >
            Roam a 3D city-and-park world on foot, jump into unique cars, and collect every ride.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompactMobile
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
        }}
      >
        {[
          { icon: <CarFront size={18} />, title: 'Mode', value: mode === 'driving' ? 'Driving' : 'On Foot' },
          { icon: <Coins size={18} />, title: 'Collection', value: progressLabel },
          { icon: <MapPinned size={18} />, title: 'Nearest', value: nearbyVehicle?.zone ?? 'Keep exploring' },
          { icon: <Trees size={18} />, title: 'Map', value: 'City, parks, harbor' },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '18px',
              padding: isCompactMobile ? '12px 13px' : '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.accent }}>
              {card.icon}
              <span style={{ color: theme.textMuted, fontSize: '12px', fontWeight: '700' }}>{card.title}</span>
            </div>
            <div
              style={{
                color: theme.text,
                fontSize: isCompactMobile ? '15px' : '18px',
                fontWeight: '800',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          background: `linear-gradient(180deg, ${theme.pageBg} 0%, rgba(0, 194, 203, 0.14) 100%)`,
          borderRadius: isCompactMobile ? '20px' : '24px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          minHeight: isCompactMobile ? '58dvh' : isMobileLike ? '66vh' : '72vh',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Canvas
          shadows
          dpr={isMobileLike ? [1, 1.1] : [1, 1.5]}
          gl={{ powerPreference: isMobileLike ? 'low-power' : 'high-performance' }}
          camera={{ position: [12, 8, 12], fov: 52, near: 0.1, far: 420 }}
        >
          <CarCollectorExperience
            inputRef={inputRef}
            interactionTick={interactionTick}
            collectedIds={collectedIds}
            onModeChange={setMode}
            onNearbyVehicleChange={setNearbyVehicle}
            onVehicleDiscovered={handleVehicleDiscovered}
          />
        </Canvas>

        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: isCompactMobile ? '12px' : 'auto',
            maxWidth: isCompactMobile ? 'none' : isMobileLike ? '72%' : '360px',
            padding: isCompactMobile ? '10px 12px' : '12px 14px',
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.72)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.04em', color: '#67e8f9' }}>
            OBJECTIVE
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: isCompactMobile ? '14px' : '15px',
              fontWeight: '700',
              lineHeight: 1.45,
            }}
          >
            {interactionLabel}
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: isCompactMobile ? '12px' : '13px',
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.45,
            }}
          >
            {isMobileLike
              ? 'Use the on-screen controls to move, rotate the camera, and enter or exit vehicles.'
              : 'WASD or arrow keys move, Q/R rotate the camera, Shift boosts on foot, and E/Space/Enter enters or exits a car.'}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: isCompactMobile ? '118px' : '12px',
            right: '12px',
            left: isCompactMobile ? '12px' : 'auto',
            display: 'flex',
            flexDirection: isCompactMobile ? 'row' : 'column',
            flexWrap: isCompactMobile ? 'wrap' : 'nowrap',
            justifyContent: isCompactMobile ? 'flex-start' : 'stretch',
            gap: '8px',
            width: isCompactMobile ? 'auto' : isMobileLike ? '118px' : '150px',
          }}
        >
          {WORLD_ZONES.map((zone) => (
            <div
              key={zone.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isCompactMobile ? '7px 9px' : '8px 10px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.84)',
                border: '1px solid rgba(148, 163, 184, 0.24)',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0f172a',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  background: zone.color,
                  display: 'inline-block',
                }}
              />
              {zone.name}
            </div>
          ))}
        </div>

        {isMobileLike && (
          <MobileControls
            onInteract={() => setInteractionTick((value) => value + 1)}
            setControl={handleSetControl}
            canInteract={Boolean(nearbyVehicle) || mode === 'driving'}
            mode={mode}
            compact={isCompactMobile}
          />
        )}
      </div>

      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: isCompactMobile ? '14px' : '16px 18px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ color: theme.text, fontSize: '16px', fontWeight: '800', marginBottom: '10px' }}>
          Garage Progress
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompactMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
          }}
        >
          {VEHICLE_SPAWNS.map((vehicle) => {
            const collected = collectedIds.includes(vehicle.id);
            return (
              <div
                key={vehicle.id}
                style={{
                  borderRadius: '16px',
                  padding: '12px 14px',
                  background: collected
                    ? 'rgba(0, 194, 203, 0.12)'
                    : isDarkMode
                      ? 'rgba(15, 23, 42, 0.72)'
                      : 'rgba(241, 245, 249, 0.92)',
                  border: `1px solid ${collected ? 'rgba(0, 194, 203, 0.34)' : theme.border}`,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: theme.text,
                    fontWeight: '800',
                    marginBottom: '4px',
                    fontSize: isCompactMobile ? '14px' : '15px',
                  }}
                >
                  {vehicle.name}
                </div>
                <div style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '6px' }}>{vehicle.zone}</div>
                <div style={{ color: collected ? '#0891b2' : theme.textMuted, fontSize: '12px', fontWeight: '700' }}>
                  {collected ? 'Collected' : `Worth $${DISCOVERY_REWARD}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarCollector;
