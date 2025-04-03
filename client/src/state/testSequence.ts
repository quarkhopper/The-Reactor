import stateMachine from './StateMachine';
import type { Command } from './types';

// Test sequence configuration
const TEST_DURATION = 5000; // 5 seconds
const TEST_INTERVAL = 100;  // 100ms between checks

// Test sequence state
let isRunning = false;
let currentTest: NodeJS.Timeout | null = null;

// Start a test sequence
export function startTestSequence() {
  if (isRunning) {
    console.log('[testSequence] Test already in progress');
    return;
  }

  isRunning = true;
  console.log('[testSequence] Starting test sequence');

  // Emit test sequence start
  stateMachine.emit({
    type: 'state_change',
    id: 'system',
    state: 'init'
  });

  // Run test sequence
  let elapsed = 0;
  currentTest = setInterval(() => {
    elapsed += TEST_INTERVAL;

    // Update progress
    const progress = Math.min(1, elapsed / TEST_DURATION);
    console.log(`[testSequence] Progress: ${Math.round(progress * 100)}%`);

    // Check if test is complete
    if (elapsed >= TEST_DURATION) {
      stopTestSequence(true);
    }
  }, TEST_INTERVAL);

  // Set timeout for test failure
  setTimeout(() => {
    if (isRunning) {
      console.log('[testSequence] Test sequence timed out');
      stopTestSequence(false);
    }
  }, TEST_DURATION * 1.5); // 50% grace period
}

// Stop the test sequence
export function stopTestSequence(success: boolean) {
  if (!isRunning) return;

  if (currentTest) {
    clearInterval(currentTest);
    currentTest = null;
  }

  isRunning = false;
  console.log(`[testSequence] Test sequence ${success ? 'completed successfully' : 'failed'}`);

  // Emit test sequence result
  stateMachine.emit({
    type: 'test_result',
    id: 'system',
    passed: success
  });
}

// Initialize test sequence module
console.log('[testSequence] Module initialized'); 