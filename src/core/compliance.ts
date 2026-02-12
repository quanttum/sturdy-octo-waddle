import { APObjectType } from '../models/canonical.js';
import { Connector, ConnectorOperation } from './types.js';

export interface ComplianceResult {
  connectorId: string;
  compliant: boolean;
  errors: string[];
}

const requiredByObject: Record<APObjectType, ConnectorOperation[]> = {
  Vendor: ['pull', 'upsert'],
  Invoice: ['pull', 'upsert'],
  Payment: ['pull', 'push']
};

export function validateConnectorCompliance(connector: Connector): ComplianceResult {
  const errors: string[] = [];

  for (const [objectType, requiredOps] of Object.entries(requiredByObject) as [
    APObjectType,
    ConnectorOperation[]
  ][]) {
    const capability = connector.manifest.objects.find((obj) => obj.objectType === objectType);
    if (!capability) {
      errors.push(`missing object capability for ${objectType}`);
      continue;
    }

    for (const op of requiredOps) {
      if (!capability.operations.includes(op)) {
        errors.push(`missing operation ${objectType}.${op}`);
      }
    }
  }

  return {
    connectorId: connector.manifest.connectorId,
    compliant: errors.length === 0,
    errors
  };
}
