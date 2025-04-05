# Component Pattern Guide

## Component Structure

### Basic Structure

```typescript
import React, { useState, useEffect } from 'react';
import stateMachine from '../state/StateMachine';
import { registry } from '../state/registry';
import type { Command, AppState } from '../state/types';

interface ComponentProps {
  id: string;
  // Component-specific props
}

const Component: React.FC<ComponentProps> = ({ id, ...props }) => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [displayState, setDisplayState] = useState(initialState);

  // Handle initialization
  useEffect(() => {
    const handleCommand = (cmd: Command) => {
      if (cmd.type === 'process_begin' && cmd.id === id) {
        handleInit();
      }
    };

    const unsubscribe = stateMachine.subscribe(handleCommand);
    return unsubscribe;
  }, [id]);

  // Handle state changes
  useEffect(() => {
    const handleStateChange = (cmd: Command) => {
      if (cmd.type === 'state_change') {
        updateDisplayState(cmd.state);
      }
    };

    const unsubscribe = stateMachine.subscribe(handleStateChange);
    return unsubscribe;
  }, []);

  const handleInit = () => {
    // Initialize component
    setIsInitialized(true);
    // Acknowledge initialization
    stateMachine.emit({
      type: 'process_complete',
      id,
      process: 'init'
    });
  };

  const updateDisplayState = (state: AppState) => {
    // Update visual state based on app state
    setDisplayState(calculateDisplayState(state));
  };

  return (
    // Component JSX
  );
};

export default Component;
```

## Component Types

### 1. Control Components
- Buttons, switches, toggles
- Direct user interaction
- Binary or multi-state controls
- Visual feedback on state

### 2. Display Components
- Gauges, meters, indicators
- Show system state
- Visual feedback
- No direct interaction

### 3. Process Components
- Complex state management
- Multiple sub-states
- Process tracking
- State transitions

## Component States

### 1. Initial State
- Default visual state
- Inactive until initialized
- No user interaction
- Clear visual indication

### 2. Active State
- Fully functional
- Responds to user input
- Updates display
- Handles events

### 3. Test State
- Special test mode
- Test sequence active
- Visual feedback
- Test results reporting

### 4. Error State
- Error indication
- Safe state
- Error reporting
- Recovery handling

## Visual Feedback

### 1. State Indicators
- Color changes
- Icon updates
- Text changes
- Animation states

### 2. Process Feedback
- Progress indicators
- Status messages
- Completion signals
- Error displays

### 3. User Interaction
- Hover states
- Click feedback
- Disabled states
- Focus indicators

## Testing

### 1. Test Sequence
```typescript
const handleTest = () => {
  // Set test mode
  setIsTestMode(true);
  
  // Run test sequence
  runTestSequence()
    .then(() => {
      // Report success
      stateMachine.emit({
        type: 'test_result',
        id,
        passed: true
      });
    })
    .catch(() => {
      // Report failure
      stateMachine.emit({
        type: 'test_result',
        id,
        passed: false
      });
    });
};
```

### 2. Test States
- Initial test state
- Test in progress
- Test complete
- Test failed

### 3. Test Feedback
- Visual indicators
- Progress updates
- Result display
- Error reporting

## Error Handling

### 1. Error States
- Invalid input
- Process failure
- State error
- Communication error

### 2. Error Recovery
- Reset to safe state
- Error reporting
- User notification
- Recovery options

### 3. Error Prevention
- Input validation
- State checking
- Process verification
- Error boundaries

## Best Practices

### 1. State Management
- Clear state transitions
- Consistent state handling
- State validation
- Error recovery

### 2. Event Handling
- Clean event handlers
- Proper cleanup
- Error handling
- State updates

### 3. Visual Feedback
- Clear indicators
- Consistent styling
- User feedback
- Error display

### 4. Testing
- Test coverage
- Error cases
- State transitions
- User interaction 