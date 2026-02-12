import { describe, expect, it } from 'vitest';
import { buildDefaultRegistry } from '../src/connectors/index.js';
import { validateConnectorCompliance } from '../src/core/compliance.js';
import { canonicalRequirements, coverageFromMappings } from '../src/core/requirements.js';
import { detectGaps } from '../src/core/gap-detector.js';
import { netSuiteMappings } from '../src/mappings/netsuite.js';

describe('Connector compliance', () => {
  it('all default connectors pass compliance', () => {
    const registry = buildDefaultRegistry();
    const results = registry.list().map((connector) => validateConnectorCompliance(connector));

    expect(results.every((result) => result.compliant)).toBe(true);
  });
});

describe('Gap detection', () => {
  it('detects required canonical field gaps', () => {
    const registry = buildDefaultRegistry();
    const connector = registry.get('netsuite-rest');

    const gaps = detectGaps(
      canonicalRequirements,
      connector.manifest,
      coverageFromMappings(netSuiteMappings)
    );

    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.some((gap) => gap.objectType === 'Payment')).toBe(true);
  });
});
