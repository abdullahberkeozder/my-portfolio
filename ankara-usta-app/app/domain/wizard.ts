import { z } from 'zod';
import { Service } from './models';

export const wizardQuestionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  help: z.string().trim().min(1).optional(),
  options: z.array(z.string().trim().min(1)).min(2),
});

export const wizardDefinitionSchema = z.object({
  serviceId: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  questions: z.array(wizardQuestionSchema).min(1),
});

export type WizardQuestion = z.infer<typeof wizardQuestionSchema>;
export type WizardDefinition = z.infer<typeof wizardDefinitionSchema>;

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
  }

  return definitions;
}
