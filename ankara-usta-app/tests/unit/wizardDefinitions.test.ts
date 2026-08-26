import { describe, expect, it } from 'vitest';
import { services } from '../../app/data/serviceTaxonomy';
import { getWizardDefinition, wizardDefinitions } from '../../app/data/wizardDefinitions';
import { validateWizardDefinitions } from '../../app/domain';

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

  it('supplies a data-owned fallback for the remaining 20 services', () => {
    const fallbackServices = services.filter((service) => !wizardDefinitions[service.id]);
    expect(fallbackServices).toHaveLength(20);
    for (const service of fallbackServices) {
      const definition = getWizardDefinition(service.id);
      expect(definition.serviceId).toBe(service.id);
      expect(definition.questions).toHaveLength(2);
    }
  });

  it('rejects unknown services, mismatched keys, and duplicate question IDs', () => {
    const question = {id: 'scope', label: 'Kapsam?', options: ['A', 'B']};

    expect(() => validateWizardDefinitions({unknown: {serviceId: 'unknown', intro: 'Intro', questions: [question]}}, services)).toThrow(/unknown service/);
    expect(() => validateWizardDefinitions({'tv-duvar-montaji': {serviceId: 'avize-montaji', intro: 'Intro', questions: [question]}}, services)).toThrow(/does not match/);
    expect(() => validateWizardDefinitions({'tv-duvar-montaji': {serviceId: 'tv-duvar-montaji', intro: 'Intro', questions: [question, question]}}, services)).toThrow(/duplicate question/);
  });
});
