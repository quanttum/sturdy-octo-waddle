import { APObjectType, CanonicalRecord, validateCanonicalRecord } from '../models/canonical.js';
import { Connector, SyncContext } from './types.js';

export interface SyncJob {
  objectType: APObjectType;
  mode: 'pull' | 'push';
  payload?: CanonicalRecord;
}

export interface SyncResult {
  objectType: APObjectType;
  processed: number;
  errors: string[];
}

export async function runSync(
  connector: Connector,
  job: SyncJob,
  context: SyncContext = {}
): Promise<SyncResult> {
  if (job.mode === 'pull') {
    const result = await connector.pull({ objectType: job.objectType }, context);
    return { objectType: job.objectType, processed: result.length, errors: [] };
  }

  if (!job.payload) {
    return { objectType: job.objectType, processed: 0, errors: ['payload required for push'] };
  }

  const errors = validateCanonicalRecord(job.objectType, job.payload);
  if (errors.length > 0) {
    return { objectType: job.objectType, processed: 0, errors };
  }

  await connector.push({ objectType: job.objectType, record: job.payload }, context);
  return { objectType: job.objectType, processed: 1, errors: [] };
}
