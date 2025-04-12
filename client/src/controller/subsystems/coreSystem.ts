import MessageBus from '../../MessageBus';

const GRID_SIZE = 6;
const ROD_COUNT = 8;

// Add a debounce timer for recalculations
let recalculationTimer: NodeJS.Timeout | null = null;
const RECALCULATION_DELAY = 1000; // 1 second delay

interface FuelRod {
  temperature: number; // Normalized temperature (0 to 1)
  state: 'engaged' | 'withdrawn' | 'transitioning';
  transitionStartTime?: number; // Optional transition start time
  previousState?: 'engaged' | 'withdrawn'; // Optional previous state
}

const fuelRods: FuelRod[][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => ({
    temperature: 0.02, // Initial temperature normalized to 0.02
    state: 'engaged' // All rods start engaged
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

// Add a new grid for fuel rod distances
let fuelRodDistanceGrid: number[][][] = Array.from({ length: GRID_SIZE }, () =>
  Array.from({ length: GRID_SIZE }, () => 
    Array.from({ length: GRID_SIZE * GRID_SIZE }, () => 0)
  )
);

// Variables for tuning (locked values)
const HEAT_GAIN_SCALING_FACTOR = 0.018; // Keep increased value for critical temperatures
const HEAT_LOSS_SCALING_FACTOR = 0.1; // Keep original for stability
const INTERFERENCE_SCALING_FACTOR = 3.5; // Increased to better suppress reactivity
const NORMALIZATION_FACTOR = 1.3; // Keep current value

// Add coolant-related constants
const COOLANT_COOLING_FACTOR = 0.03; 

// Add coolant state
let coolantState = {
  temperature: 0,
  flowRate: 0.5 // Default to 50% flow
};

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
  // Calculate distances between fuel rods and control rods ONLY
  // This is used for control rod interference calculations
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

// New function for fuel rod distance calculations
function precalculateFuelRodDistances() {
  // Calculate distances between each fuel rod position and every other fuel rod
  // IMPORTANT: This is where withdrawn fuel rods are handled
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      // Calculate distance to every other fuel rod position
      let idx = 0;
      for (let fx = 0; fx < GRID_SIZE; fx++) {
        for (let fy = 0; fy < GRID_SIZE; fy++) {
          if (fx === x && fy === y) {
            // Distance to self is infinite (no self-contribution)
            fuelRodDistanceGrid[x][y][idx] = 1000000;
          } else {
            // CRITICAL: If the rod is withdrawn, set distance to effectively infinity
            // This completely removes its contribution to the reactivity calculation
            fuelRodDistanceGrid[x][y][idx] = fuelRods[fx][fy].state === 'withdrawn'
              ? 1000000  // Effectively infinite distance
              : Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);
          }
          idx++;
        }
      }
    }
  }
}

function precalculateBaseReactivities() {
  // First calculate distances between fuel rods (this is where withdrawn rods are handled)
  precalculateFuelRodDistances();
  
  // Then calculate base reactivity using those distances
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      let baseReactivity = 0;

      // Calculate base reactivity from all other fuel rods using pre-calculated distances
      let idx = 0;
      for (let fx = 0; fx < GRID_SIZE; fx++) {
        for (let fy = 0; fy < GRID_SIZE; fy++) {
          // Skip self (already handled with infinite distance)
          if (fx === x && fy === y) {
            idx++;
            continue;
          }
          
          const distance = fuelRodDistanceGrid[x][y][idx];
          baseReactivity += 1 / (1 + distance);
          idx++;
        }
      }

      baseReactivity /= NORMALIZATION_FACTOR;
      baseReactivityGrid[x][y] = baseReactivity;
    }
  }
}

