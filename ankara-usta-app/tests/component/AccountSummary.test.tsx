import {render,screen,act,waitFor,cleanup} from '@testing-library/react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {useAccountSummary} from '../../app/hooks/useAccountSummary';
const m=vi.hoisted(()=>({fetch:vi.fn(),auth:(_event?:string)=>{void _event;},unsubscribe:vi.fn()}));
vi.mock('next/navigation',()=>({usePathname:()=>'/'}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth:{onAuthStateChange:(callback:(event?:string)=>void)=>{m.auth=callback;return {data:{subscription:{unsubscribe:m.unsubscribe}}};}}})}));
function Demo(){const state=useAccountSummary();return <p>{state.status}:{state.user?.name??'none'}</p>;}
const response=(name:string|null)=>({ok:true,json:async()=>({user:name?{id:name,name,roles:['customer']}:null})});
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('fetch',m.fetch);vi.stubGlobal('BroadcastChannel',undefined);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('does not cancel the initial read for subscription initialization',async()=>{
  m.fetch.mockResolvedValue(response('A'));
  render(<Demo/>);
  act(()=>m.auth('INITIAL_SESSION'));
  await screen.findByText('ready:A');
  expect(m.fetch).toHaveBeenCalledOnce();
  expect(m.fetch.mock.calls[0][1].signal.aborted).toBe(false);
  act(()=>m.auth('SIGNED_OUT'));
  await waitFor(()=>expect(m.fetch).toHaveBeenCalledTimes(2));
});
it('refreshes on auth events and never restores an older response',async()=>{
  let resolveOld!:(value:unknown)=>void;
  m.fetch.mockImplementationOnce(()=>new Promise(resolve=>{resolveOld=resolve;})).mockResolvedValueOnce(response('B'));
  render(<Demo/>);expect(screen.getByText('loading:none')).toBeInTheDocument();
  act(()=>m.auth());await screen.findByText('ready:B');
  await act(async()=>resolveOld(response('A')));expect(screen.getByText('ready:B')).toBeInTheDocument();
});
it('refreshes saved profile notifications and signout without a page reload',async()=>{
  m.fetch.mockResolvedValueOnce(response('A')).mockResolvedValueOnce(response('Updated')).mockResolvedValueOnce(response(null));
  render(<Demo/>);await screen.findByText('ready:A');
  act(()=>window.dispatchEvent(new Event('orkestra-account-change')));await screen.findByText('ready:Updated');
  act(()=>m.auth());await screen.findByText('ready:none');
});
it('fails closed on malformed or failed summaries and cleans up subscription',async()=>{
  m.fetch.mockResolvedValue({ok:false});const view=render(<Demo/>);await screen.findByText('error:none');view.unmount();
  expect(m.unsubscribe).toHaveBeenCalledOnce();await waitFor(()=>expect(m.fetch).toHaveBeenCalledOnce());
});
