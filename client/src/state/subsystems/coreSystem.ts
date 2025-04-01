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

      const NORMALIZATION_FACTOR = 1.5; // Further reduce to amplify base reactivity
      baseReactivity /= NORMALIZATION_FACTOR;

      baseReactivityGrid[x][y] = baseReactivity;
    }
  }
}

// Constants for tuning
const NORMALIZATION_FACTOR = 2.5; // Increase to reduce base reactivity
const INTERFERENCE_SCALING_FACTOR = 1.0; // Reduce to make control rods less aggressive
const HEAT_GAIN_SCALING_FACTOR = 10; // Keep unchanged for now
const HEAT_LOSS_SCALING_FACTOR = 0.003; // Increased to enhance cooling
const HEAT_DIFFUSION_COEFFICIENT = 0.1; // Adjust as needed

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

    // Create a copy of the current temperatures to calculate diffusion
    const newTemperatures = fuelRods.map(row => row.map(rod => rod.temperature));

    // Create a flux grid to store heat transfer during this tick
    const fluxGrid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(0)
    );

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const rod = fuelRods[x][y];
        let baseReactivity = baseReactivityGrid[x][y];
        let controlInterference = 0;

        // Adjust base reactivity normalization
        baseReactivity /= NORMALIZATION_FACTOR;

        // Log base reactivity
        console.log(`[coreSystem] Base reactivity at (${x}, ${y}): ${baseReactivity.toFixed(3)}`);

        // Calculate control rod interference
        for (let i = 0; i < ROD_COUNT; i++) {
          const distance = distanceGrid[x][y][i];
          const influence = 1 / (1 + distance); // Influence decreases with distance

          controlInterference += (1 - controlRodPositions[i]) * influence * INTERFERENCE_SCALING_FACTOR;

          // Debug: Log control rod influence
          console.log(`[coreSystem] Control rod ${i} influence at (${x}, ${y}): ${influence.toFixed(3)}, position: ${controlRodPositions[i]}`);
        }
        console.log(`[coreSystem] Total control interference at (${x}, ${y}): ${controlInterference.toFixed(3)}`);

        // Final reactivity is base reactivity minus control interference
        const finalReactivity = Math.max(0, baseReactivity - controlInterference);
        reactivity[x][y] = finalReactivity;

        // Log final reactivity
        console.log(`[coreSystem] Final reactivity at (${x}, ${y}): ${finalReactivity.toFixed(3)}`);

        // Update temperature based on reactivity
        const heatGain = HEAT_GAIN_SCALING_FACTOR * finalReactivity;
        rod.temperature += heatGain;

        // Log heat gain
        console.log(`[coreSystem] Heat gain at (${x}, ${y}): ${heatGain.toFixed(3)}`);

        // Apply heat loss (natural cooling)
        rod.temperature -= HEAT_LOSS_SCALING_FACTOR;

        // Apply heat diffusion
        const neighbors = [
          [x - 1, y], // Top
          [x + 1, y], // Bottom
          [x, y - 1], // Left
          [x, y + 1], // Right
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            const neighborTemp = fuelRods[nx][ny].temperature;
            const heatTransfer = HEAT_DIFFUSION_COEFFICIENT * (rod.temperature - neighborTemp);

            // Only adjust the flux for the current cell
            fluxGrid[x][y] -= heatTransfer; // Lose or gain heat based on the transfer
          }
        }

        // Clamp temperature to [0, 1]
        newTemperatures[x][y] = Math.max(0, Math.min(1, newTemperatures[x][y]));
      }
    }

    // Apply the flux grid to the new temperatures
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        newTemperatures[x][y] += fluxGrid[x][y];
        newTemperatures[x][y] = Math.max(0, Math.min(1, newTemperatures[x][y])); // Clamp again after applying flux
      }
    }

    // Apply the new temperatures to the fuel rods
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        fuelRods[x][y].temperature = newTemperatures[x][y];
      }
    }

    // Calculate averages
    const averageTemperature = totalTemperature / (GRID_SIZE * GRID_SIZE);
    const averageReactivity = totalReactivity / (GRID_SIZE * GRID_SIZE);

    // Output stats
    console.log(`[coreSystem] Tick stats:`);
    console.log(`  Average Temperature: ${averageTemperature.toFixed(3)}`);
    console.log(`  Max Temperature: ${maxTemperature.toFixed(3)}`);
    console.log(`  Min Temperature: ${minTemperature.toFixed(3)}`);
    console.log(`  Average Reactivity: ${averageReactivity.toFixed(3)}`);
    console.log(`  Max Reactivity: ${maxReactivity.toFixed(3)}`);
    console.log(`  Min Reactivity: ${minReactivity.toFixed(3)}`);
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
