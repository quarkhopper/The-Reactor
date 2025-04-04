# Component Pattern Guide

This document outlines the ideal pattern for creating well-encapsulated, functional components in the Reactor application. It's based on our experience refactoring components to follow a self-contained pattern, starting with the `KnobSelector` component and extending to all components.

## Core Principles

1. **Self-Containment**: Components should manage their own state and behavior without external dependencies.
2. **Clear Interface**: Components should have a well-defined interface with props that clearly communicate their purpose.
3. **State Management**: Components should handle their own state transitions and lifecycle events.
4. **Testability**: Components should be easily testable in isolation.
5. **Reusability**: Components should be designed for reuse across the application.
6. **Visual State Management**: Components should manage their own visual state (colors, positions, etc.) internally.
7. **Initialization Timing**: Components should acknowledge initialization only when explicitly requested via a process_begin command.

## Component Structure

### 1. Imports

```typescript
import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';
import './ComponentName.css';
```

### 2. Component Interface

```typescript
interface ComponentNameProps {
  id: string;
  // Other props specific to the component
  initialValue?: Type; // Optional initial value for component state
}
```

### 3. Component Implementation

```typescript
const ComponentName: React.FC<ComponentNameProps> = ({ id, ...props }) => {
  // State management
  const [isTestMode, setIsTestMode] = useState(false);
  const [displayState, setDisplayState] = useState(initialState);

  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
        setDisplayState(normalState);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id, dependencies]);

  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'init') {
        // Reset component state
        setDisplayState(initialState);
        setIsTestMode(false);
        // Acknowledge initialization
        registry.acknowledge(id);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, dependencies]);

  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        
        // Perform test sequence
        // ... test sequence logic ...
        
        // Emit test result when test sequence completes
        stateMachine.emit({
          type: 'test_result',
          id,
          passed: true
        });
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id, dependencies]);

  // Handle user interaction
  const handleInteraction = () => {
    if (!isTestMode) {
      // Handle normal interaction
    }
  };

  // Render
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  );
};
```

## State Management

Each component should manage its own state, including:
- Test mode state
- Visual state (colors, positions, etc.)
- Interaction state (pressed, hovered, etc.)

## Initialization Process

Components should handle initialization through the process_begin command:
1. Listen for process_begin commands with process type 'init'
2. Reset component state when initialization begins
3. Acknowledge initialization to the registry
4. Only respond to state changes for visual updates

## Test Sequence Implementation

Components should implement their own test sequences:
1. Listen for test sequence commands
2. Perform component-specific test sequence
3. Emit test result when complete
4. Reset to normal state

## Best Practices

1. **Keep Components Small**:
   - Each component should have a single responsibility
   - Break down complex components into smaller ones

2. **Use TypeScript**:
   - Define clear interfaces for props and state
   - Use type checking to catch errors early

3. **Document Components**:
   - Add comments for complex logic
   - Document component behavior and usage

4. **Follow React Patterns**:
   - Use hooks for state management
   - Follow React's component lifecycle

5. **Optimize Performance**:
   - Use memoization when necessary
   - Avoid unnecessary re-renders

## Common Pitfalls

1. **Premature Optimization**:
   - Don't optimize before measuring
   - Focus on readability first

2. **Over-Engineering**:
   - Keep it simple
   - Don't add complexity without need

3. **State Management**:
   - Don't lift state unnecessarily
   - Use local state when possible

4. **Component Dependencies**:
   - Avoid tight coupling
   - Use props for communication

5. **Initialization**:
   - Don't acknowledge initialization too early
   - Wait for explicit process_begin command

## Conclusion

Following these patterns will help create maintainable, testable, and reusable components. Remember to:
- Keep components focused and simple
- Manage state appropriately
- Handle initialization correctly
- Test thoroughly
- Document clearly

## Key Patterns

### 1. State Management

- Use local state with `useState` for component-specific state
- Use `useEffect` to handle state changes and commands
- Reset state appropriately when entering different application states
- Accept initial values as props to allow for customization

### 2. Initialization

- Listen for process_begin commands with process type 'init'
- Reset component state when initialization begins
- Acknowledge initialization to the registry
- Only respond to state changes for visual updates

### 3. Test Sequence

- Handle test sequence commands
- Perform the test sequence
- Emit test results when the test sequence completes

### 4. User Interaction

- Handle user interactions with appropriate event handlers
- Update local state based on user interactions
- Emit events when necessary

### 5. Visual State Management

- Manage visual state (colors, positions, etc.) within the component
- Use local state to track visual changes
- Provide props for initial visual state
- Handle visual state changes during test sequences

## Examples

### IndicatorLight Component

The `IndicatorLight` component is a good example of this pattern:

