import { readFile, writeFile } from 'node:fs/promises';
import { ConnectorManifest, PullParams, PushParams } from '../../core/types.js';
import { BaseConnector } from '../base.js';
import { CanonicalRecord } from '../../models/canonical.js';

export const csvManifest: ConnectorManifest = {
  connectorId: 'file-csv',
  displayName: 'CSV File Connector',
  authType: 'token',
  supportsMultiEntity: true,
  supportsCustomFields: true,
  objects: [
    { objectType: 'Vendor', operations: ['pull', 'push', 'upsert'] },
    { objectType: 'Invoice', operations: ['pull', 'push', 'upsert'] },
    { objectType: 'Payment', operations: ['pull', 'push'] }
  ]
};

export class CsvFileConnector extends BaseConnector {
  constructor() {
    super(csvManifest);
  }

  override async pull(params: PullParams): Promise<CanonicalRecord[]> {
    const filePath = this.config?.defaults?.filePath;
    if (!filePath) throw new Error('filePath is required');

    const content = await readFile(filePath, 'utf-8');
    const [header, ...rows] = content.trim().split('\n');
    const keys = header.split(',');

    return rows
      .map((row) => {
        const values = row.split(',');
        const record = Object.fromEntries(keys.map((key, idx) => [key, values[idx]]));
        return record as CanonicalRecord;
      })
      .filter((record) => (record as Record<string, string>).objectType === params.objectType);
  }

  override async push(params: PushParams): Promise<CanonicalRecord> {
    const filePath = this.config?.defaults?.filePath;
    if (!filePath) throw new Error('filePath is required');

    const record = {
      objectType: params.objectType,
      ...params.record
    } as Record<string, unknown>;

    const keys = Object.keys(record);
    const line = keys.map((k) => String(record[k] ?? '')).join(',');

    let existing = '';
    try {
      existing = await readFile(filePath, 'utf-8');
    } catch {
      existing = `${keys.join(',')}\n`;
    }

    await writeFile(filePath, `${existing.trimEnd()}\n${line}\n`, 'utf-8');
    return params.record;
  }
}
