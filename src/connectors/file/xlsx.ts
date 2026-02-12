import { readFile, writeFile } from 'node:fs/promises';
import { utils, write, read } from 'xlsx';
import { ConnectorManifest, PullParams, PushParams } from '../../core/types.js';
import { BaseConnector } from '../base.js';
import { CanonicalRecord } from '../../models/canonical.js';

export const xlsxManifest: ConnectorManifest = {
  connectorId: 'file-xlsx',
  displayName: 'XLSX File Connector',
  authType: 'token',
  supportsMultiEntity: true,
  supportsCustomFields: true,
  objects: [
    { objectType: 'Vendor', operations: ['pull', 'push', 'upsert'] },
    { objectType: 'Invoice', operations: ['pull', 'push', 'upsert'] },
    { objectType: 'Payment', operations: ['pull', 'push'] }
  ]
};

export class XlsxFileConnector extends BaseConnector {
  constructor() {
    super(xlsxManifest);
  }

  override async pull(params: PullParams): Promise<CanonicalRecord[]> {
    const filePath = this.config?.defaults?.filePath;
    if (!filePath) throw new Error('filePath is required');

    const data = await readFile(filePath);
    const workbook = read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet);
    return rows
      .filter((row) => row.objectType === params.objectType)
      .map((row) => row as CanonicalRecord);
  }

  override async push(params: PushParams): Promise<CanonicalRecord> {
    const filePath = this.config?.defaults?.filePath;
    if (!filePath) throw new Error('filePath is required');

    let rows: Record<string, unknown>[] = [];
    try {
      const data = await readFile(filePath);
      const workbook = read(data);
      rows = utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]]);
    } catch {
      rows = [];
    }

    rows.push({ objectType: params.objectType, ...params.record });
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'APData');

    const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await writeFile(filePath, buffer);
    return params.record;
  }
}
