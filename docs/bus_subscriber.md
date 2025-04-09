# Bus Subscription and Handling Pattern

## Overview
This document outlines the standard pattern for subscribing to and handling messages from the `MessageBus` in the Reactor application. The pattern ensures consistency, alignment with hardware bus norms, and maintainability across all components and subsystems.

## Key Principles
1. **Broadcast and Filtering**:
   - The `MessageBus` broadcasts all messages to all subscribers.
   - Each subscriber is responsible for filtering and processing only the messages relevant to it.

2. **Guard Pattern**:
   - Use a guard function to validate whether a message is relevant to the subscriber.
   - Return immediately if the message is not relevant.

3. **Decoupling**:
   - The `MessageBus` is agnostic to the content of messages.
   - Components and subsystems handle message parsing and validation independently.

4. **JSON-Based Messaging**:
   - All messages are raw JSON objects (`Record<string, any>`).
   - Avoid enforcing specific message structures in the `MessageBus`.

## Pattern Implementation

### 1. Subscribing to the `MessageBus`
Each component or subsystem subscribes to the `MessageBus` and provides a callback function to handle messages.

```typescript
MessageBus.subscribe((msg: Record<string, any>) => {
  if (!isRelevantMessage(msg)) {
    return;
  }

  handleMessage(msg);
});
```

### 2. Guard Function
The guard function validates whether a message is relevant to the subscriber. This ensures that only relevant messages are processed.

```typescript
function isRelevantMessage(msg: Record<string, any>): boolean {
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'example_type_1' ||
     msg.type === 'example_type_2')
  );
}
```

### 3. Message Handling
The message handling function processes the relevant messages. This function contains the logic specific to the component or subsystem.

```typescript
function handleMessage(msg: Record<string, any>) {
  if (msg.type === 'example_type_1') {
    // Handle example_type_1
  } else if (msg.type === 'example_type_2') {
    // Handle example_type_2
  }
}
```

## Example: StateMachine
The `StateMachine` subscribes to the `MessageBus` and processes relevant commands using the guard pattern.

```typescript
MessageBus.subscribe((msg: Record<string, any>) => {
  if (!isStateMachineMessage(msg)) {
    return;
  }

  handleCommand(msg);
});

function isStateMachineMessage(msg: Record<string, any>): boolean {
  return (
    typeof msg.type === 'string' &&
    (msg.type === 'power_button_press' ||
     msg.type === 'process_complete' ||
     msg.type === 'scram_button_press' ||
     msg.type === 'state_change')
  );
}

function handleCommand(msg: Record<string, any>) {
  if (msg.type === 'power_button_press') {
    // Handle power button press
  } else if (msg.type === 'process_complete') {
    // Handle process completion
  }
}
```

## Benefits
- **Consistency**: Ensures a uniform approach to message handling across the application.
- **Scalability**: Supports the addition of new message types without modifying the `MessageBus`.
- **Alignment with Hardware Norms**: Mimics the behavior of a hardware bus by broadcasting all messages and relying on components to filter them.

## Conclusion
By following this pattern, the Reactor application maintains a clean, modular, and hardware-aligned approach to message handling. All components and subsystems should adhere to this pattern to ensure consistency and maintainability.