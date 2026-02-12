import { APObjectType, CanonicalRecord } from '../models/canonical.js';

export type ConnectorOperation = 'pull' | 'push' | 'upsert' | 'delete';
export type AuthType = 'oauth2' | 'apiKey' | 'token';

export interface ConnectorObjectCapability {
  objectType: APObjectType;
  operations: ConnectorOperation[];
}

export interface ConnectorManifest {
  connectorId: string;
  displayName: string;
  authType: AuthType;
  objects: ConnectorObjectCapability[];
  supportsMultiEntity: boolean;
  supportsCustomFields: boolean;
}

export interface ConnectorConfig {
  baseUrl?: string;
  auth: Record<string, string>;
  defaults?: Record<string, string>;
}

export interface SyncContext {
  dryRun?: boolean;
  correlationId?: string;
}

export interface PullParams {
  objectType: APObjectType;
  query?: Record<string, string | number>;
}

export interface PushParams {
  objectType: APObjectType;
  record: CanonicalRecord;
}

export interface UpsertParams {
  objectType: APObjectType;
  record: CanonicalRecord;
  matchField?: string;
}

export interface DeleteParams {
  objectType: APObjectType;
  id: string;
}

export interface Connector {
  manifest: ConnectorManifest;
  initialize(config: ConnectorConfig): Promise<void>;
  pull(params: PullParams, context?: SyncContext): Promise<CanonicalRecord[]>;
  push(params: PushParams, context?: SyncContext): Promise<CanonicalRecord>;
  upsert(params: UpsertParams, context?: SyncContext): Promise<CanonicalRecord>;
  delete(params: DeleteParams, context?: SyncContext): Promise<void>;
}

export interface MappingDefinition {
  objectType: APObjectType;
  toExternal: Record<string, string>;
  toCanonical: Record<string, string>;
}
