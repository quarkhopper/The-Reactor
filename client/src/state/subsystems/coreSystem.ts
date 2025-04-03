import stateMachine from '../StateMachine';
import { useState, useEffect } from 'react';
import type { Command } from '../types';

const GRID_SIZE = 6;
const ROD_COUNT = 8;

const MOVE_DURATION = 10000; // Time for control rod movement (not currently used)
const BLINK_INTERVAL = 200; // Blink interval for UI (not currently used)

let tickInterval: NodeJS.Timeout | null = null; // Store the interval ID
let tickCounter = 0; // Track number of ticks

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
const HEAT_GAIN_SCALING_FACTOR = 0.018; // Keep increased value for critical temperatures
const HEAT_LOSS_SCALING_FACTOR = 0.1; // Keep original for stability
const INTERFERENCE_SCALING_FACTOR = 3.5; // Increased to better suppress reactivity
const NORMALIZATION_FACTOR = 1.3; // Keep current value

function assignStructuredControlRodPositions() {
  controlRodCoords = [
    // Main diagonal
    [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
    // Anti-diagonal
    [0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0],
  ];

  // Exclude the middle four cells
  controlRodCoords = controlRodCoords.filter(([x, y]) => !(x >= 2 && x <= 3 && y >= 2 && y <= 3));
}

function precalculateDistances() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let i = 0; i < ROD_COUNT; i++) {
        const [rx, ry] = controlRodCoords[i];
        const distance = Math.sqrt((rx - x) ** 2 + (ry - y) ** 2);
        distanceGrid[x][y][i] = distance;
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
          if (fx === x && fy === y) continue;
          const distance = Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);
          baseReactivity += 1 / (1 + distance);
        }
      }

      baseReactivity /= NORMALIZATION_FACTOR;
      baseReactivityGrid[x][y] = baseReactivity;
    }
  }
}

// Function to start the tick interval
function startTick() {
  if (!tickInterval) {
    tickInterval = setInterval(() => {
      tick();
    }, 1000);
  }
}

// Function to stop the tick interval
function stopTick() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// Main tick function
function tick() {
  try {
    tickCounter++;

    let totalTemp = 0;
    let minTemp = Infinity;
    let maxTemp = -Infinity;

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const rod = fuelRods[x][y];
        let baseReactivity = baseReactivityGrid[x][y];
        let controlInterference = 0;

        // Calculate control rod interference
        for (let i = 0; i < ROD_COUNT; i++) {
          const distance = distanceGrid[x][y][i];
          const influence = 1 / (1 + distance);
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

        // Track min/max/total temperature
        totalTemp += rod.temperature;
        minTemp = Math.min(minTemp, rod.temperature);
        maxTemp = Math.max(maxTemp, rod.temperature);

        // Emit temperature update command
        stateMachine.emit({
          type: 'temperature_update',
          id: `fuel_rod_button_${x}_${y}`,
          value: rod.temperature * 300 // Scale to 0-300°C range
        });
      }
    }

    // Calculate and log average temperature
    const avgTemp = totalTemp / (GRID_SIZE * GRID_SIZE);
    console.log(`[coreSystem] Tick ${tickCounter}: Avg Temp: ${avgTemp.toFixed(3)}, Min: ${minTemp.toFixed(3)}, Max: ${maxTemp.toFixed(3)}`);

  } catch (error) {
    console.error('[coreSystem] Error in tick:', error);
  }
}

// Store unsubscribe function
let stateUnsubscribe: (() => void) | null = null;

// Initialize subscriptions
function initSubscriptions() {
  // Subscribe to state changes
  stateUnsubscribe = stateMachine.subscribeToAppState((newState) => {
    if (newState === 'on') {
      // Initialize the core system's internal state
      assignStructuredControlRodPositions(); // Use structured positions
      precalculateDistances(); // Precompute distances after assigning positions
      precalculateBaseReactivities();
      startTick();
    } else if (newState === 'off' || newState === 'shutdown') {
      stopTick();
    }
  });

  // Subscribe to control rod position commands
  stateMachine.subscribe((cmd: Command) => {
    if (cmd.type === 'rod_position_update') {
      // Handle control rod position updates (format: control_rod_X)
      if (cmd.id.startsWith('control_rod_')) {
        const rodIndex = parseInt(cmd.id.split('_')[2], 10);
        if (!isNaN(rodIndex) && rodIndex >= 0 && rodIndex < controlRodPositions.length) {
          controlRodPositions[rodIndex] = cmd.value;
        }
      }
    }
  });
}

// Cleanup function
function cleanup() {
  stopTick();
  if (stateUnsubscribe) {
    stateUnsubscribe();
    stateUnsubscribe = null;
  }
}

// React hook for components to use
export function useCoreSystem() {
  const [state, setState] = useState({
    controlRodCoords,
    controlRodPositions,
    reactivity,
    fuelRods
  });

  useEffect(() => {
    // Initialize subscriptions if not already done
    if (!stateUnsubscribe) {
      initSubscriptions();
    }

    // Subscribe to state updates
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'rod_position_update') {
        // Update local state when rod positions change
        setState(prev => ({
          ...prev,
          controlRodPositions: [...prev.controlRodPositions]
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// Initialize the system
initSubscriptions();

// Export the core system as a subsystem
const coreSystem = {
  tick,
  getState: () => ({
    controlRodCoords,
    controlRodPositions,
    reactivity,
    fuelRods
  })
};

export default coreSystem;
