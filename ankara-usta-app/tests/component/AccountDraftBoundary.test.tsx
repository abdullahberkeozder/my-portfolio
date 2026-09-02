import {render,screen,waitFor,cleanup,act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import AccountDraftBoundary,{draftAccountKey} from '../../app/components/AccountDraftBoundary';
const auth=vi.hoisted(()=>({getUser:vi.fn(),onAuthStateChange:vi.fn()}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth})}));
beforeEach(()=>{
  localStorage.clear();sessionStorage.clear();window.history.replaceState({},'','/');
  auth.getUser.mockResolvedValue({data:{user:{id:'account-a'}},error:null});
  auth.onAuthStateChange.mockReturnValue({data:{subscription:{unsubscribe:vi.fn()}}});
});
afterEach(cleanup);
const mount=()=>render(<AccountDraftBoundary kind="request:tv" ttl={86400000}>{scope=><p>Form: {scope.storage.getItem(scope.key)??'empty'}</p>}</AccountDraftBoundary>);
it('does not expose another account or legacy draft',async()=>{
  localStorage.setItem(draftAccountKey('request:tv','account-b'),JSON.stringify({updatedAt:Date.now(),secret:'private-b'}));
  localStorage.setItem('ankara-usta:draft:tv',JSON.stringify({secret:'legacy'}));
  mount();expect(await screen.findByText('Form: empty')).toBeVisible();expect(screen.queryByText(/private-b/)).toBeNull();
});
it('requires explicit continue before mounting a saved draft',async()=>{
  localStorage.setItem(draftAccountKey('request:tv','account-a'),JSON.stringify({updatedAt:Date.now(),value:'mine'}));
  mount();await screen.findByText('Kayıtlı taslağınız var');expect(screen.queryByText(/Form:/)).toBeNull();
  await userEvent.click(screen.getByRole('button',{name:'Hesabımdaki taslağa devam et'}));expect(screen.getByText(/Form:.*mine/)).toBeVisible();
});
it('deletes only the current account draft',async()=>{
  const a=draftAccountKey('request:tv','account-a'),b=draftAccountKey('request:tv','account-b');
  localStorage.setItem(a,JSON.stringify({updatedAt:Date.now()}));localStorage.setItem(b,'other');
  mount();await userEvent.click(await screen.findByRole('button',{name:'Taslağı sil ve yeni başla'}));
  expect(localStorage.getItem(a)).toBeNull();expect(localStorage.getItem(b)).toBe('other');
});
it('transfers a same-tab anonymous draft only after explicit consent',async()=>{
  window.history.replaceState({},'','/?resume=1');const key=draftAccountKey('request:tv','guest');
  sessionStorage.setItem(key,JSON.stringify({updatedAt:Date.now(),value:'guest-scope',requestId:'stale'}));sessionStorage.setItem('orkestra:draft-handoff',key);
  mount();await userEvent.click(await screen.findByRole('button',{name:'Giriş öncesi taslağı bu hesaba aktar ve devam et'}));
  const stored=JSON.parse(localStorage.getItem(draftAccountKey('request:tv','account-a'))!);
  expect(stored.value).toBe('guest-scope');expect(stored.requestId).toBeUndefined();expect(sessionStorage.getItem(key)).toBeNull();
});
it('fails closed on network auth errors',async()=>{
  auth.getUser.mockResolvedValue({data:{user:null},error:{name:'AuthRetryableFetchError'}});mount();
  await waitFor(()=>expect(screen.getByRole('alert')).toBeVisible());expect(screen.queryByText(/Form:/)).toBeNull();
});
it('unmounts the old account form immediately when the session changes',async()=>{
  mount();await screen.findByText('Form: empty');
  auth.getUser.mockImplementation(()=>new Promise(()=>{}));
  const listener=auth.onAuthStateChange.mock.calls.at(-1)![0];
  act(()=>listener('SIGNED_IN',{user:{id:'account-b'}}));
  expect(screen.queryByText(/Form:/)).toBeNull();
  expect(screen.getByRole('status')).toHaveTextContent('Hesap ve taslak kontrol ediliyor');
});
