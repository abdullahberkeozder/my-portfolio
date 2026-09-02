import {z} from 'zod';
import type {QuoteVersionInput} from './quotes';
export const revisionFieldLabels={price:'İşçilik bedeli',material:'Malzeme',duration:'Süre',scope:'Kapsam',warranty:'Garanti'} as const;
export const quoteRevisionRequestSchema=z.object({
  fields:z.array(z.enum(['price','material','duration','scope','warranty'])).min(1).max(5).transform(items=>[...new Set(items)].sort()),
  reason:z.string().trim().min(10).max(2000),
});
export type QuoteTerms=QuoteVersionInput;
export type QuoteRecord={id:string;request_id:string;tradesperson_id:string;version:number;status:string;supersedes_quote_id:string|null;labor_amount_kurus:number;material_amount_kurus:number;estimated_duration_minutes:number;warranty_days:number;included_scope:string[];excluded_scope:string[];note:string|null};
export function quoteTerms(row:QuoteRecord):QuoteTerms{return {laborAmountKurus:row.labor_amount_kurus,materialAmountKurus:row.material_amount_kurus,estimatedDurationMinutes:row.estimated_duration_minutes,warrantyDays:row.warranty_days,includedScope:row.included_scope,excludedScope:row.excluded_scope,note:row.note??undefined};}
const money=(value:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(value/100);
export function quoteChanges(before:QuoteTerms,after:QuoteTerms){
  const rows:{label:string;before:string;after:string}[]=[];
  const add=(label:string,a:string,b:string)=>{if(a!==b)rows.push({label,before:a||'Belirtilmedi',after:b||'Belirtilmedi'});};
  add('İşçilik',money(before.laborAmountKurus),money(after.laborAmountKurus));
  add('Malzeme',money(before.materialAmountKurus),money(after.materialAmountKurus));
  add('Toplam',money(before.laborAmountKurus+before.materialAmountKurus),money(after.laborAmountKurus+after.materialAmountKurus));
  add('Süre',`${before.estimatedDurationMinutes} dakika`,`${after.estimatedDurationMinutes} dakika`);
  add('Garanti',`${before.warrantyDays} gün`,`${after.warrantyDays} gün`);
  add('Dahil kapsam',before.includedScope.join('\n'),after.includedScope.join('\n'));
  add('Hariç kapsam',before.excludedScope.join('\n'),after.excludedScope.join('\n'));
  add('Not',before.note??'',after.note??'');return rows;
}
