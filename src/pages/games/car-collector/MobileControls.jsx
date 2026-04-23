const buttonBase = {
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(15, 23, 42, 0.76)',
  color: 'white',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  userSelect: 'none',
  WebkitUserSelect: 'none',
  touchAction: 'none',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.28)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const pressHandlers = (name, setControl) => ({
  onPointerDown: (event) => {
    event.preventDefault();
    setControl(name, true);
  },
  onPointerUp: () => setControl(name, false),
  onPointerLeave: () => setControl(name, false),
  onPointerCancel: () => setControl(name, false),
});

const MobileControls = ({ onInteract, setControl, canInteract, mode, compact = false }) => {
  const moveSize = compact ? 52 : 60;
  const cameraWidth = compact ? 60 : 72;
  const cameraHeight = compact ? 46 : 52;
  const actionWidth = compact ? 142 : 160;
  const actionHeight = compact ? 50 : 56;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        padding: compact
          ? '12px 12px calc(12px + env(safe-area-inset-bottom, 0px))'
          : '16px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          display: 'grid',
          gridTemplateColumns: `${moveSize}px ${moveSize}px ${moveSize}px`,
          gridTemplateRows: `${moveSize}px ${moveSize}px ${moveSize}px`,
          gap: compact ? '6px' : '8px',
          alignItems: 'center',
        }}
      >
        <div />
        <button style={{ ...buttonBase }} {...pressHandlers('forward', setControl)}>W</button>
        <div />
        <button style={{ ...buttonBase }} {...pressHandlers('left', setControl)}>A</button>
        <div
          style={{
            ...buttonBase,
            background: 'rgba(15, 23, 42, 0.45)',
            fontSize: compact ? '10px' : '12px',
          }}
        >
          MOVE
        </div>
        <button style={{ ...buttonBase }} {...pressHandlers('right', setControl)}>D</button>
        <div />
        <button style={{ ...buttonBase }} {...pressHandlers('backward', setControl)}>S</button>
        <div />
      </div>

      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? '8px' : '10px',
          alignItems: 'flex-end',
          maxWidth: compact ? '48%' : '46%',
        }}
      >
        <div style={{ display: 'flex', gap: compact ? '8px' : '10px' }}>
          <button
            style={{ ...buttonBase, width: `${cameraWidth}px`, height: `${cameraHeight}px`, fontSize: compact ? '10px' : '12px' }}
            {...pressHandlers('cameraLeft', setControl)}
          >
            CAM L
          </button>
          <button
            style={{ ...buttonBase, width: `${cameraWidth}px`, height: `${cameraHeight}px`, fontSize: compact ? '10px' : '12px' }}
            {...pressHandlers('cameraRight', setControl)}
          >
            CAM R
          </button>
        </div>

        <button
          type="button"
          onClick={onInteract}
          style={{
            ...buttonBase,
            width: `${actionWidth}px`,
            minHeight: `${actionHeight}px`,
            padding: compact ? '0 14px' : '0 18px',
            background: canInteract ? 'rgba(0, 194, 203, 0.92)' : 'rgba(15, 23, 42, 0.72)',
            borderColor: canInteract ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.14)',
            fontSize: compact ? '12px' : '13px',
          }}
        >
          {mode === 'driving' ? 'EXIT CAR' : canInteract ? 'ENTER CAR' : 'SEARCHING...'}
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
