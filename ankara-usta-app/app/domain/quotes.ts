import { z } from 'zod';
import type { Quote } from './models';

const scopeItem=z.string().trim().min(1).max(300);

export const quoteVersionInputSchema=z.object({
  laborAmountKurus:z.number().int().nonnegative().max(100_000_000_00),
  materialAmountKurus:z.number().int().nonnegative().max(100_000_000_00),
  estimatedDurationMinutes:z.number().int().positive().max(525_600),
  warrantyDays:z.number().int().min(0).max(3650),
  includedScope:z.array(scopeItem).min(1).max(20),
  excludedScope:z.array(scopeItem).max(20).default([]),
  note:z.string().trim().max(2000).optional(),
});

export type QuoteVersionInput=z.infer<typeof quoteVersionInputSchema>;

export function nextQuoteVersion(versions:readonly Pick<Quote,'version'>[]){
  return versions.reduce((maximum,quote)=>Math.max(maximum,quote.version),0)+1;
}

export function selectQuotesForComparison<T extends Pick<Quote,'id'>>(quotes:readonly T[],selectedIds:readonly string[]){
  const uniqueIds=[...new Set(selectedIds)];
  if(uniqueIds.length>3)throw new Error('At most three quotes can be compared.');
  const selected=new Set(uniqueIds);
  return quotes.filter(quote=>selected.has(quote.id));
}
