import { describe, expect, it } from 'vitest';
import { services } from '../../app/data/serviceTaxonomy';
import { wizardDefinitions } from '../../app/data/wizardDefinitions';

describe('wizard definitions', () => {
  it('provides six service-specific wizard definitions', () => {
    expect(Object.keys(wizardDefinitions)).toHaveLength(6);
  });

  it('references existing services with consistent IDs', () => {
    const serviceIds = new Set(services.map((service) => service.id));

    for (const [key, definition] of Object.entries(wizardDefinitions)) {
      expect(serviceIds.has(key)).toBe(true);
      expect(definition.serviceId).toBe(key);
    }
  });

  it('uses unique question IDs and at least two options per question', () => {
    for (const definition of Object.values(wizardDefinitions)) {
      const questionIds = definition.questions.map((question) => question.id);

      expect(new Set(questionIds).size).toBe(questionIds.length);
      expect(definition.questions.every((question) => question.options.length >= 2)).toBe(true);
    }
  });
});
