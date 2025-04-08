# State Machine Architecture

## Overview

The state machine is the central nervous system of the Reactor application. It manages the application's state transitions, coordinates component behavior, and ensures proper system initialization and shutdown sequences.

## Core Principles

1. **State Transitions**:
   - States: off -> init -> test -> startup -> on -> shutdown -> off
   - Special state: scram (terminal state)
   - State transitions are validated against a predefined map
   - Power button enables off->init and on->shutdown transitions
   - SCRAM button triggers immediate transition to scram state

2. **State Transition Delays**:
   - startup: 2000ms delay before transitioning to on state
   - Other transitions: immediate (0ms delay)
   - Shutdown process handled by shutdownManager

3. **Process Completion**:
   - init process: Triggers transition to test state
   - test process: Triggers transition to startup state
   - shutdown process: Triggers transition to off state
   - Each process completion is tracked by respective managers

4. **Initialization Hierarchy**:
   - Power manager initialized first
   - Init manager initialized second (cascades to registry)
   - Test manager initialized third
   - Shutdown manager initialized last

## States and Transitions

### State Definitions

1. **Off State**:
   - Initial state
   - All components inactive
   - Only power button active
   - No processes running

2. **Init State**:
   - Components initializing
   - Registry tracking initialization
   - Process_begin commands sent
   - Components acknowledging initialization

3. **Test State**:
   - Components in test mode
   - Test sequences running
   - Results being collected
   - Validation in progress

4. **Startup State**:
   - System preparing for operation
   - Components transitioning to operational state
   - 2-second delay before on state
   - Visual feedback during transition

5. **On State**:
   - Normal operation
   - All components active
   - Processes running
   - Full functionality available

6. **Shutdown State**:
   - System shutting down
   - Components returning to safe state
   - Processes terminating
   - Registry tracking completion

7. **Scram State**:
   - Emergency shutdown state
   - Immediate transition from any state
   - Safety actions:
     - All control rods fully insert
     - Coolant pump speed set to maximum
     - Maximum cooling effect applied
   - Terminal state - requires manual restart

### State Transition Map

```typescript
const STATE_TRANSITIONS = {
  'off': 'init',
  'init': 'test',
  'test': 'startup',
  'startup': 'on',
  'on': 'shutdown',
  'shutdown': 'off',
  'scram': null  // Terminal state
};
```

## Event Handling

### Command Types

1. **State Change Commands**:
   ```typescript
   {
     type: 'state_change',
     id: 'system',
     state: AppState
   }
   ```

2. **Process Commands**:
   ```typescript
   // Process Begin - Sent to individual components
   {
     type: 'process_begin',
     id: string,  // Component ID
     process: 'init' | 'test' | 'shutdown'  // Process type
   }

   // Process Complete - Sent by managers when all components complete
   {
     type: 'process_complete',
     id: string,  // Manager ID ('init', 'test', or 'shutdown')
     process: 'init' | 'test' | 'shutdown'  // Must match the process type
   }
   ```

3. **Test Commands**:
   ```typescript
   {
     type: 'test_result',
     id: string,
     passed: boolean
   }
   ```

4. **Temperature and Cooling Commands**:
   ```typescript
   // Core temperature updates
   {
     type: 'core_temp_update',
     value: number  // Normalized 0-1
   }

   // Coolant temperature updates
   {
     type: 'coolant_temp_update',
     value: number  // Normalized 0-1
   }

   // Flow rate updates
   {
     type: 'flow_rate_update',
     value: number  // Normalized 0-1
   }
   ```

### Command Processing

1. **State Change Processing**:
   - Validate transition against map
   - Update internal state
   - Broadcast to subscribers
   - Handle special cases (startup delay)

2. **Process Command Processing**:
   - Process Begin:
     - Sent by managers to individual components
     - Triggers component-specific initialization/test/shutdown
     - Components must acknowledge completion
   - Process Complete:
     - Sent by managers when all components finish
     - Triggers state transitions:
       - init -> test
       - test -> startup
       - shutdown -> off
     - Must match current state to trigger transition