// Main tick function
function tick() {
  try {
    let totalTemp = 0;
    let minTemp = 1;
    let maxTemp = 0;

    // Create a 2D array to store temperatures for this tick
    const tempGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

    // Check for completed transitions
    const now = Date.now();
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const rod = fuelRods[x][y];
        if (rod.state === 'transitioning' && rod.transitionStartTime) {
          if (now - rod.transitionStartTime >= 5000) { // 5 seconds
            // Transition complete - toggle between engaged and withdrawn
            const newState = rod.previousState === 'engaged' ? 'withdrawn' : 'engaged';
            rod.state = newState;
            delete rod.transitionStartTime;
            delete rod.previousState;
           
            // Emit state change
            MessageBus.emit({
              type: 'fuel_rod_state_update',
              id: 'system',
              value: newState,
              gridX: x,
              gridY: y
            });

            // Schedule recalculation
            scheduleRecalculation();                      
          }
        }
      }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const rod = fuelRods[x][y];

        // Skip temperature updates for withdrawn rods
        if (rod.state !== 'engaged') {
          continue;
        }

        let baseReactivity = baseReactivityGrid[x][y];

        // Calculate control rod interference
        let controlInterference = 0;
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

        // Apply coolant-based cooling
        const tempDiff = rod.temperature - coolantState.temperature;
        const coolantEffect = COOLANT_COOLING_FACTOR * coolantState.flowRate * tempDiff;
        rod.temperature -= coolantEffect;

        // Clamp temperature to [0, 1]
        rod.temperature = Math.max(0, Math.min(1, rod.temperature));

        // Store temperature in grid
        tempGrid[x][y] = rod.temperature;

        totalTemp += rod.temperature;
        minTemp = Math.min(minTemp, rod.temperature);
        maxTemp = Math.max(maxTemp, rod.temperature);

        // Emit temperature update command
        MessageBus.emit({
          type: 'temperature_update',
          gridX: x,
          gridY: y,
          id: 'system',
          value: rod.temperature
        });
      }
    }

    // Calculate and log average temperature
    const avgTemp = totalTemp / (GRID_SIZE * GRID_SIZE);
    
    // Emit average temperature to update the circular gauge
    MessageBus.emit({
      type: 'core_temp_update',
      value: avgTemp
    });

  } catch (error) {
    console.error('[coreSystem] Error in tick:', error);
  }
}

// Type guard to validate if a message is relevant to coreSystem
function isValidMessage(msg: Record<string, any>): boolean {
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'state_change' ||
     msg.type === 'coolant_temp_update' ||
     msg.type === 'flow_rate_update' ||
     (msg.type === 'slider_position_update' && msg.target === 'rod') ||
     msg.type === 'fuel_rod_state_toggle' )
  );
}

MessageBus.subscribe(handleMessage);

function handleMessage (msg: Record<string, any>) {
  if (!isValidMessage(msg)) return; // Guard clause

  if (msg.type === 'state_change') {
    if (msg.state === 'startup') {
      assignStructuredControlRodPositions();
      precalculateDistances();
      precalculateBaseReactivities();

      console.log('[coreSystem] Transitioning to startup state - re-engaging withdrawn fuel rods');
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          fuelRods[x][y].state = 'engaged';
          MessageBus.emit({
            type: 'fuel_rod_state_update',
            id: `fuel_rod_button_${x}_${y}`,
            value: 'engaged',
            gridX: x,
            gridY: y
          });
        }
      }
    }
    if (msg.state === 'scram') {
      console.log('[coreSystem] SCRAM initiated - inserting control rods');
      for (let i = 0; i < controlRodPositions.length; i++) {
        controlRodPositions[i] = 0;
        MessageBus.emit({
          type: 'control_rod_position_update',
          id: 'system',
          index: i,
          value: 0
        });
      }
    }
  } else if (msg.type === 'coolant_temp_update') {
    coolantState.temperature = msg.value;
  } else if (msg.type === 'flow_rate_update') {
    coolantState.flowRate = msg.value;
  } else if (msg.type === 'slider_position_update') {
    const rodIndex = msg.index;
    if (!isNaN(rodIndex) && rodIndex >= 0 && rodIndex < controlRodPositions.length) {
      controlRodPositions[rodIndex] = msg.value;
    }
  } else if (msg.type === 'fuel_rod_state_toggle') {
    const { gridX: x, gridY: y } = msg;
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      const rod = fuelRods[x][y];
      if (rod.state !== 'transitioning') {
        rod.previousState = rod.state;
        rod.state = 'transitioning';
        rod.transitionStartTime = Date.now();

        MessageBus.emit({
          type: 'fuel_rod_state_update',
          id: 'system',
          value: 'transitioning',
          gridX: msg.gridX,
          gridY: msg.gridY
        });
      }
    }
  } 
}

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

// Debounced function to schedule recalculations
function scheduleRecalculation() {
  // Clear existing timer if there is one
  if (recalculationTimer) {
    clearTimeout(recalculationTimer);
  }
  
  // Set a new timer
  recalculationTimer = setTimeout(() => {
    // Count withdrawn rods for debugging
    let withdrawnCount = 0;
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (fuelRods[x][y].state === 'withdrawn') {
          withdrawnCount++;
        }
      }
    }
    
    precalculateDistances();
    precalculateBaseReactivities();
    recalculationTimer = null;
  }, RECALCULATION_DELAY);
}
