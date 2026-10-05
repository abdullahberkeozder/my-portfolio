import { z } from 'zod';
import { services } from '../data/serviceTaxonomy';

const ankaraDistricts = ['Çankaya','Keçiören','Yenimahalle','Etimesgut','Mamak','Sincan','Altındağ','Gölbaşı','Pursaklar'] as const;

export const vocationalCredentialTypeSchema = z.enum(['myk', 'meb_mastery', 'chamber_registry', 'tax_plate']);
export type VocationalCredentialType = z.infer<typeof vocationalCredentialTypeSchema>;

export const vocationalLevelSchema = z.enum(['level_3', 'level_4', 'level_5', 'master', 'journeyman']);
export type VocationalLevel = z.infer<typeof vocationalLevelSchema>;

export const vocationalCredentialSchema = z.object({
  certificateType: vocationalCredentialTypeSchema,
  certificateNumber: z.string().trim().min(3).max(50),
  level: vocationalLevelSchema.optional(),
  issuingAuthority: z.string().trim().min(2).max(120).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verificationCode: z.string().trim().max(50).optional(),
});
export type VocationalCredential = z.infer<typeof vocationalCredentialSchema>;

export const vocationalCredentialTypeLabels: Record<VocationalCredentialType, string> = {
  myk: 'MYK Mesleki Yeterlilik Belgesi',
  meb_mastery: 'MEB Ustalık / Kalfalık Belgesi',
  chamber_registry: 'ANKESOB / Esnaf Odası Sicil Belgesi',
  tax_plate: 'Vergi Levhası / Sicil Gazetesi',
};

export const vocationalLevelLabels: Record<VocationalLevel, string> = {
  level_3: 'Seviye 3 (Zanaatkar)',
  level_4: 'Seviye 4 (Yetkili Usta)',
  level_5: 'Seviye 5 (Baş Usta / Şantiye Şefi)',
  master: 'MEB Ustalık Belgesi (3308 Sayılı Kanun)',
  journeyman: 'MEB Kalfalık Belgesi',
};

export const tradespersonApplicationInputSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(20).max(2000),
  serviceIds: z.array(z.string()).min(1).max(12),
  districts: z.array(z.enum(ankaraDistricts)).min(1).max(9),
  reference: z.object({
    name: z.string().trim().min(2).max(120),
    relationship: z.string().trim().min(2).max(120),
    phone: z.string().trim().max(30).optional(),
    note: z.string().trim().max(1000).optional(),
  }).optional(),
  vocationalCredential: vocationalCredentialSchema.optional(),
});

export const tradespersonDocumentInputSchema = z.object({
  kind: z.enum(['professional_certificate','identity','address','reference_evidence']),
  storagePath: z.string().trim().min(1).max(500),
  originalName: z.string().trim().min(1).max(255),
  contentType: z.enum(['application/pdf','image/jpeg','image/png','image/webp']),
  byteSize: z.number().int().positive().max(20_971_520),
  expiresAt: z.iso.date().optional(),
  vocationalMeta: vocationalCredentialSchema.optional(),
});

export function validateTradespersonApplication(input:unknown){
  const payload=tradespersonApplicationInputSchema.parse(input);
  const knownIds=new Set(services.map(service=>service.id));
  if(new Set(payload.serviceIds).size!==payload.serviceIds.length || payload.serviceIds.some(id=>!knownIds.has(id))){
    throw new Error('Hizmet seçimi geçersiz.');
  }
  return payload;
}

export function formatVocationalCredential(cred: VocationalCredential): string {
  const typeLabel = vocationalCredentialTypeLabels[cred.certificateType] ?? cred.certificateType;
  const levelLabel = cred.level ? ` · ${vocationalLevelLabels[cred.level] ?? cred.level}` : '';
  const no = ` · No: ${cred.certificateNumber}`;
  const auth = cred.issuingAuthority ? ` · ${cred.issuingAuthority}` : '';
  return `${typeLabel}${levelLabel}${no}${auth}`;
}

