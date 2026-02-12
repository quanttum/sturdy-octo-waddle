import { HttpClient } from '../core/transport.js';
import {
  Connector,
  ConnectorConfig,
  ConnectorManifest,
  DeleteParams,
  PullParams,
  PushParams,
  SyncContext,
  UpsertParams
} from '../core/types.js';
import { CanonicalRecord } from '../models/canonical.js';

export abstract class BaseConnector implements Connector {
  protected config?: ConnectorConfig;
  protected readonly httpClient = new HttpClient();

  constructor(public readonly manifest: ConnectorManifest) {}

  async initialize(config: ConnectorConfig): Promise<void> {
    this.config = config;
  }

  async pull(_params: PullParams, _context?: SyncContext): Promise<CanonicalRecord[]> {
    return [];
  }

  async push(params: PushParams, _context?: SyncContext): Promise<CanonicalRecord> {
    return params.record;
  }

  async upsert(params: UpsertParams, _context?: SyncContext): Promise<CanonicalRecord> {
    return params.record;
  }

  async delete(_params: DeleteParams, _context?: SyncContext): Promise<void> {
    return;
  }
}
