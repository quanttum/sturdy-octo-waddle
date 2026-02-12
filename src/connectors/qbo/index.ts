import { ConnectorConfig, ConnectorManifest } from '../../core/types.js';
import { BaseConnector } from '../base.js';
import { OAuth2AuthProvider } from '../../core/auth.js';

export const qboManifest: ConnectorManifest = {
  connectorId: 'quickbooks-online',
  displayName: 'QuickBooks Online Connector',
  authType: 'oauth2',
  supportsMultiEntity: false,
  supportsCustomFields: true,
  objects: [
    { objectType: 'Vendor', operations: ['pull', 'upsert'] },
    { objectType: 'Invoice', operations: ['pull', 'upsert'] },
    { objectType: 'Payment', operations: ['pull', 'push', 'delete'] }
  ]
};

export class QboConnector extends BaseConnector {
  private authProvider?: OAuth2AuthProvider;

  constructor() {
    super(qboManifest);
  }

  override async initialize(config: ConnectorConfig): Promise<void> {
    await super.initialize(config);
    this.authProvider = new OAuth2AuthProvider({
      clientId: config.auth.clientId ?? 'stub-client-id',
      clientSecret: config.auth.clientSecret ?? 'stub-client-secret',
      tokenUrl: config.auth.tokenUrl ?? 'stub://qbo/token',
      scope: 'com.intuit.quickbooks.accounting'
    });
  }

  getAuthProvider(): OAuth2AuthProvider {
    if (!this.authProvider) throw new Error('connector not initialized');
    return this.authProvider;
  }
}
