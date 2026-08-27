import { describe, expect, it } from 'vitest';
import { classifyService } from '../../app/lib/classifyService';
import { classificationFixtures } from '../fixtures/serviceQueries';

describe('classifyService', () => {
  it.each(classificationFixtures)('ranks $expectedServiceId first for "$query"', ({ query, expectedServiceId }) => {
    const result = classifyService(query);

    expect(result.candidates[0]?.service.id).toBe(expectedServiceId);
  });

  it('normalizes Turkish casing and punctuation', () => {
    const result = classifyService('AVİZE MONTAJI!!!');

    expect(result.candidates[0]?.service.id).toBe('avize-montaji');
    expect(result.confidence).toBe('high');
  });

  it('returns a low-confidence empty result for an unrelated query', () => {
    const result = classifyService('piyano dersi almak istiyorum');

    expect(result.confidence).toBe('low');
    expect(result.candidates).toEqual([]);
  });

  it('returns no more than three candidates', () => {
    expect(classifyService('montaj değişim onarım').candidates.length).toBeLessThanOrEqual(3);
  });

  it('explains a match using terms from the customer problem', () => {
    const result = classifyService('mutfak musluğu damlatıyor');

    expect(result.candidates[0]?.matchedTerms).toContain('musluğu');
    expect(result.candidates[0]?.explanation).toContain('musluğu');
  });
});
