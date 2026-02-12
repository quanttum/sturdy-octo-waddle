import { ConnectorRegistry } from '../core/registry.js';
import { NetSuiteConnector } from './netsuite/index.js';
import { SageIntacctConnector } from './sage-intacct/index.js';
import { QboConnector } from './qbo/index.js';
import { CsvFileConnector } from './file/csv.js';
import { XlsxFileConnector } from './file/xlsx.js';

export function buildDefaultRegistry(): ConnectorRegistry {
  const registry = new ConnectorRegistry();
  registry.register(new NetSuiteConnector());
  registry.register(new SageIntacctConnector());
  registry.register(new QboConnector());
  registry.register(new CsvFileConnector());
  registry.register(new XlsxFileConnector());
  return registry;
}
