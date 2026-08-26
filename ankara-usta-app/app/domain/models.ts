export const deliveryModels = ['package', 'quote', 'inspection'] as const;
export type DeliveryModel = (typeof deliveryModels)[number];

export const userRoles = ['customer', 'tradesperson', 'moderator', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export const requestStatuses = [
  'draft',
  'submitted',
  'matching',
  'quotes_received',
  'provider_selected',
  'cancelled',
  'expired',
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const quoteStatuses = [
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'withdrawn',
  'expired',
] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export const jobStatuses = [
  'scheduled',
  'inspection_scheduled',
  'in_progress',
  'awaiting_customer_approval',
  'completed',
  'disputed',
  'cancelled',
] as const;
export type JobStatus = (typeof jobStatuses)[number];

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  aliases: string[];
  deliveryModel: DeliveryModel;
  popularRank?: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  title: string;
  description: [string, string];
};

export type Request = {
  id: string;
  customerId: string;
  serviceId: string;
  district: string;
  neighborhood: string;
  status: RequestStatus;
  answers: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type Quote = {
  id: string;
  requestId: string;
  tradespersonId: string;
  status: QuoteStatus;
  laborAmountKurus: number;
  materialAmountKurus: number;
  estimatedDurationMinutes: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  requestId: string;
  acceptedQuoteId: string;
  customerId: string;
  tradespersonId: string;
  status: JobStatus;
  scheduledFor?: string;
  warrantyEndsAt?: string;
  createdAt: string;
  updatedAt: string;
};
