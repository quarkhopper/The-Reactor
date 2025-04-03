# Component Pattern Guide

This document outlines the ideal pattern for creating well-encapsulated, functional components in the Reactor application. It's based on our experience refactoring components to remove the `useTestable` dependency, starting with the `KnobSelector` component and extending to the `IndicatorLight` component.

## Core Principles

1. **Self-Containment**: Components should manage their own state and behavior without external dependencies.
2. **Clear Interface**: Components should have a well-defined interface with props that clearly communicate their purpose.
3. **State Management**: Components should handle their own state transitions and lifecycle events.
4. **Testability**: Components should be easily testable in isolation.
5. **Reusability**: Components should be designed for reuse across the application.
6. **Visual State Management**: Components should manage their own visual state (colors, positions, etc.) internally.
7. **Initialization Timing**: Components should acknowledge initialization only when explicitly requested by the state machine.

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
const ComponentName: React.FC<ComponentNameProps> = ({ id, initialValue = defaultValue, ...otherProps }) => {
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
  }, [id, initialValue]);
  
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

## Special Cases and Considerations

### Component Dependencies

When a component depends on another component (like `FuelRodButton` depending on `PanelButton`), consider the following:

1. **Initialization Timing**: 
   - Always acknowledge initialization in the state change handler, not in a separate effect
   - This ensures components initialize in the correct order
   - Example:
     ```typescript
     useEffect(() => {
       const handleStateChange = (state: AppState) => {
         if (state === 'init') {
           // Reset state and acknowledge
           registry.acknowledge(id);
         }
       };
       // ...
     }, [id]);
     ```

2. **CSS Dependencies**:
   - When reusing CSS from another component, import the CSS file directly
   - Use the same class names to maintain consistency
   - Example:
     ```typescript
     import '../css/components/PanelButton.css';
     // ...
     className="panel-button-wrapper"
     ```

3. **State Management**:
   - Each component should manage its own state
   - Parent components should not manage state for child components
   - Example:
     ```typescript
     const [isHeld, setIsHeld] = useState(false);
     const handleMouseDown = () => setIsHeld(true);
     ```

4. **Event Handling**:
   - Components should handle their own events
   - Use callbacks for parent-child communication
   - Example:
     ```typescript
     const handleClick = () => {
       if (isControlRod) {
         stateMachine.emit({ type: 'button_press', id });
       }
     };
     ```

### Testing and Debugging

1. **Component Isolation**:
   - Test components in isolation
   - Mock dependencies when necessary
   - Example:
     ```typescript
     // Mock state machine
     jest.mock('../state/StateMachine');
     ```

2. **State Transitions**:
   - Test all state transitions
   - Verify initialization sequence
   - Example:
     ```typescript
     test('initializes correctly', () => {
       // Test initialization
     });
     ```

3. **Visual Feedback**:
   - Test visual states (hover, active, disabled)
   - Verify animations and transitions
   - Example:
     ```typescript
     test('shows correct visual state', () => {
       // Test visual states
     });
     ```

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
   - Wait for explicit state change

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

### 5. Visual State Management

- Manage visual state (colors, positions, etc.) within the component
- Use local state to track visual changes
- Provide props for initial visual state
- Handle visual state changes during test sequences

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

### IndicatorLight Component

The `IndicatorLight` component demonstrates how to manage visual state (colors) within a component:

```typescript
import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';

export type IndicatorColor = 'amber' | 'green' | 'red' | 'white' | 'off';

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
  
  // Color mapping for the indicator images
  const colorMap: Record<IndicatorColor, string> = {
    amber,
    green,
    red,
    white,
    off,
  };
  
  // Handle state changes
  useEffect(() => {
    const handleStateChange = (state: AppState) => {
      if (state === 'init') {
        // Reset component state
        setDisplayColor('off');
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

export default IndicatorLight;
```

## Future Updates

This document will be updated as we gain more experience with different component types and encounter more complex scenarios. The goal is to establish a consistent pattern that works well for all components in the application. 