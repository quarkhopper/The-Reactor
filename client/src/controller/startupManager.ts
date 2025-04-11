import MessageBus from '../MessageBus';

class StartupManager  {
  private initialized: boolean = false;

  constructor() {
    // First pass - just construct
  }

  // Second pass - initialize
  init() {
    if (this.initialized) {
      return;
    }


    // Subscribe to MessageBus for acknowledgments
    MessageBus.subscribe((msg: Record<string, any>) => {
      this.handleCommand(msg);
    });

    this.initialized = true;
  }

  // Added a guard function to validate if a message is relevant to the StateMachine
  private isInitManagerMessage(msg: Record<string, any>): boolean {
    return (
      typeof msg.type === 'string' &&
      (msg.type === 'acknowledge' || msg.type === 'state_change')
    );
  }

  private handleCommand(msg: Record<string, any>) {
    if (!this.isInitManagerMessage(msg)) {
      return;
    }

    if( msg.type === 'state_change' && msg.state === 'startup' ) {
      this.beginStartup();
    }  
  }

  beginStartup() {
    MessageBus.emit({
      type: 'process_begin',
      id: 'system',
      process: 'startup',
    });
    console.log('[initManager] starting system');

    setTimeout(() => {
      this.handleStartupComplete();
    }, 2000); // Simulate a delay for startup process
  }

  handleStartupComplete() {
    MessageBus.emit({
      type: 'process_complete',
      id: 'system',
      process: 'startup',
    });
    console.log('[initManager] Initialization complete');
  }
}

// Create singleton instance
export const startupManager = new StartupManager();
