import { describe, it, expect } from 'vitest';
import {
  ANKARA_PILOT_SUPPORT,
  buildWhatsAppSupportUrl,
} from '../../app/lib/pilotSupport';

describe('pilotSupport module (Faz 6.3)', () => {
  it('exports valid Ankara phone digits and email', () => {
    expect(ANKARA_PILOT_SUPPORT.whatsAppDigits).toBe('903128000606');
    expect(ANKARA_PILOT_SUPPORT.phoneTel).toBe('+903128000606');
    expect(ANKARA_PILOT_SUPPORT.email).toBe('destek@ankarausta.app');
    expect(ANKARA_PILOT_SUPPORT.pilotDistricts.length).toBe(9);
    expect(ANKARA_PILOT_SUPPORT.craftTriangleHubs.length).toBe(3);
  });

  it('builds general support URL with valid wa.me formatting', () => {
    const url = buildWhatsAppSupportUrl({ category: 'general' });
    expect(url).toContain('https://wa.me/903128000606?text=');
    expect(decodeURIComponent(url)).toContain('Orkestra Ankara pilot süreci ve hizmetler hakkında');
  });

  it('builds customer request URL with district and request ID', () => {
    const url = buildWhatsAppSupportUrl({
      category: 'customer_request',
      district: 'Çankaya',
      requestId: 'req-1234',
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Çankaya bölgesindeki');
    expect(decoded).toContain('#req-1234');
  });

  it('builds artisan support URL', () => {
    const url = buildWhatsAppSupportUrl({ category: 'artisan_support' });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('zanaatkâr başvurum ve mesleki belge doğrulama');
  });

  it('builds job SOS URL with job ID and custom note', () => {
    const url = buildWhatsAppSupportUrl({
      category: 'job_sos',
      jobId: 'job-9876',
      customNote: 'Usta adrese gecikti',
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('#job-9876');
    expect(decoded).toContain('acil saha koordinasyonu');
    expect(decoded).toContain('Ek Not: Usta adrese gecikti');
  });

  it('builds dispute coordination URL', () => {
    const url = buildWhatsAppSupportUrl({
      category: 'dispute_coordination',
      jobId: 'job-5555',
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('#job-5555');
    expect(decoded).toContain('uyuşmazlık dosyam hakkında moderasyon ekibiyle');
  });
});
