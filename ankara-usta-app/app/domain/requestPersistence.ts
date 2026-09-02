import { z } from 'zod';
import { services } from '../data/serviceTaxonomy';
import { getWizardDefinition } from '../data/wizardDefinitions';
import { getVisibleWizardQuestions } from './wizard';
import { normalizeRequestTiming } from './requestTiming';
import { requestRoutingSchema } from './requestRouting';

export const DEFAULT_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const requestDraftPayloadSchema = z.object({
  idempotencyKey: z.uuid(),
  serviceId: z.string().trim().min(1),
  answers: z.record(z.string(), z.string().trim().min(1)).default({}),
  district: z.string().trim().max(80).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  preferredTiming: z.string().trim().max(120).optional(),
  createdAt: z.number().int().positive().optional(),
}).and(requestRoutingSchema);

export type RequestDraftPayload = z.infer<typeof requestDraftPayloadSchema>;

export function isDraftExpired(createdAt?: number, ttlMs = DEFAULT_DRAFT_TTL_MS): boolean {
  if (!createdAt) return false;
  return Date.now() - createdAt > ttlMs;
}

export function createTtlDraft(payload: Omit<RequestDraftPayload, 'createdAt'>): RequestDraftPayload {
  return {
    ...payload,
    createdAt: Date.now(),
  };
}

export function validateRequestDraft(input: unknown, requireComplete = false) {
  const payload = requestDraftPayloadSchema.parse(input);
  if (payload.preferredTiming) payload.preferredTiming = normalizeRequestTiming(payload.preferredTiming);
  if (payload.createdAt && isDraftExpired(payload.createdAt)) {
    throw new Error('Draft has expired.');
  }

  const service = services.find((item) => item.id === payload.serviceId);
  if (!service) throw new Error('Unknown service.');

  const definition = getWizardDefinition(service.id);
  const visibleQuestions = getVisibleWizardQuestions(definition, payload.answers);
  const questions = new Map(visibleQuestions.map((question) => [question.id, question]));
  for (const [questionId, answer] of Object.entries(payload.answers)) {
    const question = questions.get(questionId);
    if (!question || !question.options.includes(answer)) throw new Error('Invalid wizard answer.');
  }

  if (requireComplete) {
    if (!visibleQuestions.every((question) => payload.answers[question.id])) {
      throw new Error('Required scope answers are missing.');
    }
    if (!payload.district || !payload.neighborhood || !payload.preferredTiming) {
      throw new Error('Location and timing are required.');
    }
  }

  return {payload, service};
}
