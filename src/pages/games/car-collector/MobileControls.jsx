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

const MobileControls = ({ onInteract, setControl, canInteract, mode }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          display: 'grid',
          gridTemplateColumns: '60px 60px 60px',
          gridTemplateRows: '60px 60px 60px',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div />
        <button style={{ ...buttonBase }} {...pressHandlers('forward', setControl)}>W</button>
        <div />
        <button style={{ ...buttonBase }} {...pressHandlers('left', setControl)}>A</button>
        <div style={{ ...buttonBase, background: 'rgba(15, 23, 42, 0.45)' }}>MOVE</div>
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
          gap: '10px',
          alignItems: 'flex-end',
          maxWidth: '46%',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{ ...buttonBase, width: '72px', height: '52px' }}
            {...pressHandlers('cameraLeft', setControl)}
          >
            CAM L
          </button>
          <button
            style={{ ...buttonBase, width: '72px', height: '52px' }}
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
            width: '160px',
            minHeight: '56px',
            padding: '0 18px',
            background: canInteract ? 'rgba(0, 194, 203, 0.92)' : 'rgba(15, 23, 42, 0.72)',
            borderColor: canInteract ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.14)',
          }}
        >
          {mode === 'driving' ? 'EXIT CAR' : canInteract ? 'ENTER CAR' : 'SEARCHING...'}
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
