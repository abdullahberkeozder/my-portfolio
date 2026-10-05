import { describe, expect, it } from 'vitest';
import {
  encodeDocumentNameWithCredential,
  formatVocationalCredential,
  isCertificateActive,
  parseVocationalCredentialFromDoc,
  tradespersonDocumentInputSchema,
  validateTradespersonApplication,
  validateVocationalCertificateNumber,
  vocationalCredentialSchema,
} from '../../app/domain/tradespersonApplication';

const application={displayName:'Örnek Usta',bio:'On yıldır elektrik montajı ve arıza işleri yapıyorum.',serviceIds:['elektrik-arizasi','priz-anahtar'],districts:['Çankaya']};

describe('tradesperson application validation (FAZ 6.6)',()=>{
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

  it('validates vocational credential input schema', () => {
    const validMyk = vocationalCredentialSchema.safeParse({
      certificateType: 'myk',
      certificateNumber: 'YB21/004812',
      level: 'level_4',
      issuingAuthority: 'Mesleki Yeterlilik Kurumu',
      expiryDate: '2028-12-31',
    });
    expect(validMyk.success).toBe(true);

    const invalidShort = vocationalCredentialSchema.safeParse({
      certificateType: 'myk',
      certificateNumber: '1',
    });
    expect(invalidShort.success).toBe(false);
  });

  it('accepts vocationalCredential in application payload', () => {
    const appWithCred = {
      ...application,
      vocationalCredential: {
        certificateType: 'myk',
        certificateNumber: 'YB21/004812',
        level: 'level_4',
        issuingAuthority: 'MYK',
      },
    };
    const validated = validateTradespersonApplication(appWithCred);
    expect(validated.vocationalCredential?.certificateNumber).toBe('YB21/004812');
    expect(validated.vocationalCredential?.level).toBe('level_4');
  });

  it('formats vocational credential for human-readable display', () => {
    const formatted = formatVocationalCredential({
      certificateType: 'myk',
      certificateNumber: 'YB21/004812',
      level: 'level_4',
      issuingAuthority: 'Mesleki Yeterlilik Kurumu',
    });
    expect(formatted).toContain('MYK Mesleki Yeterlilik Belgesi');
    expect(formatted).toContain('Seviye 4');
    expect(formatted).toContain('YB21/004812');
  });

  it('encodes and parses vocational credentials into document original name', () => {
    const encoded = encodeDocumentNameWithCredential('usta_diploma.pdf', {
      certificateType: 'myk',
      certificateNumber: 'YB21/004812',
      level: 'level_4',
    });
    expect(encoded).toBe('[MYK-level_4-YB21/004812] usta_diploma.pdf');

    const parsed = parseVocationalCredentialFromDoc(encoded);
    expect(parsed).not.toBeNull();
    expect(parsed?.certificateType).toBe('myk');
    expect(parsed?.level).toBe('level_4');
    expect(parsed?.certificateNumber).toBe('YB21/004812');
  });

  it('parses legacy and fallback document names', () => {
    const legacyParsed = parseVocationalCredentialFromDoc('MYK_Elektrik_Seviye4.pdf', 'professional_certificate');
    expect(legacyParsed).not.toBeNull();
    expect(legacyParsed?.certificateType).toBe('myk');
    expect(legacyParsed?.level).toBe('level_4');
  });

  it('validates vocational certificate numbers and tax plates', () => {
    expect(validateVocationalCertificateNumber('myk', '').valid).toBe(false);
    expect(validateVocationalCertificateNumber('myk', 'ab').valid).toBe(false);
    expect(validateVocationalCertificateNumber('myk', 'YB21/004812').valid).toBe(true);

    expect(validateVocationalCertificateNumber('tax_plate', '12345').valid).toBe(false);
    expect(validateVocationalCertificateNumber('tax_plate', '1234567890').valid).toBe(true); // 10 digit VKN
    expect(validateVocationalCertificateNumber('tax_plate', '12345678901').valid).toBe(true); // 11 digit TCKN
  });

  it('evaluates active certificate status correctly', () => {
    expect(isCertificateActive('verified', '2099-01-01')).toBe(true);
    expect(isCertificateActive('verified', null)).toBe(true);
    expect(isCertificateActive('pending', '2099-01-01')).toBe(false);
    expect(isCertificateActive('verified', '2020-01-01')).toBe(false);
  });
});
