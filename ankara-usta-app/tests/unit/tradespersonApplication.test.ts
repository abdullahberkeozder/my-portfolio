import { describe, expect, it } from 'vitest';
import { tradespersonDocumentInputSchema, validateTradespersonApplication } from '../../app/domain/tradespersonApplication';

const application={displayName:'Örnek Usta',bio:'On yıldır elektrik montajı ve arıza işleri yapıyorum.',serviceIds:['elektrik-arizasi','priz-anahtar'],districts:['Çankaya']};

describe('tradesperson application validation',()=>{
  it('accepts known services and Ankara districts',()=>{
    expect(validateTradespersonApplication(application).serviceIds).toHaveLength(2);
  });

  it('rejects unknown and duplicate services',()=>{
    expect(()=>validateTradespersonApplication({...application,serviceIds:['bilinmeyen']})).toThrow('Hizmet seçimi geçersiz');
    expect(()=>validateTradespersonApplication({...application,serviceIds:['elektrik-arizasi','elektrik-arizasi']})).toThrow('Hizmet seçimi geçersiz');
  });

  it('limits verification document type and size',()=>{
    expect(tradespersonDocumentInputSchema.safeParse({kind:'professional_certificate',storagePath:'user/doc.pdf',originalName:'doc.pdf',contentType:'application/pdf',byteSize:1024}).success).toBe(true);
    expect(tradespersonDocumentInputSchema.safeParse({kind:'professional_certificate',storagePath:'user/doc.exe',originalName:'doc.exe',contentType:'application/octet-stream',byteSize:1024}).success).toBe(false);
  });
});
