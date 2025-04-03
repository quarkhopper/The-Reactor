# State Machine Design

This document outlines the design and implementation of the Reactor's state machine system.

## Overview

The state machine is the central nervous system of the Reactor application. It manages the application's state transitions, coordinates component behavior, and ensures proper system initialization and shutdown sequences.

## Core Components

### 1. State Machine (`StateMachine.ts`)

The central state machine implementation that:
- Maintains the current application state
- Handles state transitions
- Manages event emission and subscription
- Coordinates component communication

### 2. State Transition Manager (`stateTransitionManager.ts`)

Manages the flow of state transitions:
- Defines valid state transitions
- Handles transition timing
- Executes state-specific handlers
- Ensures proper sequencing

### 3. Registry (`registry.ts`)

Manages component initialization:
- Tracks component readiness
- Coordinates initialization sequence
- Ensures all components are ready before state transitions

### 4. Subsystems

Various subsystems that respond to state changes:
- `coolSystem.ts`: Manages cooling loop efficiency
- `loadSystem.ts`: Handles load bank states
- `ctrlSystem.ts`: Manages control rod limits

## States

The application has six primary states:

1. **off**: Initial state, system is powered down
2. **init**: System initialization, components register
3. **test**: Component testing sequence
4. **startup**: System startup sequence
5. **on**: Normal operation
6. **shutdown**: System shutdown sequence

## State Transitions

The state machine follows a strict transition sequence:

```off → init → test → startup → on → shutdown → off
```

Each transition has:
- A defined delay (in milliseconds)
- A specific handler for state-specific behavior
- Validation to ensure transitions are valid

## Event System

The state machine uses an event-based communication system:

### Event Types

1. **state_change**: Indicates a state transition
2. **test_sequence**: Triggers component testing
3. **test_result**: Reports test completion
4. **command**: General component commands

### Event Flow

1. Components subscribe to state machine events
2. State changes trigger event emission
3. Components respond to relevant events
4. Test sequences coordinate component behavior

## Component Integration

Components interact with the state machine through:

1. **State Subscription**: Components subscribe to state changes
2. **Test Sequence**: Components implement test sequences
3. **Initialization**: Components register during initialization
4. **Event Emission**: Components emit events to the state machine

## Best Practices

1. **State Management**:
   - Components should manage their own state
   - State changes should be handled through the state machine
   - Avoid direct state manipulation

2. **Event Handling**:
   - Subscribe to relevant events only
   - Clean up subscriptions when components unmount
   - Use appropriate event types for communication

3. **Testing**:
   - Implement comprehensive test sequences
   - Report test results accurately
   - Handle test mode appropriately

4. **Initialization**:
   - Register components during initialization
   - Wait for proper state before acting
   - Handle initialization failures gracefully

## Example Usage

```typescript
// Component state management
useEffect(() => {
  const handleStateChange = (state: AppState) => {
    if (state === 'init') {
      // Handle initialization
      registry.acknowledge(id);
    }
  };
  
  const unsubscribe = stateMachine.subscribe((cmd: Command) => {
    if (cmd.type === 'state_change') {
      handleStateChange(cmd.state);
    }
  });
  
  return () => unsubscribe();
}, [id]);
```

## Future Considerations

1. **State Visualization**: Add tools to visualize state transitions
2. **Error Handling**: Enhance error recovery mechanisms
3. **Performance**: Optimize event handling for large component sets
4. **Testing**: Add more comprehensive state machine tests

## Core Geometry and Reactivity

### Critical Principle: Core Geometry Determines Reactivity

The base reactivity of the reactor core is fundamentally determined by its geometry - specifically, the distances between fuel rods. This is a critical principle that affects both the simulation and the real-world behavior of nuclear reactors:

1. **Physical Reality**:
   - When a fuel rod is withdrawn, it is physically removed from the reactor
   - The distances between remaining rods change
   - The overall neutron flux pattern changes
   - The core's geometry is fundamentally altered

2. **Simulation Implications**:
   - Base reactivity MUST be recalculated when rod states change
   - This is not just a UI concern - it's a fundamental change to the reactor's geometry
   - The control rods then suppress this base reactivity based on their positions
   - The base reactivity itself is determined by which rods are present in the core

3. **Implementation Requirements**:
   - The `precalculateBaseReactivities` function must consider only engaged rods
   - Base reactivity must be recalculated whenever a rod's state changes
   - Control rod interference calculations work on top of this base reactivity
   - Temperature calculations use the resulting reactivity

This principle is critical to maintaining an accurate simulation of reactor behavior. The geometry of the core is not static - it changes as rods are inserted or withdrawn, and these changes must be reflected in the reactivity calculations. 