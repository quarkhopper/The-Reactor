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

## Operational Principles

1. **Heat Generation**:
   - Active fuel rods generate heat based on their position in the grid
   - Base reactivity is determined by the fuel rod's position
   - Control rod interference reduces the effective reactivity

2. **Temperature Control**:
   - Control rods are the primary means of temperature regulation
   - Natural heat loss occurs proportionally to current temperature
   - Cooling systems provide additional temperature management

3. **Safety Considerations**:
   - Control rods must be properly positioned to maintain safe operation
   - Fuel rod activation should be coordinated with control rod positions
   - Temperature monitoring is critical for safe operation

## Interface Guidelines

When implementing or modifying the reactor interface:
1. Always maintain clear distinction between fuel rod and control rod controls
2. Use appropriate control types (buttons for fuel rods, sliders for control rods)
3. Ensure proper ID formatting for each component type
4. Maintain consistent value ranges (0-1 for control rods, binary for fuel rods) 