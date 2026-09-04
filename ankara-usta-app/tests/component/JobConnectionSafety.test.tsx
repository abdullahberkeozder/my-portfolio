import {act,cleanup,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import RealtimeRefresh from '../../app/components/RealtimeRefresh';
import JobIdentityBoundary from '../../app/components/JobIdentityBoundary';
const mocks=vi.hoisted(()=>({router:{refresh:vi.fn()},status:undefined as undefined|((s:string)=>void),auth:undefined as undefined|((event:string,session:{user:{id:string}}|null)=>void),unsubscribe:vi.fn(),remove:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>mocks.router}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({
  channel:()=>{const channel={on:()=>channel,subscribe:(callback:(s:string)=>void)=>{mocks.status=callback;return channel;}};return channel;},
  removeChannel:mocks.remove,
  auth:{onAuthStateChange:(callback:typeof mocks.auth)=>{mocks.auth=callback;return{data:{subscription:{unsubscribe:mocks.unsubscribe}}};}}
})}));
beforeEach(()=>{vi.clearAllMocks();vi.useFakeTimers();});afterEach(()=>{cleanup();vi.useRealTimers();});
it('catches up after subscription/reconnection and coalesces online/focus events',()=>{
  const {unmount}=render(<RealtimeRefresh channelName="job" subscriptions={[{table:'job_messages'}]}/>);
  act(()=>{mocks.status?.('SUBSCRIBED');window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('focus'));vi.advanceTimersByTime(300);});
  expect(mocks.router.refresh).toHaveBeenCalledTimes(1);
  act(()=>{mocks.status?.('CHANNEL_ERROR');mocks.status?.('SUBSCRIBED');vi.advanceTimersByTime(300);});
  expect(mocks.router.refresh).toHaveBeenCalledTimes(2);
  act(()=>window.dispatchEvent(new Event('online')));unmount();act(()=>vi.advanceTimersByTime(300));
  expect(mocks.router.refresh).toHaveBeenCalledTimes(2);expect(mocks.remove).toHaveBeenCalledOnce();
});
it('unmounts private edits on account switch without making auth calls in the callback',()=>{
  const {unmount}=render(<JobIdentityBoundary userId="owner"><input aria-label="Private draft" defaultValue="private"/></JobIdentityBoundary>);
  act(()=>mocks.auth?.('TOKEN_REFRESHED',{user:{id:'owner'}}));expect(screen.getByLabelText('Private draft')).toBeInTheDocument();
  act(()=>mocks.auth?.('SIGNED_IN',{user:{id:'other'}}));expect(screen.queryByLabelText('Private draft')).not.toBeInTheDocument();expect(screen.getByRole('alert')).toHaveTextContent('Oturum değişti');
  unmount();expect(mocks.unsubscribe).toHaveBeenCalledOnce();
});
it('closes private content on sign out',()=>{
  render(<JobIdentityBoundary userId="owner"><p>Private workspace</p></JobIdentityBoundary>);
  act(()=>mocks.auth?.('SIGNED_OUT',null));expect(screen.queryByText('Private workspace')).not.toBeInTheDocument();
});
