// Message type definition
export interface Message {
  type: string;
  id?: string;
  [key: string]: any;
}

// Subscriptions
const subscribers = new Set<(msg: Message) => void>();

const MessageBus = {
  subscribe(callback: (msg: Message) => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  emit(msg: Message) {
    subscribers.forEach((cb) => cb(msg));
  },
};

export default MessageBus;
