import { describe,expect,it } from 'vitest';
import { MAX_QUOTES_PER_REQUEST, canAcceptNewQuotes, nextQuoteVersion, quoteVersionInputSchema, selectQuotesForComparison } from '../../app/domain';

describe('versioned quote rules',()=>{
  it('assigns the next monotonically increasing version',()=>{
    expect(nextQuoteVersion([{version:1},{version:3},{version:2}])).toBe(4);
  });

  it('validates common comparison fields',()=>{
    expect(quoteVersionInputSchema.safeParse({laborAmountKurus:100000,materialAmountKurus:25000,estimatedDurationMinutes:120,warrantyDays:90,includedScope:['Montaj'],excludedScope:['Boya']}).success).toBe(true);
  });

  it('limits comparison to three unique quotes',()=>{
    const quotes=[{id:'1'},{id:'2'},{id:'3'},{id:'4'}];
    expect(selectQuotesForComparison(quotes,['1','2','3'])).toHaveLength(3);
    expect(()=>selectQuotesForComparison(quotes,['1','2','3','4'])).toThrow('At most three quotes');
  });

  it('enforces maximum 4 quotes per request (Armut benchmark)', () => {
    expect(MAX_QUOTES_PER_REQUEST).toBe(4);
    expect(canAcceptNewQuotes(0)).toBe(true);
    expect(canAcceptNewQuotes(3)).toBe(true);
    expect(canAcceptNewQuotes(4)).toBe(false);
    expect(canAcceptNewQuotes(5)).toBe(false);
  });
});
