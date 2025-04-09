// Updated MessageBus to use JSON-based messaging for hardware bus alignment

// Subscribers set
const subscribers = new Set<(msg: Record<string, any>) => void>();

const MessageBus = {
  // Subscribe to all messages
  subscribe(callback: (msg: Record<string, any>) => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // Emit a message to all subscribers
  emit(msg: Record<string, any>) {
    console.log(`[MessageBus] Emitting message:`, msg);
    subscribers.forEach((callback) => callback(msg));
  },

  // Clear all subscribers (optional utility for testing or teardown)
  clear() {
    subscribers.clear();
  },
};

export default MessageBus;
