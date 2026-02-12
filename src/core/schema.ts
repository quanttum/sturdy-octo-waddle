import { MappingDefinition } from './types.js';

export class Mapper {
  toExternal<TCanonical extends Record<string, unknown>>(
    mapping: MappingDefinition,
    canonical: TCanonical
  ): Record<string, unknown> {
    return this.applyMap(mapping.toExternal, canonical);
  }

  toCanonical(mapping: MappingDefinition, external: Record<string, unknown>): Record<string, unknown> {
    return this.applyMap(mapping.toCanonical, external);
  }

  private applyMap(map: Record<string, string>, source: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [from, to] of Object.entries(map)) {
      const value = this.getNestedValue(source, from);
      if (value !== undefined) {
        this.setNestedValue(result, to, value);
      }
    }

    return result;
  }

  private getNestedValue(source: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, segment) => {
      if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[segment];
      }
      return undefined;
    }, source);
  }

  private setNestedValue(target: Record<string, unknown>, path: string, value: unknown): void {
    const segments = path.split('.');
    const last = segments.pop();
    if (!last) return;

    let current: Record<string, unknown> = target;
    for (const segment of segments) {
      if (!(segment in current) || typeof current[segment] !== 'object' || !current[segment]) {
        current[segment] = {};
      }
      current = current[segment] as Record<string, unknown>;
    }

    current[last] = value;
  }
}
