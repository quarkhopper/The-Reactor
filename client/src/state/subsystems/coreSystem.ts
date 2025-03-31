import eventBus from '../eventBus';

const GRID_SIZE = 6;
const ROD_COUNT = 8;
const MOVE_DURATION = 10000;
const BLINK_INTERVAL = 200;

// Temperature thresholds (°C)
const TEMP_THRESHOLDS = {
  green: 100,
  amber: 300,
  red: 600,
  white: 900,
};

// Fuel rod state
interface FuelRod {
  position: number; // 0 = out, 1 = fully inserted
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

// Control rod positions
let controlRodLimits: number[] = Array(ROD_COUNT).fill(1);

// --- TICK LOGIC ---
function tick() {
  const now = Date.now();

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rod = fuelRods[x][y];

      // Handle rod movement
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

      // Heat logic (very simple for now)
      if (rod.position > 0) {
        rod.temperature += 2; // build heat
      } else {
        rod.temperature = Math.max(0, rod.temperature - 5); // cool down
      }
    }
  }
}

// --- BUTTON DISPLAY ---
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
  controlRodLimits = controlRodLimits.map(() => 0);
  // Fuel rods are unaffected in behavior, but their temps will drop
  console.log('[coreSystem] SCRAM triggered: control rods fully inserted.');
}

// --- EVENT HANDLERS ---
function handleCoreInput(payload: any) {
  if (payload.action === 'set_control_rod_limit') {
    const { rodIndex, limit } = payload;
    if (rodIndex >= 0 && rodIndex < controlRodLimits.length) {
      controlRodLimits[rodIndex] = limit;
    }
  }

  if (payload.action === 'scram') {
    scram();
  }
}

// --- USER BUTTON INTERACTION ---
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
  }
});

// --- EXPORT ---
function getState() {
  return {
    fuelRods,
    controlRodLimits,
    getFuelRodUIState,
  };
}

const coreSystem = {
  tick,
  getState,
};

export default coreSystem;
