import { z } from 'zod';
import {
  deliveryModels,
  jobStatuses,
  quoteStatuses,
  requestStatuses,
  tradespersonApplicationStatuses,
  userRoles,
  verificationDocumentKinds,
  verificationDocumentStatuses,
} from './models';

const idSchema = z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const entityIdSchema = z.string().trim().min(1);
const timestampSchema = z.iso.datetime({ offset: true });

export const deliveryModelSchema = z.enum(deliveryModels);
export const userRoleSchema = z.enum(userRoles);
export const requestStatusSchema = z.enum(requestStatuses);
export const quoteStatusSchema = z.enum(quoteStatuses);
export const jobStatusSchema = z.enum(jobStatuses);
export const tradespersonApplicationStatusSchema = z.enum(tradespersonApplicationStatuses);
export const verificationDocumentStatusSchema = z.enum(verificationDocumentStatuses);
export const verificationDocumentKindSchema = z.enum(verificationDocumentKinds);

export const serviceCategorySchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  slug: idSchema,
  icon: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.tuple([z.string().trim().min(1), z.string().trim().min(1)]),
});

export const serviceSchema = z.object({
  id: idSchema,
  categoryId: idSchema,
  name: z.string().trim().min(1),
  slug: idSchema,
  aliases: z.array(z.string().trim().min(1)).min(1),
  deliveryModel: deliveryModelSchema,
  popularRank: z.number().int().positive().optional(),
});

export const requestSchema = z.object({
  id: entityIdSchema,
  customerId: entityIdSchema,
  serviceId: idSchema,
  district: z.string().trim().min(1),
  neighborhood: z.string().trim().min(1),
  status: requestStatusSchema,
  answers: z.record(z.string(), z.string()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const quoteSchema = z.object({
  id: entityIdSchema,
  requestId: entityIdSchema,
  tradespersonId: entityIdSchema,
  status: quoteStatusSchema,
  laborAmountKurus: z.number().int().nonnegative(),
  materialAmountKurus: z.number().int().nonnegative(),
  estimatedDurationMinutes: z.number().int().positive(),
  warrantyDays: z.number().int().min(0).max(3650),
  includedScope: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
  excludedScope: z.array(z.string().trim().min(1).max(300)).max(20),
  note: z.string().trim().max(2000).optional(),
  version: z.number().int().positive(),
  supersedesQuoteId: entityIdSchema.optional(),
  acceptedAt: timestampSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const jobSchema = z.object({
  id: entityIdSchema,
  requestId: entityIdSchema,
  acceptedQuoteId: entityIdSchema,
  customerId: entityIdSchema,
  tradespersonId: entityIdSchema,
  status: jobStatusSchema,
  scheduledFor: timestampSchema.optional(),
  warrantyEndsAt: timestampSchema.optional(),
  nextEventSequence: z.number().int().nonnegative(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const tradespersonProfileSchema = z.object({
  userId: entityIdSchema,
  displayName: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(20).max(2000),
  applicationStatus: tradespersonApplicationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const tradespersonDirectoryEntrySchema = tradespersonProfileSchema.extend({
  verificationBadge: z.boolean(),
});

export const verificationDocumentSchema = z.object({
  id: entityIdSchema,
  tradespersonId: entityIdSchema,
  kind: verificationDocumentKindSchema,
  status: verificationDocumentStatusSchema,
  storagePath: z.string().trim().min(1),
  expiresAt: timestampSchema.optional(),
  verifiedAt: timestampSchema.optional(),
  verifiedBy: entityIdSchema.optional(),
  createdAt: timestampSchema,
});
