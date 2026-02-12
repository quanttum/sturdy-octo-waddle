import { describe, expect, it, vi } from 'vitest';
import { Mapper } from '../src/core/schema.js';
import { validateCanonicalRecord } from '../src/models/canonical.js';
import { HttpClient } from '../src/core/transport.js';

describe('Mapper', () => {
  it('maps canonical to external and back', () => {
    const mapper = new Mapper();
    const mapping = {
      objectType: 'Vendor' as const,
      toExternal: { displayName: 'DisplayName', email: 'PrimaryEmailAddr.Address' },
      toCanonical: { DisplayName: 'displayName', 'PrimaryEmailAddr.Address': 'email' }
    };

    const external = mapper.toExternal(mapping, { displayName: 'Acme', email: 'a@acme.com' });
    expect(external).toEqual({ DisplayName: 'Acme', PrimaryEmailAddr: { Address: 'a@acme.com' } });

    const canonical = mapper.toCanonical(mapping, external);
    expect(canonical).toEqual({ displayName: 'Acme', email: 'a@acme.com' });
  });
});

describe('Canonical validation', () => {
  it('returns validation errors for invalid invoice', () => {
    const errors = validateCanonicalRecord('Invoice', {
      id: '',
      vendorId: '',
      invoiceNumber: '',
      invoiceDate: '01/01/2024',
      currency: 'USD',
      totalAmount: 0,
      status: 'draft',
      entityScope: { entityId: '' }
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('HttpClient retry', () => {
  it('retries transient failures', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
    const client = new HttpClient({ retries: 1, baseDelayMs: 1, maxDelayMs: 2 });
    const response = await client.request<{ ok: boolean }>({ method: 'GET', url: 'https://example.com' });

    expect(response.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
