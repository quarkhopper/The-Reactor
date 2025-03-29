import initManifest from './initManifest';
import type { InitRegistry } from './types';

const registry: InitRegistry = {
  pending: new Set(initManifest),
  acknowledge(id: string) {
    console.log(`[initRegistry] Acknowledged: ${id}`);
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
        console.log('[initRegistry] All components ready, invoking callback');
        callback();
      }
    }, 100);
  },
};

export default registry;
