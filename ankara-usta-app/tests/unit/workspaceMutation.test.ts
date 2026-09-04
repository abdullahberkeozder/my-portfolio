import {afterEach,describe,expect,it,vi} from 'vitest';
import {workspaceMutation} from '../../app/lib/workspaceMutation';

afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
describe('workspace mutation acknowledgement',()=>{
  it('binds JSON to the rendered identity',async()=>{
    const fetcher=vi.fn().mockResolvedValue(Response.json({message:{id:'saved'}}));vi.stubGlobal('fetch',fetcher);
    expect(await workspaceMutation('/api/jobs/a/messages',{body:'hello'},'customer')).toEqual({ok:true});
    expect(fetcher.mock.calls[0][1].headers).toMatchObject({'X-Orkestra-Expected-User':'customer','Content-Type':'application/json'});
  });
  it('lets the browser set multipart boundaries',async()=>{
    const fetcher=vi.fn().mockResolvedValue(Response.json({entry:{id:'saved'}}));vi.stubGlobal('fetch',fetcher);
    const body=new FormData();body.set('caption','Before');
    expect(await workspaceMutation('/upload',body,'owner')).toEqual({ok:true});
    expect(fetcher.mock.calls[0][1].body).toBe(body);
    expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
  });
  it.each([{},[],null,{message:null}])('does not treat malformed success as an acknowledgement: %j',async body=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json(body)));
    expect(await workspaceMutation('/mutation',{},'owner')).toMatchObject({ok:false,uncertain:true});
  });
  it.each([400,401,403,409,422,500])('sanitizes a %i response without automatically retrying',async status=>{
    const fetcher=vi.fn().mockResolvedValue(Response.json({error:'private SQL detail',correlationId:'ref-123'},{status}));vi.stubGlobal('fetch',fetcher);
    const result=await workspaceMutation('/mutation',{},'owner');
    expect(result).toMatchObject({ok:false,uncertain:status>=500});
    expect(JSON.stringify(result)).not.toContain('private SQL');
    expect(JSON.stringify(result)).toContain('ref-123');expect(fetcher).toHaveBeenCalledOnce();
  });
  it('aborts a stalled request and marks the outcome unknown',async()=>{
    vi.useFakeTimers();const fetcher=vi.fn((_url,init)=>new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new Error('aborted')))));
    vi.stubGlobal('fetch',fetcher);const pending=workspaceMutation('/mutation',{},'owner');
    await vi.advanceTimersByTimeAsync(15000);
    expect(await pending).toMatchObject({ok:false,uncertain:true});expect(fetcher).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
  });
  it('handles non-JSON responses without leaking parser errors',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<html>gateway</html>')));
    expect(await workspaceMutation('/mutation',{},'owner')).toMatchObject({ok:false,uncertain:true});
  });
});
