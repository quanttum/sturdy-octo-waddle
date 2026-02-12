#!/usr/bin/env node
import { buildDefaultRegistry } from '../connectors/index.js';
import { validateConnectorCompliance } from '../core/compliance.js';
import { runSync } from '../core/sync.js';
import { canonicalRequirements, coverageFromMappings } from '../core/requirements.js';
import { detectGaps } from '../core/gap-detector.js';
import { netSuiteMappings } from '../mappings/netsuite.js';
import { sageIntacctMappings } from '../mappings/sage-intacct.js';
import { qboMappings } from '../mappings/qbo.js';
import { fileConnectorMappings } from '../mappings/file.js';

const registry = buildDefaultRegistry();
const [command, ...args] = process.argv.slice(2);

async function main(): Promise<void> {
  switch (command) {
    case 'list-connectors': {
      registry.list().forEach((connector) => {
        console.log(`${connector.manifest.connectorId}: ${connector.manifest.displayName}`);
      });
      break;
    }
    case 'validate-connectors': {
      registry.list().forEach((connector) => {
        const result = validateConnectorCompliance(connector);
        console.log(`${result.connectorId}: ${result.compliant ? 'PASS' : 'FAIL'}`);
        if (!result.compliant) result.errors.forEach((error) => console.log(`  - ${error}`));
      });
      break;
    }
    case 'run-sync': {
      const [connectorId, objectType, mode] = args;
      if (!connectorId || !objectType || !mode) {
        throw new Error('usage: run-sync <connectorId> <Vendor|Invoice|Payment> <pull|push>');
      }
      const connector = registry.get(connectorId);
      await connector.initialize({ auth: {}, defaults: {} });
      const result = await runSync(connector, {
        objectType: objectType as 'Vendor' | 'Invoice' | 'Payment',
        mode: mode as 'pull' | 'push'
      });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'detect-gaps': {
      const [connectorId] = args;
      if (!connectorId) throw new Error('usage: detect-gaps <connectorId>');
      const connector = registry.get(connectorId);
      const mappingCoverageMap: Record<string, ReturnType<typeof coverageFromMappings>> = {
        'netsuite-rest': coverageFromMappings(netSuiteMappings),
        'sage-intacct-api': coverageFromMappings(sageIntacctMappings),
        'quickbooks-online': coverageFromMappings(qboMappings),
        'file-csv': coverageFromMappings(fileConnectorMappings),
        'file-xlsx': coverageFromMappings(fileConnectorMappings)
      };

      const gaps = detectGaps(
        canonicalRequirements,
        connector.manifest,
        mappingCoverageMap[connectorId] ?? []
      );
      console.log(JSON.stringify(gaps, null, 2));
      break;
    }
    default:
      console.log('Commands: list-connectors | validate-connectors | run-sync | detect-gaps');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
