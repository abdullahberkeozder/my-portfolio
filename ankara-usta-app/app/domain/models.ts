export const deliveryModels = ['package', 'quote', 'inspection'] as const;
export type DeliveryModel = (typeof deliveryModels)[number];

export const userRoles = ['customer', 'tradesperson', 'moderator', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export const tradespersonApplicationStatuses = [
  'draft',
  'submitted',
  'under_review',
  'needs_changes',
  'approved',
  'rejected',
  'reassessment_required',
  'suspended',
] as const;
export type TradespersonApplicationStatus = (typeof tradespersonApplicationStatuses)[number];

export const verificationDocumentStatuses = ['pending', 'verified', 'rejected', 'expired'] as const;
export type VerificationDocumentStatus = (typeof verificationDocumentStatuses)[number];

export const verificationDocumentKinds = ['professional_certificate', 'identity', 'address', 'reference_evidence'] as const;
export type VerificationDocumentKind = (typeof verificationDocumentKinds)[number];

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
  warrantyDays: number;
  includedScope: string[];
  excludedScope: string[];
  note?: string;
  version: number;
  supersedesQuoteId?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TradespersonAvailability = {
  availableFrom: string;
  availableTo: string;
  acceptsUrgent: boolean;
  active: boolean;
};

export type MatchScoreComponents = {
  service: number;
  district: number;
  availability: number;
  verification: number;
  neighborhood: number;
  references: number;
};

export type MatchDecision = {
  tradespersonId: string;
  eligible: boolean;
  score: number;
  components: MatchScoreComponents;
  reasons: string[];
  rejectedBy: string[];
};

export const supplyStates = ['no_supply','limited_supply','healthy'] as const;
export type SupplyState = (typeof supplyStates)[number];

export type Job = {
  id: string;
  requestId: string;
  acceptedQuoteId: string;
  customerId: string;
  tradespersonId: string;
  status: JobStatus;
  scheduledFor?: string;
  warrantyEndsAt?: string;
  nextEventSequence: number;
  createdAt: string;
  updatedAt: string;
};

export type JobParticipantRole = 'customer'|'tradesperson'|'admin'|'system';

export type JobEvent = {
  id:string;
  jobId:string;
  sequence:number;
  eventType:string;
  actorId?:string;
  actorRole:JobParticipantRole;
  payload:Record<string,unknown>;
  createdAt:string;
};

export type JobMessage = {
  id:string;
  jobId:string;
  eventId:string;
  senderId:string;
  body:string;
  createdAt:string;
};

export const scopeChangeStatuses=['pending','approved','rejected','cancelled'] as const;
export type ScopeChangeStatus=(typeof scopeChangeStatuses)[number];

export type ScopeChange={
  id:string;
  jobId:string;
  proposerId:string;
  description:string;
  laborDeltaKurus:number;
  materialDeltaKurus:number;
  durationDeltaMinutes:number;
  includedScope:string[];
  excludedScope:string[];
  customerApprovedAt?:string;
  tradespersonApprovedAt?:string;
  status:ScopeChangeStatus;
  createdAt:string;
};

export type TradespersonProfile = {
  userId: string;
  displayName: string;
  bio: string;
  applicationStatus: TradespersonApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type TradespersonDirectoryEntry = TradespersonProfile & {
  verificationBadge: boolean;
};

export type VerificationDocument = {
  id: string;
  tradespersonId: string;
  kind: VerificationDocumentKind;
  status: VerificationDocumentStatus;
  storagePath: string;
  expiresAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
};

export const workLogEntryKinds=['before','progress','material','after'] as const;
export type WorkLogEntryKind=(typeof workLogEntryKinds)[number];
export const moderationStatuses=['pending','approved','rejected','hidden'] as const;
export type ModerationStatus=(typeof moderationStatuses)[number];
export const disputeStatuses=['open','under_review','awaiting_evidence','resolved','dismissed'] as const;
export type DisputeStatus=(typeof disputeStatuses)[number];
export const moderationActions=['approve','reject','hide','restore','warn','suspend'] as const;
export type ModerationAction=(typeof moderationActions)[number];

export type WorkLogEntry={id:string;jobId:string;authorId:string;kind:WorkLogEntryKind;caption?:string;storagePath:string;customerPublicationConsent:boolean;moderationStatus:ModerationStatus;createdAt:string};
export type Review={id:string;jobId:string;customerId:string;tradespersonId:string;rating:number;comment?:string;moderationStatus:ModerationStatus;createdAt:string};
export type WorkmanshipCertificate={id:string;jobId:string;certificateNumber:string;issuedAt:string;warrantyEndsAt?:string;scopeSnapshot:Record<string,unknown>};
export type DisputeCase={id:string;jobId:string;openedBy:string;category:string;description:string;status:DisputeStatus;resolution?:string;createdAt:string;updatedAt:string};
export type ModerationDecision={id:string;entityType:string;entityId:string;action:ModerationAction;actorId:string;reason:string;createdAt:string};
