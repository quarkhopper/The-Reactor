# Manager Pattern

## Overview
Managers (initManager, testManager, shutdownManager) follow a consistent pattern for handling state-driven processes. Each manager is responsible for a specific phase of the system's operation.

## Pattern Flow

1. **State-Driven Activation**
   - Managers subscribe to state changes in their `init()` method
   - Each manager responds to a specific state:
     - `initManager` -> 'init' state
     - `testManager` -> 'test' state
     - `shutdownManager` -> 'shutdown' state

2. **Process Initiation**
   - When activated, manager emits a `process_begin` command:
   ```typescript
   {
     type: 'process_begin',
     id: '<process name>',    // e.g. 'init'
     process: '<process name>' // e.g. 'init'
   }
   ```

3. **Component Acknowledgment**
   - Components receive the `process_begin`
   - Components enter their transient state (blinking, testing, etc.)
   - Components acknowledge back to the specific manager:
   ```typescript
   {
     type: 'acknowledge',
     id: '<component id>',
     process: '<process name>' // matches the process they received
   }
   ```

4. **Process Completion**
   - Manager tracks acknowledgments
   - When all components have acknowledged, manager emits `process_complete`:
   ```typescript
   {
     type: 'process_complete',
     id: '<process name>',    // e.g. 'test'
     process: '<process name>' // e.g. 'test' - EXACTLY THE SAME AS THE PROCESS NAME, NO SUFFIXES
   }
   ```

5. **State Machine Transition**
   - State machine receives `process_complete`
   - State machine handles the transition internally:
     - `init` -> transition to 'test'
     - `test` -> transition to 'startup'
     - `shutdown` -> transition to 'off'

## Key Points
- Managers are state-driven, not command-driven
- Each manager handles its own process and acknowledgments
- Components acknowledge back to the specific manager that initiated the process
- State machine handles transitions based on process completion
- Pattern is consistent across all managers
- IMPORTANT: Process names must be EXACT - no suffixes like '_complete' or other modifications 