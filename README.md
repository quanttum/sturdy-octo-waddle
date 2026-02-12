# Universal Connector Framework (TypeScript)

A modular, testable, extensible framework for AP automation connectors across multiple ERPs. This scaffold includes connectors for **NetSuite**, **Sage Intacct**, **QuickBooks Online**, and file-based fallbacks (**CSV/XLSX**).

## Architecture

- **Canonical AP model**
  - Strongly-typed AP objects (`Vendor`, `Invoice`, `Payment`) with validation.
  - Supports `entityScope` for multi-entity/ledger and `customFields` for extensibility.
- **Core connector framework**
  - Connector interface + manifest-driven capabilities.
  - HTTP transport layer with retry + exponential backoff.
  - Auth providers: OAuth2 + API key + token cache.
  - Mapping layer for canonical ↔ ERP schemas.
  - Gap detector to compare connector capabilities/mappings against canonical requirements.
- **Connectors**
  - NetSuite REST (stub auth + manifest + mapping).
  - Sage Intacct API (stub auth + manifest + mapping).
  - QuickBooks Online (OAuth2 stub + manifest + mapping).
  - CSV/XLSX file connectors for import/export fallback.
- **CLI + test harness**
  - Commands to list connectors, validate compliance, run sync, detect gaps.
  - Vitest suite for unit/compliance/gap/sync checks.

## Project Structure

```txt
src/
  cli/index.ts
  core/
    auth.ts
    compliance.ts
    gap-detector.ts
    registry.ts
    requirements.ts
    schema.ts
    sync.ts
    transport.ts
    types.ts
  connectors/
    base.ts
    index.ts
    netsuite/index.ts
    qbo/index.ts
    sage-intacct/index.ts
    file/csv.ts
    file/xlsx.ts
  mappings/
    file.ts
    netsuite.ts
    qbo.ts
    sage-intacct.ts
  models/canonical.ts
tests/
  core.test.ts
  connectors.test.ts
  sync.test.ts
```

## Install

```bash
npm install
```

## Run

```bash
npm run typecheck
npm test
npm run cli -- list-connectors
npm run cli -- validate-connectors
npm run cli -- detect-gaps quickbooks-online
npm run cli -- run-sync quickbooks-online Invoice pull
```

## Example: Register and run a connector

```ts
import { buildDefaultRegistry, runSync } from './src/index.js';

const registry = buildDefaultRegistry();
const connector = registry.get('quickbooks-online');

await connector.initialize({
  auth: {
    clientId: process.env.QBO_CLIENT_ID ?? 'local-id',
    clientSecret: process.env.QBO_CLIENT_SECRET ?? 'local-secret',
    tokenUrl: 'stub://qbo/token'
  }
});

const result = await runSync(connector, {
  objectType: 'Vendor',
  mode: 'pull'
});

console.log(result);
```

## Security & Reliability Defaults

- Default to least privilege with connector-scoped auth config.
- Token caching with TTL to avoid over-requesting auth endpoints.
- Retry/backoff for transient API failures.
- Validation before push/upsert to reduce bad writes.
- Manifest-driven capabilities for auditability and static gap checks.

## Next Steps Backlog

1. Add per-connector idempotency keys and replay protection.
2. Add structured audit/event logging hooks with PII redaction.
3. Extend mapping engine with transforms (enum/date/amount normalization).
4. Add pagination, watermark sync, and incremental checkpointing.
5. Build mock ERP servers for richer end-to-end integration tests.
6. Add connector generator templates + lint rules for manifest/mapping completeness.
7. Add production auth flows (OAuth refresh, signed JWT, secret manager integration).
8. Add dead-letter queue patterns for failed record retries.
