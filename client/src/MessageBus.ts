// Updated MessageBus to use JSON-based messaging for hardware bus alignment

// Subscribers set
const subscribers = new Set<(msg: Record<string, any>) => void>();

// Add internal state to track power status
let poweredOn = false;

const MessageBus = {
  // Subscribe to all messages
  subscribe(callback: (msg: Record<string, any>) => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // Emit a message to all subscribers
  emit(msg: Record<string, any>) {
    if (!poweredOn) {
      // Allow power button press to turn on the bus
      if (msg.type === 'power_button_press' && msg.id === 'master') {
        poweredOn = true;
        console.log(`[MessageBus] Powering on and emitting message:`, msg);
      } else {
        console.log(`[MessageBus] MessageBus is off. Ignoring message:`, msg);
        return;
      }
    }

    if (msg.type === 'state' && msg.state === 'off') {
      poweredOn = false;
      console.log(`[MessageBus] Powering off and ignoring message:`, msg);
      return;
    }

    subscribers.forEach((callback) => callback(msg));
  },

  // Clear all subscribers (optional utility for testing or teardown)
  clear() {
    subscribers.clear();
  },
};

export default MessageBus;
