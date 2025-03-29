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
    console.log('[initRegistry] Begin init cycle with keys:', [...this.pending]);
    const interval = setInterval(() => {
      console.log('[initRegistry] Pending keys:', [...this.pending]);
      if (this.pending.size === 0) {
        clearInterval(interval);
        console.log('[initRegistry] All components ready, invoking callback');
        callback();
      }
    }, 1000);
  },
};

export default registry;
