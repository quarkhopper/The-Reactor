// Updated MessageBus to align with hardware bus norms

// Message type definition
export interface Message {
  type: string; // Message type (e.g., 'state_change', 'command')
  id?: string; // Optional identifier for the message
  [key: string]: any; // Additional message properties
}

// Subscribers set
const subscribers = new Set<(msg: Message) => void>();

const MessageBus = {
  // Subscribe to all messages
  subscribe(callback: (msg: Message) => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // Emit a message to all subscribers
  emit(msg: Message) {
    console.log(`[MessageBus] Emitting message:`, msg);
    subscribers.forEach((callback) => callback(msg));
  },

  // Clear all subscribers (optional utility for testing or teardown)
  clear() {
    subscribers.clear();
  },
};

export default MessageBus;
