import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {POST} from '../../app/api/quotes/[id]/revision/route';
const mock=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:mock.getUser},rpc:mock.rpc})}));
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
const other='a31e936b-d492-4d9b-a44a-a6ce932976d0';
const feedback={action:'request',expectedUserId:id,fields:['price'],reason:'İşçilik bedelini gözden geçirelim.'};
const terms={action:'revise',expectedUserId:id,laborAmountKurus:10000,materialAmountKurus:0,estimatedDurationMinutes:60,warrantyDays:30,includedScope:['Montaj'],excludedScope:[]};
const send=(body:unknown,quoteId=id)=>POST(new Request('https://orkestra.invalid/api/quotes/x/revision',{method:'POST',body:JSON.stringify(body)}),{params:Promise.resolve({id:quoteId})});
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('ORKESTRA_QUOTE_REVISIONS_ENABLED','true');mock.getUser.mockResolvedValue({data:{user:{id}}});mock.rpc.mockResolvedValue({data:{id},error:null});});
afterEach(()=>vi.unstubAllEnvs());
it('keeps the new contract disabled until rollout',async()=>{vi.stubEnv('ORKESTRA_QUOTE_REVISIONS_ENABLED','false');expect((await send(feedback)).status).toBe(503);expect(mock.rpc).not.toHaveBeenCalled();});
it('requires login and rejects a switched account before RPC',async()=>{
  expect((await send({...feedback,expectedUserId:other})).status).toBe(409);
  mock.getUser.mockResolvedValue({data:{user:null}});expect((await send(feedback)).status).toBe(401);expect(mock.rpc).not.toHaveBeenCalled();
});
it('validates quote IDs, reasons and revised amounts before writes',async()=>{
  expect((await send(feedback,'bad')).status).toBe(400);expect((await send({...feedback,reason:' '})).status).toBe(400);
  expect((await send({...terms,laborAmountKurus:-1})).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
it('records feedback without trusting client actor or target fields',async()=>{
  expect((await send({...feedback,professional_id:other,customer_id:other})).status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith('request_quote_revision',{p_quote_id:id,p_fields:['price'],p_reason:feedback.reason});
});
it('revises by base quote ID rather than using an arbitrary request/version from the client',async()=>{
  const response=await send({...terms,requestId:other,version:99});expect(response.status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith('revise_quote_version',{p_base_quote_id:id,p_labor_amount_kurus:10000,p_material_amount_kurus:0,p_estimated_duration_minutes:60,p_warranty_days:30,p_included_scope:['Montaj'],p_excluded_scope:[],p_note:null});
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
it('sanitizes denied and stale-write database errors',async()=>{
  for(const code of ['42501','23514']){mock.rpc.mockResolvedValue({data:null,error:{code,message:'private SQL sensitive'}});const response=await send(terms);expect(response.ok).toBe(false);expect(JSON.stringify(await response.json())).not.toContain('private SQL sensitive');}
});
