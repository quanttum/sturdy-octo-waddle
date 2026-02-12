import { ApiKeyAuthProvider } from '../../core/auth.js';
import { ConnectorConfig, ConnectorManifest } from '../../core/types.js';
import { BaseConnector } from '../base.js';

export const netSuiteManifest: ConnectorManifest = {
  connectorId: 'netsuite-rest',
  displayName: 'NetSuite REST Connector',
  authType: 'apiKey',
  supportsMultiEntity: true,
  supportsCustomFields: true,
  objects: [
    { objectType: 'Vendor', operations: ['pull', 'upsert'] },
    { objectType: 'Invoice', operations: ['pull', 'upsert', 'delete'] },
    { objectType: 'Payment', operations: ['pull', 'push'] }
  ]
};

export class NetSuiteConnector extends BaseConnector {
  private authProvider?: ApiKeyAuthProvider;

  constructor() {
    super(netSuiteManifest);
  }

  override async initialize(config: ConnectorConfig): Promise<void> {
    await super.initialize(config);
    const apiKey = config.auth.apiKey ?? 'stubbed-netsuite-key';
    this.authProvider = new ApiKeyAuthProvider(apiKey, 'Authorization');
  }

  getAuthProvider(): ApiKeyAuthProvider {
    if (!this.authProvider) {
      throw new Error('connector not initialized');
    }
    return this.authProvider;
  }
}
