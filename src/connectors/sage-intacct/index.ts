import { ApiKeyAuthProvider } from '../../core/auth.js';
import { ConnectorConfig, ConnectorManifest } from '../../core/types.js';
import { BaseConnector } from '../base.js';

export const sageIntacctManifest: ConnectorManifest = {
  connectorId: 'sage-intacct-api',
  displayName: 'Sage Intacct Connector',
  authType: 'apiKey',
  supportsMultiEntity: true,
  supportsCustomFields: true,
  objects: [
    { objectType: 'Vendor', operations: ['pull', 'upsert'] },
    { objectType: 'Invoice', operations: ['pull', 'upsert'] },
    { objectType: 'Payment', operations: ['pull', 'push'] }
  ]
};

export class SageIntacctConnector extends BaseConnector {
  private authProvider?: ApiKeyAuthProvider;

  constructor() {
    super(sageIntacctManifest);
  }

  override async initialize(config: ConnectorConfig): Promise<void> {
    await super.initialize(config);
    this.authProvider = new ApiKeyAuthProvider(config.auth.apiKey ?? 'stubbed-intacct-key', 'X-Auth-Token');
  }

  getAuthProvider(): ApiKeyAuthProvider {
    if (!this.authProvider) throw new Error('connector not initialized');
    return this.authProvider;
  }
}
