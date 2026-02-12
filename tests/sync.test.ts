import { describe, expect, it } from 'vitest';
import { runSync } from '../src/core/sync.js';
import { buildDefaultRegistry } from '../src/connectors/index.js';

describe('runSync', () => {
  it('returns validation errors for invalid push payload', async () => {
    const registry = buildDefaultRegistry();
    const connector = registry.get('quickbooks-online');

    const result = await runSync(connector, {
      objectType: 'Invoice',
      mode: 'push',
      payload: {
        id: '',
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: 'bad-date',
        currency: 'USD',
        totalAmount: 0,
        status: 'draft',
        entityScope: { entityId: '' }
      }
    });

    expect(result.processed).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
