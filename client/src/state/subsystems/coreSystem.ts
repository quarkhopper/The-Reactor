import eventBus from '../eventBus';

const GRID_SIZE = 6;
const ROD_COUNT = 8;
const MOVE_DURATION = 10000;
const BLINK_INTERVAL = 200;

// Temperature thresholds
const TEMP_THRESHOLDS = {
  green: 100,
  amber: 300,
  red: 600,
  white: 900,
};

// Fuel rod state
interface FuelRod {
  position: number;
  targetPosition: number;
  isMoving: boolean;
  lastMovementStart: number | null;
  temperature: number;
}

const fuelRods: FuelRod[][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => ({
    position: 1,
    targetPosition: 1,
    isMoving: false,
    lastMovementStart: null,
    temperature: 20,
  }))
);

// Control rod positions (direct from sliders)
let controlRodPositions: number[] = Array(ROD_COUNT).fill(1);

// Reactivity tensor
let reactivity: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

// Rod mapping
let rodToCoords: [number, number][][] = Array.from({ length: ROD_COUNT }, () => []);
let coordToRodMap: Map<string, number[]> = new Map();

// Ensure all grid coordinates are mapped to at least one rod
function regenerateRodMapping() {
  rodToCoords = Array.from({ length: ROD_COUNT }, () => []);
  coordToRodMap = new Map();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rod = Math.floor(Math.random() * ROD_COUNT);
      rodToCoords[rod].push([x, y]);

      const key = `${x},${y}`;
      coordToRodMap.set(key, [rod]);
    }
  }

  // Add overlaps for fun
  for (let rod = 0; rod < ROD_COUNT; rod++) {
    while (rodToCoords[rod].length < 6) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const key = `${x},${y}`;

      if (!rodToCoords[rod].some(([a, b]) => a === x && b === y)) {
        rodToCoords[rod].push([x, y]);

        const existing = coordToRodMap.get(key) || [];
        if (!existing.includes(rod)) {
          coordToRodMap.set(key, [...existing, rod]);
        }
      }
    }
  }
}

regenerateRodMapping();

// --- TICK ---
function tick() {
  const now = Date.now();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rod = fuelRods[x][y];

      // Movement animation
      if (rod.isMoving && rod.lastMovementStart !== null) {
        const elapsed = now - rod.lastMovementStart;
        const progress = Math.min(elapsed / MOVE_DURATION, 1);
        rod.position = 1 - progress;

        if (progress >= 1) {
          rod.position = 0;
          rod.isMoving = false;
          rod.lastMovementStart = null;
        }
      }

      const fuelFactor = rod.position;
      const key = `${x},${y}`;
      const influencingRods = coordToRodMap.get(key) || [];

      let suppression = 0;
      if (influencingRods.length > 0) {
        suppression = influencingRods
          .map((i: number) => controlRodPositions[i])
          .reduce((sum: number, v: number) => sum + v, 0) / influencingRods.length;
      }

      const delta = (fuelFactor * (1 - suppression)) * 0.05;
      reactivity[x][y] = Math.min(1, Math.max(0, reactivity[x][y] + delta));

      if (fuelFactor > 0) {
        rod.temperature += reactivity[x][y] * 10;
      } else {
        rod.temperature = Math.max(0, rod.temperature - 5);
      }
    }
  }
}

// --- UI State ---
function getFuelRodUIState(x: number, y: number) {
  const rod = fuelRods[x][y];
  const now = Date.now();

  const isBlinking =
    rod.isMoving &&
    rod.lastMovementStart !== null &&
    Math.floor((now - rod.lastMovementStart) / BLINK_INTERVAL) % 2 === 0;

  const color = rod.position === 0 && rod.temperature === 0
    ? 'off'
    : rod.temperature < TEMP_THRESHOLDS.green
      ? 'green'
      : rod.temperature < TEMP_THRESHOLDS.amber
        ? 'amber'
        : rod.temperature < TEMP_THRESHOLDS.red
          ? 'red'
          : 'white';

  return {
    color: isBlinking ? (color === 'off' ? 'white' : 'off') : color,
    locked: rod.isMoving,
  };
}

// --- SCRAM ---
function scram() {
  controlRodPositions = controlRodPositions.map(() => 0);
  console.log('[coreSystem] SCRAM: Control rods inserted');
}

// --- EVENT HANDLING ---
function handleCoreInput(payload: any) {
  if (payload.action === 'scram') {
    scram();
  }
}

eventBus.subscribe((event) => {
  if (event.type === 'control_input' && event.payload?.target === 'coreSystem') {
    handleCoreInput(event.payload);
  }

  if (event.type === 'button_press') {
    const match = event.payload?.id?.match(/^panel_btn_grid_(\d+)$/);
    if (match) {
      const index = parseInt(match[1]);
      const x = index % GRID_SIZE;
      const y = Math.floor(index / GRID_SIZE);
      const rod = fuelRods[x][y];

      if (!rod.isMoving && rod.position === 1) {
        rod.isMoving = true;
        rod.targetPosition = 0;
        rod.lastMovementStart = Date.now();
      }
    }

    if (event.payload?.id === 'panel_btn_strip_0') {
      regenerateRodMapping();
      console.log('[coreSystem] Rod mapping regenerated');
    }
  }

  if (event.type === 'slider_change') {
    const match = event.payload?.id?.match(/^slider_(\d)$/);
    if (match) {
      const index = parseInt(match[1]);
      const rawValue = parseFloat(event.payload?.value);
      const clamped = Math.max(0, Math.min(1, rawValue));
      controlRodPositions[index] = clamped;
      console.log(`[coreSystem] control rod init position: ${clamped}`)
    }
  }
});

// --- EXPORT ---
function getState() {
  return {
    fuelRods,
    controlRodPositions,
    reactivity,
    getFuelRodUIState,
  };
}

const coreSystem = {
  tick,
  getState,
};

export default coreSystem;
