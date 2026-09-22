import { describe, expect, it } from 'vitest';
import { mapDatabaseError } from '../../app/lib/apiErrors';

describe('mapDatabaseError', () => {
  it('maps unique constraint violation 23505 to user-friendly conflict message', () => {
    const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(409);
    expect(mapped.code).toBe('CONFLICT');
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
    expect(mapped.code).toBe('NOT_FOUND');
    expect(mapped.message).toContain('Aranan kayıt bulunamadı');
  });

  it('maps permission denied 42501 to 403', () => {
    const error = { code: '42501', message: 'insufficient_privilege' };
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(403);
    expect(mapped.code).toBe('FORBIDDEN');
    expect(mapped.message).toContain('yetkiniz bulunmuyor');
  });

  it('falls back to friendly internal error for unknown errors', () => {
    const error = new Error('Random connection breakdown');
    const mapped = mapDatabaseError(error);

    expect(mapped.status).toBe(500);
    expect(mapped.code).toBe('INTERNAL_ERROR');
    expect(mapped.message).toBe('İşlem sırasında bir hata oluştu.');
  });

  it('handles string messages directly with 400 default status and correlationId', () => {
    const mapped = mapDatabaseError('Oturum açmanız gerekiyor.');
    expect(mapped.status).toBe(400);
    expect(mapped.code).toBe('USER_ERROR');
    expect(mapped.message).toBe('Oturum açmanız gerekiyor.');
    expect(mapped.correlationId).toMatch(/^err_/);
  });

  it('jsonApiError returns a standardized response with no-store headers and correlationId', async () => {
    const { jsonApiError } = await import('../../app/lib/apiErrors');
    const response = jsonApiError('Geçersiz istek', undefined, 400);

    expect(response.status).toBe(400);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('X-Correlation-ID')).toMatch(/^err_/);

    const body = await response.json();
    expect(body).toMatchObject({
      error: 'Geçersiz istek',
      code: 'USER_ERROR',
      correlationId: expect.stringMatching(/^err_/),
    });
  });

  it('maps raised database exceptions to a public conflict without exposing the message',()=>{
    const mapped=mapDatabaseError({code:'P0001',message:'private function detail'},'İşlem artık uygulanamıyor.');
    expect(mapped).toMatchObject({code:'CONFLICT',status:409,message:'İşlem artık uygulanamıyor.'});
    expect(mapped.message).not.toContain('private');
  });

  it('jsonPublicError creates a stable public code without leaking internals',async()=>{
    const {jsonPublicError}=await import('../../app/lib/apiErrors');
    const response=jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    expect(response.status).toBe(401);
    const body=await response.json() as {correlationId:string};
    expect(body).toMatchObject({error:'Oturum açmanız gerekiyor.',code:'AUTH_REQUIRED',correlationId:expect.stringMatching(/^err_/)});
    expect(response.headers.get('X-Correlation-ID')).toBe(body.correlationId);
  });
});
