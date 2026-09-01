import { describe, expect, it } from 'vitest';
import { mapDatabaseError } from '../../app/lib/apiErrors';

describe('mapDatabaseError', () => {
  it('maps unique constraint violation 23505 to user-friendly conflict message', () => {
    const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(409);
    expect(mapped.message).toContain('zaten mevcut');
    expect(mapped.correlationId).toMatch(/^err_/);
  });

  it('maps foreign key constraint 23503', () => {
    const error = { code: '23503', message: 'foreign key violation' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(400);
    expect(mapped.message).toContain('İlişkili kayıt bulunamadı');
  });

  it('maps PGRST116 to 404', () => {
    const error = { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(404);
    expect(mapped.message).toContain('Aranan kayıt bulunamadı');
  });

  it('maps permission denied 42501 to 403', () => {
    const error = { code: '42501', message: 'insufficient_privilege' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(403);
    expect(mapped.message).toContain('yetkiniz bulunmuyor');
  });

  it('falls back to friendly internal error for unknown errors', () => {
    const error = new Error('Random connection breakdown');
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(500);
    expect(mapped.code).toBe('INTERNAL_ERROR');
    expect(mapped.message).toBe('İşlem sırasında bir hata oluştu.');
  });
});