```typescript
import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';
import './IndicatorLight.css';

interface IndicatorLightProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  topLabel?: string;
  initialColor?: IndicatorColor;
}

const IndicatorLight: React.FC<IndicatorLightProps> = ({
  id,
  x,
  y,
  label,
  topLabel,
  initialColor = 'off'
}) => {
  const [displayColor, setDisplayColor] = useState<IndicatorColor>(initialColor);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);
  
  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'init') {
        // Reset component state
        setDisplayColor('off');
        setIsTestMode(false);
        // Acknowledge initialization
        registry.acknowledge(id);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);
  
  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        
        // Perform test sequence
        const sequence: IndicatorColor[] = ['red', 'amber', 'green', 'white', 'off'];
        let i = 0;
        
        const interval = setInterval(() => {
          setDisplayColor(sequence[i]);
          i++;
          
          if (i >= sequence.length) {
            clearInterval(interval);
            setIsTestMode(false);
            
            // Emit test result when test sequence completes
            stateMachine.emit({
              type: 'test_result',
              id,
              passed: true
            });
          }
        }, 150);
        
        return () => clearInterval(interval);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);
  
  // Render
  return (
    <div className="indicator-light-wrapper" style={{ top: y, left: x }}>
      {topLabel && <div className="indicator-light-top-label">{topLabel}</div>}
      <img src={colorMap[displayColor]} className="indicator-light-img" />
      {label && <div className="indicator-light-label">{label}</div>}
    </div>
  );
};
```

### KnobSelector Component

The `KnobSelector` component is another good example:

```typescript
import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';
import './KnobSelector.css';

interface KnobSelectorProps {
  id: string;
  position: number;
  onPositionChange: (position: number) => void;
}

const KnobSelector: React.FC<KnobSelectorProps> = ({ id, position, onPositionChange }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Handle state changes for visual updates
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);
  
  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id && cmd.process === 'init') {
        // Reset component state
        setIsToggled(false);
        setIsTestMode(false);
        // Acknowledge initialization
        registry.acknowledge(id);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);
  
  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        
        // Perform test sequence
        const interval = setInterval(() => {
          setIsToggled(prev => !prev);
        }, 200);
        
        // After 5 toggles, complete the test
        setTimeout(() => {
          clearInterval(interval);
          setIsToggled(false);
          setIsTestMode(false);
          
          // Emit test result when test sequence completes
          stateMachine.emit({
            type: 'test_result',
            id,
            passed: true
          });
        }, 1000);
      }
    };
    
    const unsubscribe = stateMachine.subscribe(handleCommand);
    return () => unsubscribe();
  }, [id]);
  
  // Handle user interaction
  const handleClick = () => {
    if (!isTestMode) {
      setIsToggled(!isToggled);
      onPositionChange(isToggled ? 0 : 1);
    }
  };
  
  // Render
  return (
    <div className="knob-selector" onClick={handleClick}>
      <div className={`knob ${isToggled ? 'toggled' : ''}`} />
    </div>
  );
};
```

## Process Managers

Process managers are specialized components that handle specific system processes (like initialization or testing). They follow a distinct pattern from UI components:

### Process Manager Structure

```typescript
// Example: initManager.ts
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

class ProcessManager {
  constructor() {
    // Subscribe to relevant state changes
    stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change' && cmd.state === 'init') {
        this.handleProcess();
      }
    });
  }

  private handleProcess() {
    // Run the process
    this.runProcess();
    
    // When complete, emit completion message
    stateMachine.emit({
      type: 'process_complete',
      id: 'init',
      process: 'init_complete'
    });
  }

  private runProcess() {
    // Process-specific logic
  }
}
```

### Key Principles

1. **Single Responsibility**:
   - Handle one specific process
   - Don't manage state transitions
   - Focus on process completion

2. **Message-Based Communication**:
   - Subscribe to relevant state changes
   - Emit completion messages
   - Don't directly change state

3. **Process Coordination**:
   - Coordinate with registry if needed
   - Handle process-specific timing
   - Manage process-specific state

4. **Completion Signaling**:
   - Emit clear completion messages
   - Include process identifier
   - Don't assume next state

### Best Practices

1. **Keep It Focused**:
   - One process per manager
   - Clear completion criteria
   - Simple, predictable behavior

2. **Message Design**:
   - Use clear message types
   - Include process identifiers
   - Follow consistent patterns

3. **State Management**:
   - Manage only process state
   - Don't track system state
   - Keep it minimal

4. **Error Handling**:
   - Handle process-specific errors
   - Emit error messages if needed
   - Don't crash the system

This pattern ensures clean separation between process management and state transitions.

## Future Updates

This document will be updated as we gain more experience with different component types and encounter more complex scenarios. The goal is to establish a consistent pattern that works well for all components in the application. 