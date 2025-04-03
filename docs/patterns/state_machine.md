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

## State Transitions with Visual Feedback

When implementing state transitions that require visual feedback (like animations or blinking), follow these principles:

1. **State Tracking**
   - Track both current and previous states
   - Use a dedicated transition state for the duration of the animation
   - Store transition start time for timing-based state changes

2. **Event Flow**
   - Emit state change events at both the start and end of transitions
   - Components should subscribe to these events to update their visual state
   - Core systems should only update their state after transitions complete

3. **Example: Fuel Rod State Machine**
   ```typescript
   // State definition
   type FuelRodState = 'engaged' | 'withdrawn' | 'transitioning';
   
   // Starting a transition
   rod.previousState = rod.state;
   rod.state = 'transitioning';
   rod.transitionStartTime = Date.now();
   emitStateChange('transitioning');
   
   // Completing a transition
   if (transitionComplete) {
     rod.state = rod.previousState === 'engaged' ? 'withdrawn' : 'engaged';
     delete rod.transitionStartTime;
     delete rod.previousState;
     emitStateChange(rod.state);
   }
   ```

4. **Visual Feedback**
   - Use the transition state to trigger visual effects (e.g., blinking)
   - Components should maintain their own state for visual effects
   - Visual effects should be independent of core system state

5. **Core System Updates**
   - Only update core calculations after transitions complete
   - Recalculate dependent values (e.g., distances, reactivity) after state changes
   - Maintain consistency between visual and core states

This pattern ensures smooth transitions while maintaining system integrity and providing clear visual feedback to users.

## Event System

The state machine uses an event-based communication system with a clear separation between process management and state transitions:

### Event Types

1. **state_change**: Indicates a state transition
2. **test_sequence**: Triggers component testing
3. **test_result**: Reports test completion
4. **command**: General component commands
5. **process_complete**: Signals completion of a specific process (e.g., 'init_complete')

### Process Management

1. **Process Managers**:
   - Handle specific system processes (e.g., initialization, testing)
   - Subscribe to relevant state changes
   - Coordinate their specific process
   - Emit completion messages when done

2. **State Transition Manager**:
   - Central coordinator for state transitions
   - Subscribes to process completion messages
   - Determines next state based on current state and completion messages
   - Maintains state transition rules

### Event Flow Example

```
Power Button Press
-> State Machine -> 'init' state
-> initManager (subscribes to state changes)
   -> Runs initialization process
   -> Emits 'init_complete' when done
-> stateTransitionManager (subscribes to 'init_complete')
   -> Transitions to 'test' state
-> testManager (subscribes to state changes)
   -> Runs test sequence
   -> Emits 'test_complete' when done
-> stateTransitionManager (subscribes to 'test_complete')
   -> Transitions to 'startup' state
```

This pattern ensures:
- Clear separation of concerns
- Centralized state transition control
- Independent process management
- Predictable system behavior

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

## Planned Subsystem Implementations

### Load Subsystem
- Interfaces with cooling system through heat exchanger
- Manages turbine power generation vs demand
- Digital displays along top show demand (driven by noisy functions)
- Central gauge shows turbine RPM
- Bottom switches control turbine and related systems

### Cooling Subsystem
- Controlled by upper right array of knobs
- Controls hidden valves
- Integrates with heat exchanger
- Affects core temperature and power generation

### Control Rod System
- Aux buttons configure control rod positions
- One button randomizes control rod positions
- Bottom right meters and indicator lights provide feedback
- Shows control system's balancing attempts

### Integration Points
1. Cooling → Load
   - Heat exchanger transfers heat
   - Affects turbine efficiency
   - Impacts power generation

2. Control → Core
   - Rod positions affect reactivity
   - Different configurations for different scenarios
   - Feedback through indicator lights

3. Load → Core
   - Power demand affects core operation
   - Turbine status affects cooling
   - System balancing feedback

This architecture allows for complex interactions while maintaining clear separation of concerns. 