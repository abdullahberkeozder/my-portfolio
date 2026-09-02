import {expect,it} from 'vitest';
import {quoteRevisionRequestSchema,quoteChanges} from '../../app/domain/quoteRevision';
import {landingPathForRoles} from '../../app/lib/authRedirect';
const terms={laborAmountKurus:10000,materialAmountKurus:5000,estimatedDurationMinutes:60,warrantyDays:30,includedScope:['Montaj'],excludedScope:['Boya'],note:'Eski not'};
it('validates revision topics and preserves a trimmed reason',()=>{
  expect(quoteRevisionRequestSchema.parse({fields:['scope','price','scope'],reason:'  Malzemeyi değiştirelim.  '})).toEqual({fields:['price','scope'],reason:'Malzemeyi değiştirelim.'});
  for(const fields of [[],['payment'],['price','price','price','price','price','price']])expect(quoteRevisionRequestSchema.safeParse({fields,reason:'Geçerli açıklama.'}).success).toBe(false);
  expect(quoteRevisionRequestSchema.safeParse({fields:['price'],reason:'Kısa'}).success).toBe(false);
});
it('shows price, total, time, warranty, scope additions/removals and note changes',()=>{
  const rows=quoteChanges(terms,{...terms,laborAmountKurus:12000,materialAmountKurus:6000,estimatedDurationMinutes:90,warrantyDays:60,includedScope:['Montaj','Malzeme'],excludedScope:[],note:undefined});
  expect(rows.map(row=>row.label)).toEqual(['İşçilik','Malzeme','Toplam','Süre','Garanti','Dahil kapsam','Hariç kapsam','Not']);
  expect(rows.find(row=>row.label==='Hariç kapsam')).toMatchObject({before:'Boya',after:'Belirtilmedi'});
  expect(rows.find(row=>row.label==='Dahil kapsam')?.after).toBe('Montaj\nMalzeme');
});
it('does not report unchanged terms or lose kuruş-level changes',()=>{
  expect(quoteChanges(terms,{...terms})).toEqual([]);
  expect(quoteChanges(terms,{...terms,laborAmountKurus:10001})).toHaveLength(2);
});
it('returns either participant role to the same quote detail after authentication',()=>{
  for(const role of ['customer','tradesperson'])expect(landingPathForRoles([role],'/teklifler/quote')).toBe('/teklifler/quote');
});