export function encodeDocumentNameWithCredential(fileName: string, cred?: Partial<VocationalCredential> | null): string {
  if (!cred?.certificateNumber) return fileName;
  const tagParts = [cred.certificateType?.toUpperCase() ?? 'DOC'];
  if (cred.level) tagParts.push(cred.level);
  tagParts.push(cred.certificateNumber.replace(/[^a-zA-Z0-9/_-]/g, ''));
  const tag = `[${tagParts.join('-')}]`;
  const sanitizedFile = fileName.replace(/^\[[^\]]+\]\s*/, '');
  const result = `${tag} ${sanitizedFile}`;
  return result.length > 250 ? result.slice(0, 250) : result;
}

export function parseVocationalCredentialFromDoc(originalName: string, kind?: string): Partial<VocationalCredential> | null {
  const bracketMatch = originalName.match(/^\[([A-Z0-9_-]+(?:-[A-Z0-9_/-]+)*)\]\s*(.*)$/i);
  if (bracketMatch) {
    const rawTag = bracketMatch[1];
    const parts = rawTag.split('-');
    const typePart = parts[0]?.toLowerCase();
    let certificateType: VocationalCredentialType = 'myk';
    if (typePart === 'meb' || typePart === 'meb_mastery') certificateType = 'meb_mastery';
    else if (typePart === 'ankesob' || typePart === 'chamber' || typePart === 'chamber_registry') certificateType = 'chamber_registry';
    else if (typePart === 'tax' || typePart === 'tax_plate' || typePart === 'vkn') certificateType = 'tax_plate';
    
    let level: VocationalLevel | undefined;
    const certNumParts: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      if (['level_3', 'level_4', 'level_5', 'master', 'journeyman'].includes(p.toLowerCase())) {
        level = p.toLowerCase() as VocationalLevel;
      } else {
        certNumParts.push(p);
      }
    }
    const certificateNumber = certNumParts.join('-') || rawTag;
    return {
      certificateType,
      certificateNumber,
      level,
    };
  }

  // Fallback keyword parsing for older naming conventions (e.g. MYK_Elektrik_Seviye4.pdf)
  const lower = originalName.toLowerCase();
  if (kind === 'professional_certificate' || lower.includes('myk') || lower.includes('ustalik') || lower.includes('seviye')) {
    let certificateType: VocationalCredentialType = 'myk';
    if (lower.includes('meb') || lower.includes('ustalik') || lower.includes('kalfalik')) {
      certificateType = 'meb_mastery';
    } else if (lower.includes('oda') || lower.includes('ankesob') || lower.includes('sicil')) {
      certificateType = 'chamber_registry';
    } else if (lower.includes('vergi') || lower.includes('vkn')) {
      certificateType = 'tax_plate';
    }

    let level: VocationalLevel | undefined;
    if (lower.includes('seviye4') || lower.includes('seviye 4') || lower.includes('level_4')) level = 'level_4';
    else if (lower.includes('seviye5') || lower.includes('seviye 5') || lower.includes('level_5')) level = 'level_5';
    else if (lower.includes('seviye3') || lower.includes('seviye 3') || lower.includes('level_3')) level = 'level_3';
    else if (lower.includes('ustalik') || lower.includes('master')) level = 'master';
    else if (lower.includes('kalfalik') || lower.includes('journeyman')) level = 'journeyman';

    return {
      certificateType,
      certificateNumber: originalName.replace(/\.[a-zA-Z0-9]+$/, ''),
      level,
    };
  }

  return null;
}

export function validateVocationalCertificateNumber(type: VocationalCredentialType, num: string): { valid: boolean; message: string } {
  const trimmed = num.trim();
  if (!trimmed) {
    return { valid: false, message: 'Belge numarası boş bırakılamaz.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, message: 'Belge numarası en az 3 karakter olmalıdır.' };
  }
  if (type === 'tax_plate') {
    const isVkn = /^\d{10}$/.test(trimmed);
    const isTckn = /^\d{11}$/.test(trimmed);
    if (!isVkn && !isTckn) {
      return { valid: false, message: 'Vergi kimlik numarası 10 haneli VKN veya 11 haneli TCKN formatında olmalıdır.' };
    }
  }
  return { valid: true, message: 'Geçerli format.' };
}

export function isCertificateActive(status?: string, expiresAt?: string | null): boolean {
  if (status !== 'verified') return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export {ankaraDistricts};

