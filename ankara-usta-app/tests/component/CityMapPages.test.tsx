import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import AccountPage from '../../app/hesap/page';
import MyRequestsPage from '../../app/taleplerim/page';
import TradespersonRequestsPage from '../../app/usta/talepler/page';
const state=vi.hoisted(()=>({user:{id:'owner',email:'example@example.test',user_metadata:{service_city:'Ankara'}},requests:[] as Record<string,unknown>[],error:null as null|{message:string}}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>{
  const query={data:state.requests,error:state.error,count:state.requests.length,select:vi.fn(),eq:vi.fn(),order:vi.fn(),range:vi.fn(),maybeSingle:vi.fn()};
  for(const method of ['select','eq','order','range','maybeSingle'] as const)query[method].mockReturnValue(query);
  return {auth:{getUser:async()=>({data:{user:state.user}})},from:()=>query};
}}));
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()}),redirect:vi.fn()}));
vi.mock('../../app/hooks/useAccountSummary',()=>({useAccountSummary:()=>({status:'ready',user:{id:'owner',name:'Test',roles:['customer']}})}));
vi.mock('../../app/lib/directedRequests',()=>({directedRequestsEnabled:()=>false}));
vi.mock('../../app/lib/prejobChat',()=>({prejobChatEnabled:()=>false}));
afterEach(()=>{cleanup();state.requests=[];state.error=null;});
it('puts submitted requests before the auxiliary map',async()=>{
  state.requests=[{id:'request',service_id:'fixture-service',status:'submitted',updated_at:'2026-09-03T10:00:00Z'}];
  render(await MyRequestsPage({searchParams:Promise.resolve({})}));
  const action=screen.getByRole('link',{name:'Eşleşme ve teklifler →'});
  expect(action.compareDocumentPosition(screen.getByRole('region',{name:'Bölge haritası'}))&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('puts request loading errors before the map',async()=>{
  state.error={message:'unavailable'};render(await MyRequestsPage({searchParams:Promise.resolve({})}));
  const error=screen.getByRole('heading',{name:'Talepler yüklenemedi'});
  expect(error.compareDocumentPosition(screen.getByRole('region',{name:'Bölge haritası'}))&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('keeps the customer dashboard and includes the saved-city map',async()=>{
  render(await MyRequestsPage({searchParams:Promise.resolve({})}));
  expect(screen.getByRole('heading',{name:'Taleplerim',level:1})).toBeInTheDocument();
  const empty=screen.getByRole('heading',{name:'Henüz talebiniz yok'});
  const map=screen.getByRole('region',{name:'Bölge haritası'});
  expect(empty.compareDocumentPosition(map)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByTitle(/Ankara şehir haritası/)).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Ankara haritasını göster'})).toHaveAttribute('aria-expanded','false');
});
it('keeps professional opportunities and includes the saved-city map',async()=>{
  render(await TradespersonRequestsPage({searchParams:Promise.resolve({})}));
  expect(screen.getByRole('heading',{name:'İş fırsatları',level:1})).toBeInTheDocument();
  expect(screen.getByText('Hesabınıza kaydettiğiniz şehir: Ankara.')).toBeInTheDocument();
});
it('offers the city setting on the account page',async()=>{
  render(await AccountPage());expect(screen.getByLabelText('Şehir')).toHaveValue('Ankara');
  expect(screen.getByText('Kayıtlı şehir: Ankara')).toBeInTheDocument();
});
