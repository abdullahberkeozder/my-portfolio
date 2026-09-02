import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {POST} from '../../app/api/requests/[id]/invitation/route';
const mock=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn(),single:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:mock.getUser},rpc:mock.rpc})}));
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
const send=(body:unknown,requestId=id)=>POST(new Request('https://orkestra.invalid/api/requests/x/invitation',{method:'POST',body:JSON.stringify(body)}),{params:Promise.resolve({id:requestId})});
beforeEach(()=>{
  vi.clearAllMocks();vi.stubEnv('ORKESTRA_DIRECT_REQUESTS_ENABLED','true');
  mock.getUser.mockResolvedValue({data:{user:{id:'customer'}}});
  mock.rpc.mockReturnValue({single:mock.single});mock.single.mockResolvedValue({data:{request_id:id,status:'broadened'},error:null});
});
afterEach(()=>vi.unstubAllEnvs());
it('gates writes before database access',async()=>{
  vi.stubEnv('ORKESTRA_DIRECT_REQUESTS_ENABLED','false');expect((await send({action:'broaden',confirm:true})).status).toBe(503);expect(mock.rpc).not.toHaveBeenCalled();
});
it('requires authentication',async()=>{
  mock.getUser.mockResolvedValue({data:{user:null}});expect((await send({action:'broaden',confirm:true})).status).toBe(401);expect(mock.rpc).not.toHaveBeenCalled();
});
it('rejects absent consent and invalid IDs',async()=>{
  expect((await send({action:'broaden',confirm:false})).status).toBe(400);
  expect((await send({action:'broaden',confirm:true},'invalid')).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
it('passes explicit consent but no client identity to the transactional RPC',async()=>{
  expect((await send({action:'broaden',confirm:true,customer_id:'other'})).status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith('respond_request_invitation',{p_request_id:id,p_action:'broaden',p_reason:null,p_confirm:true});
});
it('trims the public decline reason',async()=>{
  await send({action:'decline',reason:'  Bu tarihte müsait değilim.  '});
  expect(mock.rpc).toHaveBeenCalledWith('respond_request_invitation',{p_request_id:id,p_action:'decline',p_reason:'Bu tarihte müsait değilim.',p_confirm:false});
});
it('does not expose database errors',async()=>{
  mock.single.mockResolvedValue({data:null,error:{code:'42501',message:'private detail'}});
  const response=await send({action:'broaden',confirm:true});expect(response.ok).toBe(false);expect(JSON.stringify(await response.json())).not.toContain('private detail');
});
