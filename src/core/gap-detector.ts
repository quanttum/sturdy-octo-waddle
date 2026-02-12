import { APObjectType } from '../models/canonical.js';
import { ConnectorManifest, ConnectorOperation } from './types.js';

export interface CanonicalCapabilityRequirement {
  objectType: APObjectType;
  requiredOperations: ConnectorOperation[];
  requiredFields: string[];
}

export interface MappingCoverage {
  objectType: APObjectType;
  mappedCanonicalFields: string[];
}

export interface Gap {
  objectType: APObjectType;
  missingOperations: ConnectorOperation[];
  missingFields: string[];
}

export function detectGaps(
  requirements: CanonicalCapabilityRequirement[],
  manifest: ConnectorManifest,
  mappingCoverage: MappingCoverage[]
): Gap[] {
  return requirements
    .map((req): Gap => {
      const manifestCapability = manifest.objects.find((obj) => obj.objectType === req.objectType);
      const mapped = mappingCoverage.find((m) => m.objectType === req.objectType);

      const missingOperations = req.requiredOperations.filter(
        (op) => !manifestCapability?.operations.includes(op)
      );
      const missingFields = req.requiredFields.filter(
        (field) => !mapped?.mappedCanonicalFields.includes(field)
      );

      return {
        objectType: req.objectType,
        missingOperations,
        missingFields
      };
    })
    .filter((gap) => gap.missingOperations.length > 0 || gap.missingFields.length > 0);
}
