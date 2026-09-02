import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {GET,POST} from '../../app/api/requests/[id]/conversation/route';
const mock=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:mock.getUser},rpc:mock.rpc})}));
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
const other='a31e936b-d492-4d9b-a44a-a6ce932976d0';
const send=(body:unknown,requestId=id)=>POST(new Request('https://orkestra.invalid/api/requests/x/conversation',{method:'POST',body:JSON.stringify(body)}),{params:Promise.resolve({id:requestId})});
const payload={action:'send',professionalId:other,expectedUserId:id,body:'  Merhaba  ',key:id};
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('ORKESTRA_PREJOB_CHAT_ENABLED','true');mock.getUser.mockResolvedValue({data:{user:{id}}});mock.rpc.mockResolvedValue({data:{acknowledgedId:id},error:null});});
afterEach(()=>vi.unstubAllEnvs());
it('disables DB access until deployment is explicitly enabled',async()=>{vi.stubEnv('ORKESTRA_PREJOB_CHAT_ENABLED','false');expect((await send(payload)).status).toBe(503);expect(mock.rpc).not.toHaveBeenCalled();});
it('requires a verified user',async()=>{mock.getUser.mockResolvedValue({data:{user:null}});expect((await send(payload)).status).toBe(401);expect(mock.rpc).not.toHaveBeenCalled();});
it('rejects account switches before mutation',async()=>{expect((await send({...payload,expectedUserId:other})).status).toBe(409);expect(mock.rpc).not.toHaveBeenCalled();});
it('passes only the pair and content to RPC, never a sender supplied by the client',async()=>{
  const result=await send({...payload,sender_id:other});expect(result.status).toBe(200);expect(result.headers.get('cache-control')).toBe('private, no-store');
  expect(mock.rpc).toHaveBeenCalledWith('request_conversation',{p_request_id:id,p_professional_id:other,p_action:'send',p_body:'Merhaba',p_key:id,p_after:0});
});
it('rejects malformed IDs, empty text, invalid cursor and missing key',async()=>{
  expect((await send(payload,'invalid')).status).toBe(400);
  expect((await send({...payload,body:' '})).status).toBe(400);
  expect((await send({...payload,key:undefined})).status).toBe(400);
  expect((await send({action:'read',professionalId:other,expectedUserId:id,sequence:-1})).status).toBe(400);
  expect(mock.rpc).not.toHaveBeenCalled();
});
it('fetches a cursor page without creating a conversation',async()=>{
  await GET(new Request(`https://orkestra.invalid/api/requests/${id}/conversation?professionalId=${other}&after=100&expectedUserId=${id}`),{params:Promise.resolve({id})});
  expect(mock.rpc).toHaveBeenCalledWith('request_conversation',{p_request_id:id,p_professional_id:other,p_action:'fetch',p_body:null,p_key:null,p_after:100});
});
it('marks only the displayed sequence read',async()=>{
  await send({action:'read',professionalId:other,expectedUserId:id,sequence:12});
  expect(mock.rpc).toHaveBeenCalledWith('request_conversation',expect.objectContaining({p_action:'read',p_after:12}));
});
it('does not return raw DB details for another participant or closed conversation',async()=>{
  for(const code of ['42501','23514']){
    mock.rpc.mockResolvedValue({data:null,error:{code,message:'private body SQL detail'}});
    const result=await send(payload);expect(result.ok).toBe(false);expect(JSON.stringify(await result.json())).not.toContain('private body SQL detail');
  }
});
