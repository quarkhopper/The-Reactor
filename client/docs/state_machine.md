# State Machine Architecture

## Overview
The state machine is the central nervous system of the Reactor application. It manages state transitions, coordinates component behavior, and ensures proper initialization and shutdown sequences.

## Core Principles
1. **State Transitions**:
   - States: off -> init -> test -> startup -> on -> shutdown -> off
   - Special state: scram (emergency state, can recover to on or shutdown)
   - Transitions are validated against a predefined map.
   - Power button enables off->init and on->shutdown transitions.
   - SCRAM button triggers immediate transition to scram state.

2. **State Transition Delays**:
   - Startup: 2000ms delay before transitioning to on state.
   - Other transitions: immediate (0ms delay).

3. **Process Completion**:
   - init -> test -> startup -> on -> shutdown -> off.
   - Each process completion is tracked by respective managers.

4. **Initialization Hierarchy**:
   - Managers initialized in order: InitManager -> TestManager -> StartupManager -> ShutdownManager.

## States and Transitions
### State Definitions
1. **Off State**: All components inactive.
2. **Init State**: Components initializing.
3. **Test State**: Components in test mode.
4. **Startup State**: Preparing for operation.
5. **On State**: Normal operation.
6. **Shutdown State**: System shutting down.
7. **Scram State**: Emergency shutdown.

### State Transition Map
```typescript
const STATE_TRANSITIONS = {
  'off': ['init'],
  'init': ['test', 'fault'],
  'test': ['startup', 'fault'],
  'fault': ['shutdown', 'off'],
  'startup': ['on', 'fault'],
  'on': ['shutdown', 'scram', 'fault'],
  'shutdown': ['off', 'fault'],
  'scram': ['on', 'shutdown', 'fault']
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
   {
     type: 'process_begin',
     id: string,
     process: 'init' | 'test' | 'shutdown'
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

## Debugging Tips
1. **State Transition Issues**:
   - Check transition map.
   - Verify command flow.
   - Monitor state changes.
   - Check manager coordination.

2. **Process Issues**:
   - Track process state.
   - Monitor acknowledgments.
   - Check completion handling.
   - Verify manager coordination.

3. **Component Issues**:
   - Check component state.
   - Verify command handling.
   - Monitor acknowledgments.
   - Check state updates.

## Future Considerations
1. **State Visualization**: Add tools to visualize state transitions.
2. **Error Handling**: Enhance error recovery mechanisms.
3. **Performance**: Optimize event handling for large component sets.
4. **Testing**: Add more comprehensive state machine tests.

## Two-Pass Pattern and Hierarchical Initialization
The two-pass pattern is a fundamental design principle in this codebase that separates object construction from initialization to avoid circular dependencies and ensure proper initialization order.

### Core Principles
1. **First Pass: Construction Only**
   - Objects are constructed without accessing dependencies.
   - No initialization logic in constructors.
   - No accessing other objects' methods or properties.

2. **Second Pass: Hierarchical Initialization**
   - Initialization happens in a specific order from parent to child.
   - Parent components initialize their children, not the other way around.
   - Children NEVER call their own init() method directly.
   - Children NEVER initialize their parents.

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