3. **Test Command Processing**:
   - Record test results
   - Track completion
   - Handle failures
   - Trigger next state

## Manager Integration

### Power Manager
- Tracks power state
- Handles power button events
- Manages power transitions
- Coordinates with other managers

### Init Manager
- Handles initialization
- Coordinates with registry
- Tracks component initialization
- Triggers test state

### Test Manager
- Manages test sequences
- Tracks test results
- Handles test completion
- Triggers startup state

### Shutdown Manager
- Coordinates shutdown
- Tracks component shutdown
- Handles shutdown completion
- Triggers off state

## Debugging Tips

1. **State Transition Issues**:
   - Check transition map
   - Verify command flow
   - Monitor state changes
   - Check manager coordination

2. **Process Issues**:
   - Track process state
   - Monitor acknowledgments
   - Check completion handling
   - Verify manager coordination

3. **Component Issues**:
   - Check component state
   - Verify command handling
   - Monitor acknowledgments
   - Check state updates

## Future Considerations

1. **State Visualization**: Add tools to visualize state transitions
2. **Error Handling**: Enhance error recovery mechanisms
3. **Performance**: Optimize event handling for large component sets
4. **Testing**: Add more comprehensive state machine tests

## Two-Pass Pattern and Hierarchical Initialization

The two-pass pattern is a fundamental design principle in this codebase that separates object construction from initialization to avoid circular dependencies and ensure proper initialization order.

### Core Principles

1. **First Pass: Construction Only**
   - Objects are constructed without accessing dependencies
   - No initialization logic in constructors
   - No accessing other objects' methods or properties

2. **Second Pass: Hierarchical Initialization**
   - Initialization happens in a specific order from parent to child
   - Parent components initialize their children, not the other way around
   - Children NEVER call their own init() method directly
   - Children NEVER initialize their parents

### Initialization Hierarchy

```
StateMachine
  ├── initManager
  │     ├── registry
  │     └── other dependencies
  ├── testManager
  │     └── dependencies
  └── shutdownManager
        └── dependencies
```

### Common Pitfalls to Avoid

❌ **INCORRECT**: A component calling its own init() method
```typescript
// registry.ts
export const registry = new RegistryManager();
registry.init(); // WRONG! Never call your own init() method
```

✅ **CORRECT**: Parent component initializing its children
```typescript
// initManager.ts
export function init() {
  // Initialize children first
  registry.init();
  
  // Then perform own initialization
  // ...
}
```

### Initialization Rules

1. **Never Call Your Own Init**: Components should never call their own init() method. This is the responsibility of their parent.

2. **Parent-Child Relationship**: Initialization flows from parent to child, never the reverse.

3. **Dependency Access**: During initialization, components can safely access their dependencies, but only after both the component and its dependencies have been constructed.

4. **Initialization Order**: Parents must initialize their children before performing their own initialization that depends on those children.

### Example: Correct Initialization Flow

```typescript
// StateMachine.ts
class StateMachine {
  constructor() {
    // First pass: just construct
    this.initManager = new InitManager();
    this.testManager = new TestManager();
    this.shutdownManager = new ShutdownManager();
  }
  
  init() {
    // Second pass: initialize in hierarchical order
    this.initManager.init(); // This will initialize registry and other dependencies
    this.testManager.init();
    this.shutdownManager.init();
  }
}

// initManager.ts
class InitManager {
  constructor() {
    // First pass: just construct
  }
  
  init() {
    // Second pass: initialize children first
    registry.init(); // Initialize registry before using it
    
    // Then perform own initialization
    // ...
  }
}

// registry.ts
class RegistryManager {
  constructor() {
    // First pass: just construct
  }
  
  init() {
    // Second pass: initialize
    // Do NOT call init() on any parent components
    // Do NOT call init() on itself
  }
}
```

By following these rules, we ensure a clean, predictable initialization flow that avoids circular dependencies and initialization order issues. 