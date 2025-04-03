# Component Pattern Guide

This document outlines the ideal pattern for creating well-encapsulated, functional components in the Reactor application. It's based on our experience refactoring components to remove the `useTestable` dependency, starting with the `KnobSelector` component.

## Core Principles

1. **Self-Containment**: Components should manage their own state and behavior without external dependencies.
2. **Clear Interface**: Components should have a well-defined interface with props that clearly communicate their purpose.
3. **State Management**: Components should handle their own state transitions and lifecycle events.
4. **Testability**: Components should be easily testable in isolation.
5. **Reusability**: Components should be designed for reuse across the application.

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
}
```

### 3. Component Implementation

```typescript
const ComponentName: React.FC<ComponentNameProps> = ({ id, ...otherProps }) => {
  // Local state
  const [localState, setLocalState] = useState(initialValue);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'init') {
        // Reset component state
        setLocalState(initialValue);
        setIsTestMode(false);
        // Acknowledge this component when initialization is requested
        registry.acknowledge(id);
      } else if (state === 'startup' || state === 'on') {
        // Ensure components are reset when entering startup or on state
        setIsTestMode(false);
        setLocalState(initialValue);
      }
    };
    
    const unsubscribe = stateMachine.subscribe((cmd: Command) => {
      if (cmd.type === 'state_change') {
        handleStateChange(cmd.state);
      }
    });
    
    return () => unsubscribe();
  }, [id]);
  
  // Handle test sequence
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'test_sequence' && cmd.id === id) {
        setIsTestMode(true);
        // Perform test sequence
        // ...
        
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
  }, [id]);
  
  // Component-specific logic
  const handleInteraction = () => {
    // Handle user interaction
    // ...
  };
  
  // Render
  return (
    <div 
      className={`component-name ${isTestMode ? 'test-mode' : ''}`}
      onClick={handleInteraction}
    >
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Key Patterns

### 1. State Management

- Use local state with `useState` for component-specific state
- Use `useEffect` to handle state changes and commands
- Reset state appropriately when entering different application states

### 2. Initialization

- Acknowledge the component during initialization
- Reset component state when entering the 'init' state
- Ensure proper cleanup when the component unmounts

### 3. Test Sequence

- Handle test sequence commands
- Perform the test sequence
- Emit test results when the test sequence completes

### 4. User Interaction

- Handle user interactions with appropriate event handlers
- Update local state based on user interactions
- Emit events when necessary

## Examples

### KnobSelector Component

The `KnobSelector` component is a good example of this pattern:

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
  
  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'init') {
        // Reset component state
        setIsToggled(false);
        setIsTestMode(false);
        // Acknowledge this component when initialization is requested
        registry.acknowledge(id);
      } else if (state === 'startup' || state === 'on') {
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
    <div 
      className={`knob-selector ${isToggled ? 'toggled' : ''} ${isTestMode ? 'test-mode' : ''}`}
      onClick={handleClick}
    >
      <div className="knob-indicator"></div>
    </div>
  );
};

export default KnobSelector;
```

## Future Updates

This document will be updated as we gain more experience with different component types and encounter more complex scenarios. The goal is to establish a consistent pattern that works well for all components in the application. 