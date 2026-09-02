import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {POST} from '../../app/api/requests/draft/route';
const mock=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn(),single:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:mock.getUser},rpc:mock.rpc})}));
const target='f31e936b-d492-4d9b-a44a-a6ce932976d0';
const payload=()=>({idempotencyKey:crypto.randomUUID(),serviceId:'tv-duvar-montaji',answers:{}});
const send=(body:unknown)=>POST(new Request('https://orkestra.invalid/api/requests/draft',{method:'POST',body:JSON.stringify(body)}));
beforeEach(()=>{
  vi.clearAllMocks();vi.stubEnv('ORKESTRA_DIRECT_REQUESTS_ENABLED','true');
  mock.getUser.mockResolvedValue({data:{user:{id:'customer'}}});
  mock.rpc.mockReturnValue({single:mock.single});mock.single.mockResolvedValue({data:{id:'draft',target_professional_id:target},error:null});
});
afterEach(()=>vi.unstubAllEnvs());
it('requires login before invoking a draft RPC',async()=>{
  mock.getUser.mockResolvedValue({data:{user:null}});expect((await send(payload())).status).toBe(401);expect(mock.rpc).not.toHaveBeenCalled();
});
it('rejects direct publication while rollout is disabled',async()=>{
  vi.stubEnv('ORKESTRA_DIRECT_REQUESTS_ENABLED','false');expect((await send({...payload(),routingMode:'direct',targetProfessionalId:target})).status).toBe(503);expect(mock.rpc).not.toHaveBeenCalled();
});
it('passes the recipient to the dedicated transactional RPC',async()=>{
  const response=await send({...payload(),routingMode:'direct',targetProfessionalId:target});
  expect(response.status).toBe(200);expect(mock.rpc).toHaveBeenCalledWith('upsert_direct_request_draft',expect.objectContaining({p_target_professional_id:target}));
});
it('keeps the original open request RPC and payload compatible',async()=>{
  mock.single.mockResolvedValue({data:{id:'draft'},error:null});expect((await send(payload())).status).toBe(200);
  expect(mock.rpc.mock.calls[0][0]).toBe('upsert_request_draft');expect(mock.rpc.mock.calls[0][1]).not.toHaveProperty('p_target_professional_id');
});
it('rejects an inconsistent target without writing',async()=>{
  expect((await send({...payload(),routingMode:'open',targetProfessionalId:target})).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
it('does not expose raw database messages',async()=>{
  mock.single.mockResolvedValue({data:null,error:{code:'23514',message:'secret database detail'}});
  const result=await send({...payload(),routingMode:'direct',targetProfessionalId:target});
  expect(result.ok).toBe(false);expect(JSON.stringify(await result.json())).not.toContain('secret database detail');
});
