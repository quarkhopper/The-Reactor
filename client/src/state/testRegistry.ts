import manifest from './initManifest';

const registry = {
  isReady: false,
  pending: new Set<string>(),

  acknowledge(id: string) {
    if (!this.isReady) {
      console.warn(`[testRegistry] Acknowledge ignored (not ready): ${id}`);
      return;
    }

    console.log(`[testRegistry] Acknowledged: ${id}`);
    this.pending.delete(id);
  },

  reset() {
    this.pending = new Set(manifest);
    this.isReady = false;
  },

  begin(callback: () => void) {
    this.reset();

    // Defer until all components have mounted and registered listeners
    requestAnimationFrame(() => {
      this.isReady = true;

      const event = new CustomEvent('ui-event', {
        detail: { type: 'test' },
      });
      window.dispatchEvent(event);
    });

    const interval = setInterval(() => {
      if (this.pending.size === 0) {
        clearInterval(interval);
        console.log('[testRegistry] All components passed self-test. Proceeding.');
        callback();
      }
    }, 100);

    setTimeout(() => {
      if (this.pending.size > 0) {
        console.warn('[testRegistry DEBUG] Still waiting for:', Array.from(this.pending));
      }
    }, 5000);
  },
};

export default registry;
