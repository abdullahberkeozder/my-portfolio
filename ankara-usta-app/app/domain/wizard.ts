import { z } from 'zod';
import { Service } from './models';

export const wizardQuestionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  help: z.string().trim().min(1).optional(),
  options: z.array(z.string().trim().min(1)).min(2),
  showWhen: z.object({
    questionId: z.string().trim().min(1),
    equals: z.array(z.string().trim().min(1)).min(1),
  }).optional(),
});

export const wizardDefinitionSchema = z.object({
  serviceId: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  questions: z.array(wizardQuestionSchema).min(1),
});

export type WizardQuestion = z.infer<typeof wizardQuestionSchema>;
export type WizardDefinition = z.infer<typeof wizardDefinitionSchema>;

export function getVisibleWizardQuestions(
  definition: WizardDefinition,
  answers: Record<string, string>,
): WizardQuestion[] {
  return definition.questions.filter(question => {
    if (!question.showWhen) return true;
    return question.showWhen.equals.includes(answers[question.showWhen.questionId]);
  });
}

export function pruneWizardAnswers(
  definition: WizardDefinition,
  answers: Record<string, string>,
): Record<string, string> {
  const visibleIds = new Set(getVisibleWizardQuestions(definition, answers).map(question => question.id));
  return Object.fromEntries(Object.entries(answers).filter(([questionId]) => visibleIds.has(questionId)));
}

export function validateWizardDefinitions(
  definitionsInput: unknown,
  services: Service[],
): Record<string, WizardDefinition> {
  const definitions = z.record(z.string(), wizardDefinitionSchema).parse(definitionsInput);
  const serviceIds = new Set(services.map((service) => service.id));

  for (const [key, definition] of Object.entries(definitions)) {
    if (!serviceIds.has(key)) throw new Error(`Wizard ${key} references an unknown service.`);
    if (definition.serviceId !== key) throw new Error(`Wizard key ${key} does not match serviceId ${definition.serviceId}.`);
    const questionIds = definition.questions.map((question) => question.id);
    if (new Set(questionIds).size !== questionIds.length) throw new Error(`Wizard ${key} contains duplicate question IDs.`);
    for (const [index, question] of definition.questions.entries()) {
      if (!question.showWhen) continue;
      const parentIndex = questionIds.indexOf(question.showWhen.questionId);
      if (parentIndex === -1 || parentIndex >= index) {
        throw new Error(`Wizard ${key} contains an invalid conditional question reference.`);
      }
      const parent = definition.questions[parentIndex];
      if (question.showWhen.equals.some(value => !parent.options.includes(value))) {
        throw new Error(`Wizard ${key} contains a conditional value outside its parent options.`);
      }
    }
  }

  return definitions;
}
