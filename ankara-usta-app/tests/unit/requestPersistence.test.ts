import { describe, expect, it } from 'vitest';
import { validateRequestDraft } from '../../app/domain/requestPersistence';

const validRequest = {
  idempotencyKey: 'f31e936b-d492-4d9b-a44a-a6ce932976d0',
  serviceId: 'tv-duvar-montaji',
  answers: {'tv-size':'32–49 inç','wall-type':'Beton / tuğla','bracket':'Evet, hazır'},
  district: 'Çankaya',
  neighborhood: 'Ayrancı',
  preferredTiming: 'Bu hafta',
};

describe('request persistence validation', () => {
  it('accepts a complete request backed by the taxonomy and wizard data', () => {
    expect(validateRequestDraft(validRequest, true).service.id).toBe('tv-duvar-montaji');
  });

  it('rejects an answer that is not offered by the service wizard', () => {
    expect(() => validateRequestDraft({...validRequest, answers:{...validRequest.answers, bracket:'Geçersiz'}})).toThrow('Invalid wizard answer');
  });

  it('rejects incomplete submissions while allowing partial drafts', () => {
    const draft = {...validRequest, answers:{'tv-size':'32–49 inç'}, district:undefined, neighborhood:undefined};
    expect(() => validateRequestDraft(draft)).not.toThrow();
    expect(() => validateRequestDraft(draft, true)).toThrow('Required scope answers');
  });
});
