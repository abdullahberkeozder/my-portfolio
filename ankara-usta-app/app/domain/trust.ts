import {z} from 'zod';
import {disputeStatuses,moderationActions,moderationStatuses,workLogEntryKinds} from './models';

export const workLogEntryInputSchema=z.object({
  kind:z.enum(workLogEntryKinds),
  caption:z.string().trim().max(500).optional(),
  storagePath:z.string().trim().min(3).max(500).refine(path=>!path.startsWith('/')&&!path.includes('..'),{message:'Güvenli bir depolama yolu girilmelidir.'}),
  customerPublicationConsent:z.boolean().default(false),
});
export const reviewInputSchema=z.object({rating:z.number().int().min(1).max(5),comment:z.string().trim().min(10).max(2000).optional()});
export const disputeInputSchema=z.object({category:z.enum(['quality','scope','payment','conduct','damage','other']),description:z.string().trim().min(20).max(4000)});
export const moderationDecisionInputSchema=z.object({entityType:z.enum(['work_log_entry','review','dispute','tradesperson']),entityId:z.uuid(),action:z.enum(moderationActions),reason:z.string().trim().min(10).max(2000)});
export const moderationStatusSchema=z.enum(moderationStatuses);
export const disputeStatusSchema=z.enum(disputeStatuses);

export function canPublishWorkMedia(consent:boolean,status:string){return consent&&status==='approved';}
export function canCreateReview(jobStatus:string,customerId:string,actorId:string){return jobStatus==='completed'&&customerId===actorId;}
export function shouldPublishTrustMetric(completedJobs:number){return Number.isInteger(completedJobs)&&completedJobs>=5;}

export type TradespersonTier = 'apprentice' | 'journeyman' | 'master' | 'grandmaster';

export interface TradespersonLevelInfo {
  tier: TradespersonTier;
  title: string;
  badge: string;
  minJobs: number;
  minRating: number;
}

export function calculateTradespersonLevel(completedJobs: number, averageRating: number): TradespersonLevelInfo {
  const jobs = Math.max(0, Math.floor(completedJobs || 0));
  const rating = Number.isFinite(averageRating) ? averageRating : 0;

  if (jobs >= 50 && rating >= 4.85) {
    return { tier: 'grandmaster', title: 'Elit Baş Usta', badge: '💎', minJobs: 50, minRating: 4.85 };
  }
  if (jobs >= 20 && rating >= 4.75) {
    return { tier: 'master', title: 'Onaylı Usta', badge: '🥇', minJobs: 20, minRating: 4.75 };
  }
  if (jobs >= 5 && rating >= 4.5) {
    return { tier: 'journeyman', title: 'Deneyimli Kalfa', badge: '🥈', minJobs: 5, minRating: 4.5 };
  }
  return { tier: 'apprentice', title: 'Yeni Katılan Zanaatkâr', badge: '🥉', minJobs: 0, minRating: 0 };
}

export interface CertificateScopeSnapshot {
  quoteId: string | null;
  laborAmountKurus: number;
  materialAmountKurus: number;
  totalAmountKurus: number;
  includedScope: string[];
  excludedScope: string[];
  warrantyDays: number;
}

export function parseCertificateScopeSnapshot(snapshot: unknown): CertificateScopeSnapshot {
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      quoteId: null,
      laborAmountKurus: 0,
      materialAmountKurus: 0,
      totalAmountKurus: 0,
      includedScope: [],
      excludedScope: [],
      warrantyDays: 0,
    };
  }
  const obj = snapshot as Record<string, unknown>;
  const quoteId = typeof obj.quote_id === 'string' ? obj.quote_id : null;
  const laborAmountKurus = typeof obj.labor_amount_kurus === 'number' && Number.isFinite(obj.labor_amount_kurus) ? Math.max(0, Math.floor(obj.labor_amount_kurus)) : 0;
  const materialAmountKurus = typeof obj.material_amount_kurus === 'number' && Number.isFinite(obj.material_amount_kurus) ? Math.max(0, Math.floor(obj.material_amount_kurus)) : 0;
  const includedScope = Array.isArray(obj.included_scope) ? obj.included_scope.filter((s): s is string => typeof s === 'string' && s.trim().length > 0) : [];
  const excludedScope = Array.isArray(obj.excluded_scope) ? obj.excluded_scope.filter((s): s is string => typeof s === 'string' && s.trim().length > 0) : [];
  const warrantyDays = typeof obj.warranty_days === 'number' && Number.isFinite(obj.warranty_days) ? Math.max(0, Math.floor(obj.warranty_days)) : 0;

  return {
    quoteId,
    laborAmountKurus,
    materialAmountKurus,
    totalAmountKurus: laborAmountKurus + materialAmountKurus,
    includedScope,
    excludedScope,
    warrantyDays,
  };
}

export function calculateWarrantyStatus(issuedAt: string, warrantyEndsAt: string | null): {
  status: 'active' | 'expired' | 'unspecified';
  remainingDays: number | null;
} {
  if (!warrantyEndsAt) {
    return { status: 'unspecified', remainingDays: null };
  }
  const end = new Date(warrantyEndsAt).getTime();
  const now = Date.now();
  if (isNaN(end)) {
    return { status: 'unspecified', remainingDays: null };
  }
  const diffMs = end - now;
  if (diffMs <= 0) {
    return { status: 'expired', remainingDays: 0 };
  }
  const remainingDays = Math.ceil(diffMs / 86400000);
  return { status: 'active', remainingDays };
}

export function generateCertificateVerificationHash(certificateNumber: string, jobId: string): string {
  let hash = 0x811c9dc5;
  const str = `${certificateNumber}:${jobId}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const code = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `ORK-${certificateNumber}-${code}`;
}

