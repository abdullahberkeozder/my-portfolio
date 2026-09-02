import { z } from 'zod';

export const requestRoutingSchema = z.object({
  routingMode: z.enum(['open', 'direct']).default('open'),
  targetProfessionalId: z.uuid().optional(),
}).superRefine((value, context) => {
  if ((value.routingMode === 'direct') !== Boolean(value.targetProfessionalId)) {
    context.addIssue({code: 'custom', path: ['targetProfessionalId'], message: 'Direct requests require exactly one target; open requests cannot have a target.'});
  }
});

export type RequestRouting = z.infer<typeof requestRoutingSchema>;
export type RequestTarget = {id: string; name: string; districts: string[]};

export function requestDraftKind(serviceId: string, targetId?: string) {
  return `request:${serviceId}${targetId ? `:direct:${targetId}` : ''}`;
}

export function requestResumePath(serviceId: string, targetId?: string) {
  const query = new URLSearchParams({resume: '1', service: serviceId});
  return `${targetId ? `/ustalar/${encodeURIComponent(targetId)}/talep` : '/'}?${query}`;
}
