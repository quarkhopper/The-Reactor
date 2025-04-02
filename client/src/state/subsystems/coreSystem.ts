import eventBus from '../eventBus';
import stateMachine from '../StateMachine';

const GRID_SIZE = 6;
const ROD_COUNT = 8;

const MOVE_DURATION = 10000; // Time for control rod movement (not currently used)
const BLINK_INTERVAL = 200; // Blink interval for UI (not currently used)

let tickInterval: NodeJS.Timeout | null = null; // Store the interval ID

interface FuelRod {
  temperature: number; // Normalized temperature (0 to 1)
}

const fuelRods: FuelRod[][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => ({
    temperature: 0.02, // Initial temperature normalized to 0.02
  }))
);

let controlRodPositions: number[] = Array(ROD_COUNT).fill(0); // 0 = fully inserted, 1 = fully withdrawn
let controlRodCoords: [number, number][] = []; // Store random positions for control rods
let reactivity: number[][] = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(0)
);

let baseReactivityGrid: number[][] = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(0)
);

let distanceGrid: number[][][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => Array(ROD_COUNT).fill(0))
);

// Variables for tuning (locked values)
const HEAT_GAIN_SCALING_FACTOR = 0.005; // Final value for heat gain
const HEAT_LOSS_SCALING_FACTOR = 0.1; // Final value for heat loss
const INTERFERENCE_SCALING_FACTOR = 2.0; // Final value for control rod interference
const NORMALIZATION_FACTOR = 1.5; // Final value for reactivity normalization

function assignStructuredControlRodPositions() {
  controlRodCoords = [
    // Main diagonal
    [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
    // Anti-diagonal
    [0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0],
  ];

  // Exclude the middle four cells
  controlRodCoords = controlRodCoords.filter(([x, y]) => !(x >= 2 && x <= 3 && y >= 2 && y <= 3));

  // Debug: Log the assigned positions
  controlRodCoords.forEach(([x, y], i) => {
    console.log(`[coreSystem] Control rod ${i} assigned to (${x}, ${y})`);
  });
}

function precalculateDistances() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let i = 0; i < ROD_COUNT; i++) {
        const [rx, ry] = controlRodCoords[i]; // Get the random position of the control rod
        const distance = Math.sqrt((rx - x) ** 2 + (ry - y) ** 2); // Calculate geometric distance
        distanceGrid[x][y][i] = distance;

        // Debug: Log the distance
        console.log(`[coreSystem] Distance from fuel rod (${x},${y}) to control rod ${i} at (${rx},${ry}): ${distance}`);
      }
    }
  }
}

function precalculateBaseReactivities() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      let baseReactivity = 0;

      // Calculate base reactivity from all other fuel rods
      for (let fx = 0; fx < GRID_SIZE; fx++) {
        for (let fy = 0; fy < GRID_SIZE; fy++) {
          if (fx === x && fy === y) continue; // Skip the current fuel rod
          const distance = Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);
          baseReactivity += 1 / (1 + distance); // Reactivity increases with proximity
        }
      }

      baseReactivity /= NORMALIZATION_FACTOR; // Keep this scaling for consistency
      baseReactivityGrid[x][y] = baseReactivity;

      // Debug: Log the base reactivity for each cell
      console.log(`[coreSystem] Base reactivity at (${x}, ${y}): ${baseReactivity.toFixed(3)}`);
    }
  }
}

// Function to start the tick interval
function startTick() {
  if (!tickInterval) {
    console.log('[coreSystem] Starting tick interval...');
    tickInterval = setInterval(() => {
      tick();
    }, 1000); // Adjust interval as needed
  }
}

// Function to stop the tick interval
function stopTick() {
  if (tickInterval) {
    console.log('[coreSystem] Stopping tick interval...');
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// Main tick function
function tick() {
  try {
    let totalTemperature = 0;
    let maxTemperature = -Infinity;
    let minTemperature = Infinity;

    let totalReactivity = 0;
    let maxReactivity = -Infinity;
    let minReactivity = Infinity;

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const rod = fuelRods[x][y];
        let baseReactivity = baseReactivityGrid[x][y];
        let controlInterference = 0;

        // Calculate control rod interference
        for (let i = 0; i < ROD_COUNT; i++) {
          const distance = distanceGrid[x][y][i];
          const influence = 1 / (1 + distance); // Influence decreases with distance

          controlInterference += (1 - controlRodPositions[i]) * influence * INTERFERENCE_SCALING_FACTOR;
        }

        // Final reactivity is base reactivity minus control interference
        const finalReactivity = Math.max(0, baseReactivity - controlInterference);
        reactivity[x][y] = finalReactivity;

        // Update temperature based on reactivity
        const heatGain = HEAT_GAIN_SCALING_FACTOR * finalReactivity;
        rod.temperature += heatGain;

        // Apply proportional heat loss (natural cooling)
        rod.temperature -= HEAT_LOSS_SCALING_FACTOR * rod.temperature;

        // Clamp temperature to [0, 1]
        rod.temperature = Math.max(0, Math.min(1, rod.temperature));

        // Emit temperature for this coordinate
        eventBus.publish({
          type: 'core_tick_temperature',
          source: 'coreSystem',
          payload: { x, y, temperature: rod.temperature },
        });

        // Update stats
        totalTemperature += rod.temperature;
        maxTemperature = Math.max(maxTemperature, rod.temperature);
        minTemperature = Math.min(minTemperature, rod.temperature);

        totalReactivity += finalReactivity;
        maxReactivity = Math.max(maxReactivity, finalReactivity);
        minReactivity = Math.min(minReactivity, finalReactivity);
      }
    }
  } catch (error) {
    console.error('[coreSystem] Error in tick:', error);
  }
}

// Subscribe to state changes
stateMachine.subscribeToAppState((newState) => {
  if (newState === 'on') {
    assignStructuredControlRodPositions(); // Use structured positions
    precalculateDistances(); // Precompute distances after assigning positions
    precalculateBaseReactivities();
    startTick();
  } else {
    stopTick();
  }
});

console.log('[coreSystem] Module initialized');

export default {
  tick,
  startTick,
  stopTick,
};
