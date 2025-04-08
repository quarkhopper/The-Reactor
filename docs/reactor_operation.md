# Reactor Operation Principles

## Core Components

### Fuel Rods
- **Purpose**: Contain the nuclear fuel and are the primary source of heat generation
- **Control**: Each fuel rod has a button that can be toggled to activate/deactivate it
- **Behavior**: When active, fuel rods generate heat based on their reactivity
- **Identification**: Referenced as `fuel_rod_button_X_Y` where X,Y are grid coordinates

### Control Rods
- **Purpose**: Regulate the reactor's power output by absorbing neutrons
- **Control**: Each control rod has a slider that controls its insertion depth
- **Behavior**: 
  - When fully inserted (value = 0): Maximum neutron absorption, minimum reactivity
  - When fully withdrawn (value = 1): Minimum neutron absorption, maximum reactivity
- **Identification**: Referenced as `control_rod_X` where X is the rod index

### Coolant System
- **Purpose**: Remove heat from the reactor core and maintain safe operating temperatures
- **Control**: Primary pump speed controlled via slider (0-1 range)
- **Properties**:
  - Temperature: Affected by core temperature and heat transfer
  - Pressure: Influenced by temperature (60%), pump speed (40%), and system dynamics
  - Flow Rate: Directly controlled by pump speed
- **Identification**: 
  - Pump control: `cooling_0` for primary loop
  - Temperature meter: `pump_temp_meter_primary`
  - Pressure meter: `pump_pres_meter_primary`

## Operational Principles

### 1. Heat Generation
- Active fuel rods generate heat based on their position in the grid
- Base reactivity is determined by the fuel rod's position
- Control rod interference reduces the effective reactivity

### 2. Temperature Control
- Primary control through control rod positions
- Active cooling through the coolant system:
  - Heat transfer rate depends on temperature difference
  - Cooling effectiveness scales with pump speed
  - Higher flow rates provide more cooling
- Natural heat loss occurs proportionally to current temperature

### 3. Safety Considerations
- Control rods are the primary safety mechanism
- Coolant system provides secondary safety through heat removal
- SCRAM response:
  - All control rods fully insert
  - Coolant pump automatically set to 100% speed
  - Maximum cooling effect applied

## Core Geometry and Reactivity

### Critical Principle: Core Geometry Determines Reactivity

The base reactivity of the reactor core is fundamentally determined by its geometry - specifically, the distances between fuel rods. This is a critical principle that affects both the simulation and the real-world behavior of nuclear reactors:

1. **Physical Reality**:
   - Fuel rods remain in place during normal operation and SCRAM
   - Control rods modify neutron flux by insertion/withdrawal
   - The coolant system affects temperature but not reactivity directly

2. **Simulation Implications**:
   - Base reactivity depends on engaged fuel rod configuration
   - Control rods suppress this base reactivity based on their positions
   - Coolant system provides active temperature management

3. **Implementation Requirements**:
   - The `precalculateBaseReactivities` function considers engaged rods
   - Control rod interference calculations work on top of base reactivity
   - Temperature calculations include both heat generation and cooling effects

## Interface Guidelines

### 1. Control Interface
- Use buttons for fuel rod control (binary on/off)
- Use sliders for control rod control (continuous 0-1 range)
- Maintain clear visual distinction between control types
- Provide clear feedback for control actions

### 2. Display Interface
- Show current temperature prominently
- Display control rod positions clearly
- Indicate fuel rod states visually
- Provide clear feedback for all actions

### 3. Safety Interface
- Make emergency controls easily accessible
- Provide clear visual warnings
- Show critical information prominently
- Maintain clear status indicators

## Operational States

### 1. Startup State
- System initializing
- Components powering up
- Initial checks running
- Safety systems verifying
- Coolant pump set to 50% speed

### 2. Normal Operation
- All systems active
- Temperature controlled through:
  - Control rod positions
  - Coolant flow rate
  - Natural cooling
- Reactivity balanced
- Safety systems monitoring

### 3. Shutdown State
- System shutting down
- Components powering down
- Safety systems active
- Final checks running

### 4. Emergency State (SCRAM)
- Control rods fully inserted
- Coolant pump at 100% speed
- Maximum cooling effect
- Safety systems monitoring
- Recovery procedures ready

## Key Distinctions

1. **Function**:
   - Fuel rods are the heat source
   - Control rods are the regulation mechanism

2. **Control Interface**:
   - Fuel rods: Binary on/off control via buttons
   - Control rods: Continuous control via sliders (0-1 range)

3. **Impact on Reactivity**:
   - Fuel rods: Directly contribute to heat generation when active
   - Control rods: Modulate the overall reactivity by absorbing neutrons

## Shutdown Behavior

### Component Shutdown
1. **Visual State**:
   - Components return to their initial visual state
   - All animations and active processes stop
   - Displays clear and return to default values
   - Interactive elements become inactive

2. **State Reset**:
   - Components reset their internal state
   - All values return to initial conditions
   - Active processes are terminated
   - Registry tracks component shutdown status

3. **Acknowledgment**:
   - Components emit process_complete command
   - ShutdownManager tracks acknowledgments
   - System waits for all components to complete
   - State machine transitions to off state

### Shutdown Sequence
1. **Trigger**:
   - Power button pressed while system is on
   - State machine transitions to shutdown state
   - ShutdownManager begins tracking components

2. **Component Response**:
   - Components receive shutdown command
   - Each component resets to initial state
   - Components emit process_complete command
   - ShutdownManager tracks acknowledgments

3. **Registry Tracking**:
   - Registry tracks component acknowledgments
   - ShutdownManager maintains list of completed components
   - System waits for all components to acknowledge
   - Process continues until all components complete

4. **Shutdown Completion**:
   - ShutdownManager emits process_complete command
   - State machine transitions to off state
   - All components receive state change to off
   - System returns to initial state

### Connection to Operational Principles
The shutdown sequence follows the same principles as normal operation:
1. **Safety First**: Components return to safe state during shutdown
2. **Coordinated Response**: All components respond to shutdown command
3. **State Tracking**: Registry tracks component state during shutdown
4. **Visual Feedback**: Components provide visual feedback during shutdown 