import {beforeEach,expect,it,vi} from 'vitest';
import {POST} from '../../app/api/account/city/route';
import {pilotCityState} from '../../app/lib/pilotCity';
const auth=vi.hoisted(()=>({getUser:vi.fn(),updateUser:vi.fn()}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth})}));
beforeEach(()=>{vi.clearAllMocks();auth.getUser.mockResolvedValue({data:{user:{id:'owner'}},error:null});auth.updateUser.mockResolvedValue({data:{user:{id:'owner'}},error:null});});
function request(body:unknown,owner='owner',origin='http://localhost:3000') {return new Request('http://localhost:3000/api/account/city',{method:'POST',headers:{origin,'Content-Type':'application/json','x-expected-user-id':owner},body:JSON.stringify(body)});}
it('updates only the authenticated user city, not roles or another profile',async()=>{
  const response=await POST(request({city:'Ankara'}));expect(response.status).toBe(200);
  expect(auth.updateUser).toHaveBeenCalledWith({data:{service_city:'Ankara'}});
  expect(response.headers.get('cache-control')).toBe('no-store');
});
it.each([{city:'İstanbul'},{city:'Ankara',role:'admin'},{city:'Ankara',userId:'other'}])('rejects unsupported or extra fields: %j',async body=>{
  expect((await POST(request(body))).status).toBe(400);expect(auth.updateUser).not.toHaveBeenCalled();
});
it('rejects a switched account',async()=>{expect((await POST(request({city:'Ankara'},'other'))).status).toBe(409);expect(auth.updateUser).not.toHaveBeenCalled();});
it('rejects unauthenticated writes',async()=>{auth.getUser.mockResolvedValue({data:{user:null},error:null});expect((await POST(request({city:'Ankara'}))).status).toBe(401);expect(auth.updateUser).not.toHaveBeenCalled();});
it('rejects cross-origin writes',async()=>{expect((await POST(request({city:'Ankara'},'owner','https://outside.example'))).status).toBe(403);expect(auth.updateUser).not.toHaveBeenCalled();});
it('does not leak provider errors',async()=>{auth.updateUser.mockResolvedValue({data:{user:null},error:{message:'private upstream detail'}});const response=await POST(request({city:'Ankara'}));expect(response.status).toBe(502);expect(await response.text()).not.toContain('private upstream');});
it('distinguishes missing, supported and outside-pilot city preferences',()=>{
  expect(pilotCityState(undefined)).toBe('unset');expect(pilotCityState({service_city:42})).toBe('unset');
  expect(pilotCityState({service_city:' ANKARA '})).toBe('ankara');expect(pilotCityState({service_city:'İstanbul'})).toBe('unsupported');
});
