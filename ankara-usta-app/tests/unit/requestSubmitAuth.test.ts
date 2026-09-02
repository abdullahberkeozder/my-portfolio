import {expect,it,vi} from 'vitest';
import {POST} from '../../app/api/requests/[id]/submit/route';
const calls=vi.hoisted(()=>({from:vi.fn(),rpc:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:async()=>({data:{user:null}})},...calls})}));
it('rejects unauthenticated publication before reading or mutating a request',async()=>{
  const response=await POST(new Request('https://orkestra.invalid/api/requests/id/submit',{method:'POST',body:JSON.stringify({idempotencyKey:crypto.randomUUID()})}),{params:Promise.resolve({id:crypto.randomUUID()})});
  expect(response.status).toBe(401);expect(calls.from).not.toHaveBeenCalled();expect(calls.rpc).not.toHaveBeenCalled();
});
