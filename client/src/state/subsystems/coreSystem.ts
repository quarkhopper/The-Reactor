import eventBus from '../eventBus';

const GRID_SIZE = 6;
const ROD_COUNT = 8;

const MOVE_DURATION = 10000;
const BLINK_INTERVAL = 200;

interface FuelRod {
  position: number; // 0 = out, 1 = in
  targetPosition: number;
  isMoving: boolean;
  lastMovementStart: number | null;
  temperature: number;
  lastBlinkTime: number;
  isBlinkOn: boolean;
  lastEmittedColor: string | null; // no longer used
}

const fuelRods: FuelRod[][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => ({
    position: 1,
    targetPosition: 1,
    isMoving: false,
    lastMovementStart: null,
    temperature: 20,
    lastBlinkTime: 0,
    isBlinkOn: false,
    lastEmittedColor: null, // no longer used
  }))
);

let controlRodPositions: number[] = Array(ROD_COUNT).fill(1); // 0 = full in, 1 = out
let reactivity: number[][] = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(0)
);

let rodToCoords: [number, number][][] = Array.from({ length: ROD_COUNT }, () => []);
let coordToRodMap: Map<string, number[]> = new Map();

function regenerateRodMapping() {
  rodToCoords = Array.from({ length: ROD_COUNT }, () => []);
  coordToRodMap = new Map();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const controllingRods: number[] = [];
      const groupSize = Math.floor((GRID_SIZE * GRID_SIZE) / ROD_COUNT);
      const rodIndex = Math.floor((x * GRID_SIZE + y) / groupSize);
      controllingRods.push(rodIndex % ROD_COUNT);

      rodToCoords[rodIndex % ROD_COUNT].push([x, y]);
      coordToRodMap.set(`${x},${y}`, controllingRods);
    }
  }
}

function tick() {
  const now = Date.now();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rod = fuelRods[x][y];

      // Reactivity from control rods
      const key = `${x},${y}`;
      const controllingRods = coordToRodMap.get(key) || [];
      const controlInfluence = controllingRods.reduce(
        (sum, rodIndex) => sum + controlRodPositions[rodIndex],
        0
      );
      const avgInfluence =
        controllingRods.length > 0 ? controlInfluence / controllingRods.length : 1;

      reactivity[x][y] = avgInfluence;

      // Handle movement
      if (rod.isMoving && rod.lastMovementStart !== null) {
        const elapsed = now - rod.lastMovementStart;
        if (elapsed >= MOVE_DURATION) {
          rod.position = rod.targetPosition;
          rod.isMoving = false;
          rod.lastMovementStart = null;
        } else {
          // Blink logic
          if (now - rod.lastBlinkTime > BLINK_INTERVAL) {
            rod.isBlinkOn = !rod.isBlinkOn;
            rod.lastBlinkTime = now;
          }
        }
      }

      // Update temperature
      if (rod.position === 0) {
        // Fuel rod out, heats up depending on control rod suppression
        const heatGain = 10 * (1 - avgInfluence);
        rod.temperature += heatGain;
      } else {
        // Fuel rod in, cools
        rod.temperature -= 5;
      }

      // Clamp
      rod.temperature = Math.max(0, Math.min(1000, rod.temperature));

      // ✅ NEW: Emit temperature for this coordinate
      eventBus.publish({
        type: 'core_tick_temperature',
        source: 'coreSystem',
        payload: { x, y, temperature: rod.temperature },
      });
    }
  }
}

function scram() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rod = fuelRods[x][y];
      rod.position = 0;
      rod.targetPosition = 0;
      rod.isMoving = false;
      rod.lastMovementStart = null;
    }
  }
}

function initiateMovement(x: number, y: number) {
  const rod = fuelRods[x][y];
  if (rod.isMoving) return;
  rod.isMoving = true;
  rod.targetPosition = rod.position === 0 ? 1 : 0;
  rod.lastMovementStart = Date.now();
}

function getFuelRod(x: number, y: number): FuelRod {
  return fuelRods[x][y];
}

function setControlRod(index: number, value: number) {
  if (index >= 0 && index < ROD_COUNT) {
    controlRodPositions[index] = value;
  }
}

function getControlRod(index: number): number {
  return controlRodPositions[index];
}

export default {
  tick,
  scram,
  initiateMovement,
  getFuelRod,
  setControlRod,
  getControlRod,
  regenerateRodMapping,
};
