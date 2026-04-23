import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Text } from '@react-three/drei';
import * as THREE from 'three';
import { VEHICLE_SPAWNS, WORLD_BOUNDS } from './gameData';

const WALK_SPEED = 9;
const RUN_SPEED = 13;
const DRIVE_ACCEL = 24;
const MAX_DRIVE_SPEED = 28;
const DRIVE_TURN_SPEED = 1.85;

const UP = new THREE.Vector3(0, 1, 0);

const clampToBounds = (vector) => {
  vector.x = THREE.MathUtils.clamp(vector.x, -WORLD_BOUNDS, WORLD_BOUNDS);
  vector.z = THREE.MathUtils.clamp(vector.z, -WORLD_BOUNDS, WORLD_BOUNDS);
};

const createVehicles = () =>
  VEHICLE_SPAWNS.map((vehicle) => ({
    ...vehicle,
    position: new THREE.Vector3(...vehicle.position),
    rotation: vehicle.rotation,
  }));

const BuildingCluster = () => {
  const buildings = useMemo(() => {
    const specs = [];
    const columns = [-54, -42, -30, -18, -6];
    const rows = [-40, -28, -16, -4, 8];

    columns.forEach((x, columnIndex) => {
      rows.forEach((z, rowIndex) => {
        if ((x === -30 && z === -16) || (x === -18 && z === -16)) {
          return;
        }

        const width = 9 + ((columnIndex + rowIndex) % 3) * 2;
        const depth = 9 + ((columnIndex * 2 + rowIndex) % 3) * 2;
        const height = 12 + ((columnIndex + rowIndex) % 5) * 6;

        specs.push({
          key: `${x}-${z}`,
          position: [x, height / 2, z],
          size: [width, height, depth],
          color: rowIndex % 2 === 0 ? '#9ca3af' : '#cbd5e1',
        });
      });
    });

    return specs;
  }, []);

  return (
    <group>
      {buildings.map((building) => (
        <mesh
          key={building.key}
          position={building.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={building.size} />
          <meshStandardMaterial color={building.color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
};

const TreeField = () => {
  const trees = useMemo(() => {
    const specs = [];
    const clusters = [
      { center: [48, 46], count: 16, spread: 18 },
      { center: [70, 16], count: 10, spread: 16 },
      { center: [16, 74], count: 16, spread: 20 },
      { center: [-74, 52], count: 14, spread: 18 },
      { center: [86, -56], count: 12, spread: 14 },
    ];

    clusters.forEach(({ center, count, spread }, clusterIndex) => {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const radius = spread * (0.4 + ((i + clusterIndex) % 5) / 5);
        const x = center[0] + Math.cos(angle) * radius;
        const z = center[1] + Math.sin(angle) * radius;
        const scale = 0.9 + ((i + clusterIndex) % 4) * 0.18;

        specs.push({
          key: `${clusterIndex}-${i}`,
          position: [x, 0, z],
          scale,
        });
      }
    });

    return specs;
  }, []);

  return (
    <group>
      {trees.map((tree) => (
        <group key={tree.key} position={tree.position} scale={tree.scale}>
          <mesh castShadow position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.35, 0.55, 2.8, 8]} />
            <meshStandardMaterial color="#8b5a2b" roughness={1} />
          </mesh>
          <mesh castShadow position={[0, 3.9, 0]}>
            <coneGeometry args={[2.2, 4.8, 9]} />
            <meshStandardMaterial color="#15803d" roughness={0.92} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const RoadNetwork = () => (
  <group>
    <mesh position={[0, 0.03, 0]} receiveShadow>
      <boxGeometry args={[146, 0.08, 14]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[0, 0.03, 0]} receiveShadow rotation={[0, Math.PI / 2, 0]}>
      <boxGeometry args={[130, 0.08, 14]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[44, 0.03, 24]} receiveShadow rotation={[0, Math.PI / 5, 0]}>
      <boxGeometry args={[78, 0.08, 12]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[-46, 0.03, -28]} receiveShadow rotation={[0, -Math.PI / 6, 0]}>
      <boxGeometry args={[84, 0.08, 12]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[60, 0.02, -52]} receiveShadow>
      <boxGeometry args={[42, 0.05, 18]} />
      <meshStandardMaterial color="#475569" />
    </mesh>
    <mesh position={[66, 0.01, -52]} receiveShadow>
      <boxGeometry args={[50, 0.02, 22]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  </group>
);

const ZoneLabels = () => (
  <group>
    <Text position={[-34, 8, -54]} color="#0f172a" fontSize={6} outlineWidth={0.25} outlineColor="white">
      Downtown
    </Text>
    <Text position={[54, 8, 76]} color="#14532d" fontSize={6} outlineWidth={0.25} outlineColor="white">
      Green Hills
    </Text>
    <Text position={[82, 8, -54]} color="#0c4a6e" fontSize={6} outlineWidth={0.25} outlineColor="white">
      Harbor
    </Text>
    <Text position={[-78, 8, 70]} color="#166534" fontSize={6} outlineWidth={0.25} outlineColor="white">
      Parklands
    </Text>
  </group>
);

const World = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[260, 260]} />
      <meshStandardMaterial color="#65a30d" />
    </mesh>

    <mesh position={[-30, 0.01, -18]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[74, 66]} />
      <meshStandardMaterial color="#d1d5db" />
    </mesh>

    <mesh position={[78, 0.02, -52]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[54, 36]} />
      <meshStandardMaterial color="#7dd3fc" />
    </mesh>

    <mesh position={[-82, 0.03, 66]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[42, 32]} />
      <meshStandardMaterial color="#22c55e" />
    </mesh>

    <RoadNetwork />
    <BuildingCluster />
    <TreeField />
    <ZoneLabels />
  </group>
);

const CarBody = ({ vehicle, active, collected }) => {
  const scaleMap = {
    sport: [1, 1, 1],
    sedan: [1.05, 1, 1.1],
    suv: [1.12, 1.12, 1.1],
    truck: [1.22, 1.16, 1.45],
    van: [1.1, 1.22, 1.28],
  };

  const scale = scaleMap[vehicle.style] ?? [1, 1, 1];
  const glowColor = active ? '#22d3ee' : collected ? '#86efac' : '#fef08a';

  return (
    <group scale={scale}>
      {!collected && !active && (
        <mesh position={[0, 0.18, 0]}>
          <torusGeometry args={[3.6, 0.12, 12, 32]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={1.2} />
        </mesh>
      )}

      <mesh castShadow position={[0, 1.45, 0]}>
        <boxGeometry args={[3.6, 0.9, 7.2]} />
        <meshStandardMaterial color={vehicle.color} metalness={0.18} roughness={0.44} />
      </mesh>

      <mesh castShadow position={[0, 2.2, -0.15]}>
        <boxGeometry args={[2.45, vehicle.style === 'truck' ? 1.1 : 0.9, 3.2]} />
        <meshStandardMaterial color={vehicle.accent} metalness={0.24} roughness={0.34} />
      </mesh>

      <mesh castShadow position={[0, 1.9, 1.7]}>
        <boxGeometry args={[2.8, 0.45, 1.6]} />
        <meshStandardMaterial color={vehicle.color} metalness={0.15} roughness={0.5} />
      </mesh>

      <mesh castShadow position={[0, 1.9, -3.2]}>
        <boxGeometry args={[2.6, 0.35, 0.5]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh castShadow position={[0, 1.95, 3.15]}>
        <boxGeometry args={[2.55, 0.35, 0.45]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {[
        [-1.7, 0.75, 2.25],
        [1.7, 0.75, 2.25],
        [-1.7, 0.75, -2.25],
        [1.7, 0.75, -2.25],
      ].map((wheelPosition, index) => (
        <mesh
          key={index}
          castShadow
          position={wheelPosition}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.7, 0.7, 0.6, 18]} />
          <meshStandardMaterial color="#111827" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
};

const VehicleEntity = ({ vehicle, active, collected }) => {
  const groupRef = useRef(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(vehicle.position);
    groupRef.current.rotation.y = vehicle.rotation;
  });

  return (
    <group ref={groupRef}>
      <CarBody vehicle={vehicle} active={active} collected={collected} />
    </group>
  );
};

const Walker = ({ actorPositionRef, actorYawRef, movingRef }) => {
  const groupRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const leftLegRef = useRef(null);
  const rightLegRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.position.copy(actorPositionRef.current);
    groupRef.current.rotation.y = actorYawRef.current;

    const swing = movingRef.current ? Math.sin(state.clock.elapsedTime * 8) * 0.55 : 0;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = swing;
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 2.2, 0]}>
        <capsuleGeometry args={[0.48, 1.3, 6, 12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh castShadow position={[0, 3.45, 0]}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshStandardMaterial color="#f5d0b5" />
      </mesh>
      <group ref={leftArmRef} position={[-0.62, 2.55, 0]}>
        <mesh castShadow position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.13, 0.85, 6, 10]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.62, 2.55, 0]}>
        <mesh castShadow position={[0, -0.52, 0]}>
          <capsuleGeometry args={[0.13, 0.85, 6, 10]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group ref={leftLegRef} position={[-0.22, 1.2, 0]}>
        <mesh castShadow position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.15, 0.95, 6, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.22, 1.2, 0]}>
        <mesh castShadow position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.15, 0.95, 6, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
};

const CarCollectorExperience = ({
  inputRef,
  interactionTick,
  collectedIds,
  onModeChange,
  onNearbyVehicleChange,
  onVehicleDiscovered,
}) => {
  const vehiclesRef = useRef(createVehicles());
  const actorPositionRef = useRef(new THREE.Vector3(18, 0.1, 58));
  const actorYawRef = useRef(Math.PI);
  const movingRef = useRef(false);
  const activeVehicleIdRef = useRef(null);
  const driveVelocityRef = useRef(0);
  const cameraYawRef = useRef(Math.PI * 0.85);
  const handledInteractionRef = useRef(interactionTick);
  const nearbyVehicleIdRef = useRef(null);
  const collectedSet = useMemo(() => new Set(collectedIds), [collectedIds]);

  const findVehicle = (id) => vehiclesRef.current.find((vehicle) => vehicle.id === id) ?? null;

  const updateNearbyVehicle = (vehicle) => {
    const nextId = vehicle?.id ?? null;
    if (nearbyVehicleIdRef.current === nextId) return;
    nearbyVehicleIdRef.current = nextId;
    onNearbyVehicleChange(vehicle ?? null);
  };

  const enterVehicle = (vehicle) => {
    activeVehicleIdRef.current = vehicle.id;
    driveVelocityRef.current = 0;
    cameraYawRef.current = vehicle.rotation + Math.PI;
    updateNearbyVehicle(null);
    onModeChange('driving');

    if (!collectedSet.has(vehicle.id)) {
      onVehicleDiscovered(vehicle);
    }
  };

  const exitVehicle = (vehicle) => {
    const rightVector = new THREE.Vector3(Math.cos(vehicle.rotation), 0, -Math.sin(vehicle.rotation));
    actorPositionRef.current.copy(vehicle.position).add(rightVector.multiplyScalar(4.2));
    actorPositionRef.current.y = 0.1;
    clampToBounds(actorPositionRef.current);
    actorYawRef.current = vehicle.rotation;
    activeVehicleIdRef.current = null;
    driveVelocityRef.current = 0;
    cameraYawRef.current = vehicle.rotation + Math.PI * 0.9;
    onModeChange('walking');
    updateNearbyVehicle(vehicle);
  };

  useEffect(() => {
    onModeChange('walking');
    updateNearbyVehicle(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ camera }, delta) => {
    const input = inputRef.current;

    if (input.cameraLeft) {
      cameraYawRef.current += delta * 1.7;
    }
    if (input.cameraRight) {
      cameraYawRef.current -= delta * 1.7;
    }

    const activeVehicle = activeVehicleIdRef.current ? findVehicle(activeVehicleIdRef.current) : null;

    if (activeVehicle) {
      const throttle = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
      const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);

      driveVelocityRef.current += throttle * DRIVE_ACCEL * delta;
      if (throttle === 0) {
        driveVelocityRef.current = THREE.MathUtils.lerp(driveVelocityRef.current, 0, delta * 2.8);
      }
      driveVelocityRef.current = THREE.MathUtils.clamp(
        driveVelocityRef.current,
        -MAX_DRIVE_SPEED * 0.45,
        MAX_DRIVE_SPEED,
      );

      if (Math.abs(driveVelocityRef.current) > 0.15) {
        activeVehicle.rotation -= steer * delta * DRIVE_TURN_SPEED * Math.sign(driveVelocityRef.current);
      }

      activeVehicle.position.x += Math.sin(activeVehicle.rotation) * driveVelocityRef.current * delta;
      activeVehicle.position.z += Math.cos(activeVehicle.rotation) * driveVelocityRef.current * delta;
      clampToBounds(activeVehicle.position);

      if (!input.cameraLeft && !input.cameraRight) {
        cameraYawRef.current = THREE.MathUtils.lerp(
          cameraYawRef.current,
          activeVehicle.rotation + Math.PI,
          delta * 1.3,
        );
      }
    } else {
      const axisX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const axisZ = (input.backward ? 1 : 0) - (input.forward ? 1 : 0);
      const moveVector = new THREE.Vector3(axisX, 0, axisZ);

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize().applyAxisAngle(UP, cameraYawRef.current);
        actorPositionRef.current.addScaledVector(moveVector, (input.boost ? RUN_SPEED : WALK_SPEED) * delta);
        clampToBounds(actorPositionRef.current);
        actorYawRef.current = Math.atan2(moveVector.x, moveVector.z);
        movingRef.current = true;
      } else {
        movingRef.current = false;
      }

      let nearestVehicle = null;
      let nearestDistance = Infinity;
      vehiclesRef.current.forEach((vehicle) => {
        const distance = vehicle.position.distanceTo(actorPositionRef.current);
        if (distance < 8 && distance < nearestDistance) {
          nearestVehicle = vehicle;
          nearestDistance = distance;
        }
      });
      updateNearbyVehicle(nearestVehicle);
    }

    if (interactionTick !== handledInteractionRef.current) {
      handledInteractionRef.current = interactionTick;
      if (activeVehicle) {
        exitVehicle(activeVehicle);
      } else if (nearbyVehicleIdRef.current) {
        const targetVehicle = findVehicle(nearbyVehicleIdRef.current);
        if (targetVehicle) enterVehicle(targetVehicle);
      }
    }

    const cameraTarget = activeVehicle ? activeVehicle.position : actorPositionRef.current;
    const distance = activeVehicle ? 15 : 10.5;
    const height = activeVehicle ? 6.2 : 4.6;
    const desiredCamera = new THREE.Vector3(
      cameraTarget.x + Math.sin(cameraYawRef.current) * distance,
      cameraTarget.y + height,
      cameraTarget.z + Math.cos(cameraYawRef.current) * distance,
    );

    camera.position.lerp(desiredCamera, 1 - Math.exp(-delta * 5.4));

    const lookAt = new THREE.Vector3(
      cameraTarget.x,
      cameraTarget.y + (activeVehicle ? 1.5 : 2.0),
      cameraTarget.z,
    );
    camera.lookAt(lookAt);
  });

  return (
    <>
      <color attach="background" args={['#cfe8ff']} />
      <fog attach="fog" args={['#cfe8ff', 70, 210]} />
      <Sky distance={450000} sunPosition={[25, 18, 10]} turbidity={8} rayleigh={1.6} />
      <ambientLight intensity={0.9} />
      <hemisphereLight intensity={0.4} groundColor="#365314" />
      <directionalLight
        castShadow
        position={[80, 120, 40]}
        intensity={1.35}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      <World />

      {vehiclesRef.current.map((vehicle) => (
        <VehicleEntity
          key={vehicle.id}
          vehicle={vehicle}
          active={vehicle.id === activeVehicleIdRef.current}
          collected={collectedSet.has(vehicle.id)}
        />
      ))}

      {!activeVehicleIdRef.current && (
        <Walker
          actorPositionRef={actorPositionRef}
          actorYawRef={actorYawRef}
          movingRef={movingRef}
        />
      )}
    </>
  );
};

export default CarCollectorExperience;
