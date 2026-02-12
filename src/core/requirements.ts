import { CanonicalCapabilityRequirement, MappingCoverage } from './gap-detector.js';

export const canonicalRequirements: CanonicalCapabilityRequirement[] = [
  {
    objectType: 'Vendor',
    requiredOperations: ['pull', 'upsert'],
    requiredFields: ['id', 'displayName', 'status', 'entityScope.entityId']
  },
  {
    objectType: 'Invoice',
    requiredOperations: ['pull', 'upsert'],
    requiredFields: [
      'id',
      'vendorId',
      'invoiceNumber',
      'invoiceDate',
      'currency',
      'totalAmount',
      'entityScope.entityId'
    ]
  },
  {
    objectType: 'Payment',
    requiredOperations: ['pull', 'push'],
    requiredFields: ['id', 'invoiceId', 'amount', 'paymentDate', 'entityScope.entityId']
  }
];

export function coverageFromMappings(
  mappings: Array<{ objectType: 'Vendor' | 'Invoice' | 'Payment'; toExternal: Record<string, string> }>
): MappingCoverage[] {
  return mappings.map((m) => ({ objectType: m.objectType, mappedCanonicalFields: Object.keys(m.toExternal) }));
}
