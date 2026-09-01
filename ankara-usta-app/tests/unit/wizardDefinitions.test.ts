import { describe, expect, it } from 'vitest';
import { services } from '../../app/data/serviceTaxonomy';
import { getWizardDefinition, wizardDefinitions } from '../../app/data/wizardDefinitions';
import { getVisibleWizardQuestions, pruneWizardAnswers, validateWizardDefinitions } from '../../app/domain';

describe('wizard definitions', () => {
  it('provides tailored wizard definitions for all 26 services', () => {
    expect(Object.keys(wizardDefinitions)).toHaveLength(26);
  });

  it('references existing services with consistent IDs', () => {
    const serviceIds = new Set(services.map((service) => service.id));

    for (const [key, definition] of Object.entries(wizardDefinitions)) {
      expect(serviceIds.has(key)).toBe(true);
      expect(definition.serviceId).toBe(key);
    }
  });

  it('uses unique question IDs and at least two options per question across all 26 services', () => {
    for (const definition of Object.values(wizardDefinitions)) {
      const questionIds = definition.questions.map((question) => question.id);

      expect(new Set(questionIds).size).toBe(questionIds.length);
      expect(definition.questions.every((question) => question.options.length >= 2)).toBe(true);
    }
  });

  it('provides fallback for generic or unlisted service IDs', () => {
    const definition = getWizardDefinition('custom-unlisted-service');
    expect(definition.serviceId).toBe('custom-unlisted-service');
    expect(definition.questions).toHaveLength(2);
  });


  it('rejects unknown services, mismatched keys, and duplicate question IDs', () => {
    const question = {id: 'scope', label: 'Kapsam?', options: ['A', 'B']};

    expect(() => validateWizardDefinitions({unknown: {serviceId: 'unknown', intro: 'Intro', questions: [question]}}, services)).toThrow(/unknown service/);
    expect(() => validateWizardDefinitions({'tv-duvar-montaji': {serviceId: 'avize-montaji', intro: 'Intro', questions: [question]}}, services)).toThrow(/does not match/);
    expect(() => validateWizardDefinitions({'tv-duvar-montaji': {serviceId: 'tv-duvar-montaji', intro: 'Intro', questions: [question, question]}}, services)).toThrow(/duplicate question/);
  });

  it('reveals conditional safety questions only after their parent answer matches', () => {
    const definition = getWizardDefinition('elektrik-arizasi');
    expect(getVisibleWizardQuestions(definition, {})).not.toEqual(expect.arrayContaining([expect.objectContaining({id:'visible-damage'})]));

    const answers = {symptom:'Yanık kokusu / kıvılcım var', 'visible-damage':'Evet, görünür hasar var'};
    expect(getVisibleWizardQuestions(definition, answers)).toEqual(expect.arrayContaining([expect.objectContaining({id:'visible-damage'})]));
    expect(pruneWizardAnswers(definition, {...answers, symptom:'Belirli odada elektrik yok'})).not.toHaveProperty('visible-damage');
  });

  it('rejects conditional questions that reference a future or unknown parent', () => {
    const definition = {
      'tv-duvar-montaji': {
        serviceId:'tv-duvar-montaji',
        intro:'Intro',
        questions:[
          {id:'child',label:'Alt soru?',options:['A','B'],showWhen:{questionId:'parent',equals:['A']}},
          {id:'parent',label:'Ana soru?',options:['A','B']},
        ],
      },
    };
    expect(() => validateWizardDefinitions(definition, services)).toThrow(/invalid conditional question reference/);
  });
});
