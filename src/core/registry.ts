import { Connector } from './types.js';

export class ConnectorRegistry {
  private readonly connectors = new Map<string, Connector>();

  register(connector: Connector): void {
    this.connectors.set(connector.manifest.connectorId, connector);
  }

  get(connectorId: string): Connector {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`connector not found: ${connectorId}`);
    }
    return connector;
  }

  list(): Connector[] {
    return [...this.connectors.values()];
  }
}
