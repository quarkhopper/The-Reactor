# Component Pattern Guide

## Component Structure

### Updated Structure

```typescript
import React, { useState, useEffect } from 'react';
import MessageBus from '../MessageBus';

interface ComponentProps {
  id: string;
  // Component-specific props
}

const Component: React.FC<ComponentProps> = ({ id, ...props }) => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [displayState, setDisplayState] = useState('default');

  // Guard function to filter relevant messages
  const isComponentMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_begin') &&
      msg.id === id
    );
  };

  // Message handler
  const handleMessage = (msg: Record<string, any>) => {
    if (msg.type === 'state_change') {
      setDisplayState(msg.state);
    } else if (msg.type === 'process_begin' && msg.process === 'init') {
      setIsActive(true);
      MessageBus.emit({
        type: 'acknowledge',
        id,
        process: 'init',
      });
    }
  };

  // Subscribe to MessageBus
  useEffect(() => {
    const subscription = MessageBus.subscribe((msg) => {
      if (isComponentMessage(msg)) {
        handleMessage(msg);
      }
    });

    return () => subscription();
  }, [id]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

## Key Patterns

### 1. Guard Functions
- Use guard functions to filter messages relevant to the component.
- Example:
  ```typescript
  const isComponentMessage = (msg: Record<string, any>): boolean => {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'state_change' || msg.type === 'process_begin') &&
      msg.id === id
    );
  };
  ```

### 2. Message Handling
- Centralize message handling in a dedicated function.
- Example:
  ```typescript
  const handleMessage = (msg: Record<string, any>) => {
    if (msg.type === 'state_change') {
      setDisplayState(msg.state);
    } else if (msg.type === 'process_begin' && msg.process === 'init') {
      setIsActive(true);
      MessageBus.emit({
        type: 'acknowledge',
        id,
        process: 'init',
      });
    }
  };
  ```

### 3. MessageBus Integration
- Subscribe to `MessageBus` in a `useEffect` hook.
- Ensure proper cleanup by unsubscribing when the component unmounts.
- Example:
  ```typescript
  useEffect(() => {
    const subscription = MessageBus.subscribe((msg) => {
      if (isComponentMessage(msg)) {
        handleMessage(msg);
      }
    });

    return () => subscription();
  }, [id]);
  ```

### 4. Acknowledgment Messages
- Emit `acknowledge` messages for `init` and `shutdown` processes.
- Example:
  ```typescript
  MessageBus.emit({
    type: 'acknowledge',
    id,
    process: 'init',
  });
  ```

## Component Types

### 1. Control Components
- Buttons, switches, toggles
- Direct user interaction
- Emit messages for user actions

### 2. Display Components
- Gauges, meters, indicators
- Show system state
- Subscribe to `MessageBus` for updates

### 3. Process Components
- Manage complex state transitions
- Track process progress
- Emit and handle process-related messages

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
      MessageBus.emit({
        type: 'test_result',
        id,
        passed: true
      });
    })
    .catch(() => {
      // Report failure
      MessageBus.emit({
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
- Use React state hooks for local state.
- Update state based on messages from `MessageBus`.

### 2. Message Handling
- Use guard functions to filter messages.
- Centralize message handling in a single function.

### 3. Cleanup
- Unsubscribe from `MessageBus` in the `useEffect` cleanup function.

### 4. Consistency
- Follow the same pattern for all components to ensure maintainability.