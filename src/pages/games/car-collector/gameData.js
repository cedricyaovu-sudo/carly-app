export const WORLD_BOUNDS = 112;
export const DISCOVERY_REWARD = 25;

export const VEHICLE_SPAWNS = [
  {
    id: 'flare-gt',
    name: 'Flare GT',
    style: 'sport',
    color: '#ef4444',
    accent: '#111827',
    position: [-34, 0.4, -24],
    rotation: Math.PI * 0.2,
    zone: 'Downtown',
  },
  {
    id: 'metro-cab',
    name: 'Metro Cab',
    style: 'sedan',
    color: '#f59e0b',
    accent: '#1f2937',
    position: [-12, 0.4, 28],
    rotation: Math.PI * 0.5,
    zone: 'Main Street',
  },
  {
    id: 'pine-runner',
    name: 'Pine Runner',
    style: 'suv',
    color: '#10b981',
    accent: '#0f172a',
    position: [46, 0.4, 48],
    rotation: Math.PI,
    zone: 'Green Hills',
  },
  {
    id: 'coast-hauler',
    name: 'Coast Hauler',
    style: 'truck',
    color: '#3b82f6',
    accent: '#0f172a',
    position: [58, 0.4, -8],
    rotation: Math.PI * 1.25,
    zone: 'Harbor Road',
  },
  {
    id: 'midnight-van',
    name: 'Midnight Van',
    style: 'van',
    color: '#8b5cf6',
    accent: '#111827',
    position: [12, 0.4, -58],
    rotation: Math.PI * 1.6,
    zone: 'Warehouse Row',
  },
];

export const WORLD_ZONES = [
  { id: 'downtown', name: 'Downtown', color: '#94a3b8' },
  { id: 'parklands', name: 'Parklands', color: '#22c55e' },
  { id: 'green-hills', name: 'Green Hills', color: '#16a34a' },
  { id: 'harbor-road', name: 'Harbor Road', color: '#0ea5e9' },
];
