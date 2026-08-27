import { z } from 'zod';
import { services } from '../data/serviceTaxonomy';

const ankaraDistricts = ['Çankaya','Keçiören','Yenimahalle','Etimesgut','Mamak','Sincan','Altındağ','Gölbaşı','Pursaklar'] as const;

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
});

export const tradespersonDocumentInputSchema = z.object({
  kind: z.enum(['professional_certificate','identity','address','reference_evidence']),
  storagePath: z.string().trim().min(1).max(500),
  originalName: z.string().trim().min(1).max(255),
  contentType: z.enum(['application/pdf','image/jpeg','image/png','image/webp']),
  byteSize: z.number().int().positive().max(20_971_520),
  expiresAt: z.iso.date().optional(),
});

export function validateTradespersonApplication(input:unknown){
  const payload=tradespersonApplicationInputSchema.parse(input);
  const knownIds=new Set(services.map(service=>service.id));
  if(new Set(payload.serviceIds).size!==payload.serviceIds.length || payload.serviceIds.some(id=>!knownIds.has(id))){
    throw new Error('Hizmet seçimi geçersiz.');
  }
  return payload;
}

export {ankaraDistricts};

