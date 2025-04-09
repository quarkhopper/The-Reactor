# Component Bus Architecture Specification

## Overview

All UI components are to be treated as hardware simulation modules. Each component acts independently and communicates solely via a central message bus (`MasterBus.ts`). Components must be completely isolated from global application logic, state machines, or external resource references.

## Imports Allowed per Component
- React (only hooks/components needed)
- `MasterBus` from `../state/MessageBus`

Optional:
- TypeScript `types.ts` definitions (interfaces only, no logic or state constants)

## Forbidden in Components
- Importing enums like `AppState`, `CommandType`, or centralized state objects.
- Accessing any global context or inter-component awareness.
- Referencing or mutating application-level state directly.

## Messaging Rules
- All components **emit** and **subscribe** through `MasterBus`.
- Messages must be plain objects with a minimum structure:
  ```ts
  type Message = {
    type: string;
    id?: string;
    [key: string]: any;
  };
  ```
- All components may ignore irrelevant messages.
- `MasterBus.subscribe((message: Message) => void)`
- `MasterBus.emit(message: Message)`

## Local Logic Enforcement
- Each component contains all of its display logic and internal state.
- State is updated exclusively via bus messages or user input (e.g. click).
- Messages must contain everything the component needs to act (no external lookups).

## Example Component Pattern
```ts
import { useEffect, useState } from 'react';
import MasterBus from '../state/MessageBus';

export default function MyComponent() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const unsubscribe = MasterBus.subscribe((msg) => {
      if (msg.type === 'activate' && msg.id === 'my_component') {
        setActive(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleClick = () => {
    MasterBus.emit({ type: 'clicked', id: 'my_component' });
  };

  return <button onClick={handleClick}>{active ? 'Active' : 'Inactive'}</button>;
}
```

## Shared Types
- All common types, if needed, must be located in `types.ts`.
- Types must only describe structure, not values or enums.
- If enums or state constants are needed, use plain string literals.

## MasterBus.ts (Essentials)
```ts
// Message type definition
export interface Message {
  type: string;
  id?: string;
  [key: string]: any;
}

// Subscriptions
const subscribers = new Set<(msg: Message) => void>();

const MasterBus = {
  subscribe(callback: (msg: Message) => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  emit(msg: Message) {
    subscribers.forEach((cb) => cb(msg));
  },
};

export default MasterBus;
```

## Component Autonomy
- Components are **blind** to the global application state.
- Components are **autonomous**, responding to and producing only messages.
- Components can simulate embedded modules in a hardware environment, following isolated, event-driven behavior.

