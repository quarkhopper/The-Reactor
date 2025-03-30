import manifest from './initManifest';

const registry = {
  pending: new Set(manifest),

  acknowledge(id: string) {
    console.log(`[testRegistry] Acknowledged: ${id}`);
    this.pending.delete(id);
  },

  reset() {
    this.pending = new Set(manifest);
  },

  begin(callback: () => void) {
    this.reset();
    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        console.log('[testRegistry] All components passed self-test. Proceeding.');
        callback();
      }
    }, 100);
  },
};

export default registry;
