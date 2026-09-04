import {beforeEach,describe,expect,it,vi} from 'vitest';
import {POST as messages} from '../../app/api/jobs/[id]/messages/route';
import {POST as reviews} from '../../app/api/jobs/[id]/reviews/route';
import {POST as disputes} from '../../app/api/jobs/[id]/disputes/route';
import {POST as address} from '../../app/api/jobs/[id]/address/route';
import {POST as inspection} from '../../app/api/jobs/[id]/inspection/route';
import {POST as scope} from '../../app/api/jobs/[id]/scope-changes/route';
import {POST as transition} from '../../app/api/jobs/[id]/transition/route';
import {POST as respondInspection} from '../../app/api/inspections/[id]/respond/route';
import {POST as respondScope} from '../../app/api/scope-changes/[id]/respond/route';
import {POST as upload} from '../../app/api/jobs/[id]/work-log/route';
const mocks=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn(),from:vi.fn(),storage:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:mocks.getUser},rpc:mocks.rpc,from:mocks.from,storage:{from:mocks.storage}})}));
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
beforeEach(()=>{vi.resetAllMocks();mocks.getUser.mockResolvedValue({data:{user:{id}}});mocks.rpc.mockResolvedValue({data:{id},error:null});});
const routes=[
  {name:'messages',handler:messages,body:{body:'hello',idempotencyKey:id}},
  {name:'reviews',handler:reviews,body:{rating:5,comment:'Completed on time'}},
  {name:'disputes',handler:disputes,body:{category:'quality',description:'The finished work has visible damage.'}},
  {name:'address',handler:address,body:{addressLine:'Example district, building 5'}},
  {name:'inspection',handler:inspection,body:{scheduledFor:new Date(Date.now()+86400000).toISOString()}},
  {name:'scope',handler:scope,body:{description:'Extra painting required',laborDeltaKurus:100,materialDeltaKurus:0,durationDeltaMinutes:0}},
  {name:'transition',handler:transition,body:{status:'in_progress'}},
  {name:'respondInspection',handler:respondInspection,body:{accept:true}},
  {name:'respondScope',handler:respondScope,body:{approve:true}},
];
describe.each(routes)('$name session-bound API',({handler,body})=>{
  const send=(identity:string|null=id,payload:unknown=body)=>handler(new Request('https://orkestra.invalid/api/action',{method:'POST',headers:identity?{'X-Orkestra-Expected-User':identity}:{},body:JSON.stringify(payload)}),{params:Promise.resolve({id})});
  it('rejects missing and changed identity before calling RPC',async()=>{
    for(const identity of [null,'another-account']){const response=await send(identity);expect(response.status).toBe(409);expect(await response.json()).toMatchObject({code:'ACCOUNT_CHANGED'});}
    expect(mocks.rpc).not.toHaveBeenCalled();expect(mocks.from).not.toHaveBeenCalled();
  });
  it('rejects anonymous users and invalid inputs',async()=>{
    mocks.getUser.mockResolvedValue({data:{user:null}});expect((await send()).status).toBe(401);
    expect((await send(id,{})).status).toBe(400);expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('retains the existing RPC and sanitizes permission failures',async()=>{
    expect((await send()).ok).toBe(true);expect(mocks.rpc).toHaveBeenCalledOnce();
    mocks.rpc.mockResolvedValue({data:null,error:{code:'42501',message:'secret SQL detail'}});
    const denied=await send();expect(denied.status).toBe(403);expect(denied.headers.get('cache-control')).toBe('private, no-store');
    const json=await denied.json();expect(json).toMatchObject({correlationId:expect.any(String)});expect(JSON.stringify(json)).not.toContain('secret SQL');
  });
});
it('checks upload identity before storage or metadata writes',async()=>{
  const form=new FormData();form.set('kind','before');form.set('file',new File(['image'],'before.png',{type:'image/png'}));
  // Preserve jsdom File identity; parsing multipart is owned by the platform.
  const request=new Request('https://orkestra.invalid/upload',{method:'POST',headers:{'X-Orkestra-Expected-User':'another'}});
  vi.spyOn(request,'formData').mockResolvedValue(form);
  expect((await upload(request,{params:Promise.resolve({id})})).status).toBe(409);
  expect(mocks.storage).not.toHaveBeenCalled();expect(mocks.from).not.toHaveBeenCalled();
});
