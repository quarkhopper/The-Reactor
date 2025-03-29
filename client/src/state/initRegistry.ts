import initManifest from './initManifest';
import type { InitRegistry } from './types';

const registry: InitRegistry = {
  pending: new Set(initManifest),
  acknowledge(id: string) {
    this.pending.delete(id);
  },
  reset() {
    this.pending = new Set(initManifest);
  },
  begin(callback: () => void) {
    this.reset();
    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  },
};

export default registry;
