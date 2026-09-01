import { describe,expect,it } from 'vitest';
import { nextQuoteVersion,quoteVersionInputSchema,selectQuotesForComparison } from '../../app/domain';

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
});
