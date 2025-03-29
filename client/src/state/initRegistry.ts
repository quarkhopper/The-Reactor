import initComponentIds from './initManifest';

class InitRegistry {
  private received: Set<string> = new Set();

  acknowledge(id: string) {
    this.received.add(id);
  }

  allAcknowledged() {
    return initComponentIds.every((id) => this.received.has(id));
  }

  reset() {
    this.received.clear();
  }

  getUnresponsive(): string[] {
    return initComponentIds.filter((id) => !this.received.has(id));
  }
}

const instance = new InitRegistry();
export default instance;
