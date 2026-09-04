import {render,screen,cleanup,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import RequestWizard from '../../app/components/RequestWizard';
import {services} from '../../app/data/serviceTaxonomy';
import {requestDraftKind,requestResumePath} from '../../app/domain/requestRouting';

const auth=vi.hoisted(()=>({guest:false}));
vi.mock('../../app/components/AccountDraftBoundary',()=>({default:({kind,children}:{kind:string;children:(scope:unknown)=>unknown})=>children({key:kind,storage:sessionStorage,guest:auth.guest})}));
const target={id:'f31e936b-d492-4d9b-a44a-a6ce932976d0',name:'Test Ustası',districts:['Çankaya']};
const service=services.find(s=>s.id==='tv-duvar-montaji')!;
const key=requestDraftKind(service.id,target.id);
const saved=()=>({answers:{'tv-size':'32–49 inç','wall-type':'Beton / tuğla',bracket:'Evet, hazır'},district:'Çankaya',neighborhood:'Ayrancı',timing:'this_week',step:3,questionIndex:1,idempotencyKey:crypto.randomUUID(),updatedAt:Date.now(),routingMode:'direct',targetProfessionalId:target.id});
beforeEach(()=>{auth.guest=false;sessionStorage.clear();vi.unstubAllGlobals();});
afterEach(cleanup);
it('requires an explicit final confirmation from a signed-in member before publishing',async()=>{
  sessionStorage.setItem(key,JSON.stringify(saved()));
  const fetchMock=vi.fn().mockResolvedValueOnce({ok:true,status:200,json:async()=>({request:{id:'draft-id'}})}).mockResolvedValueOnce({ok:true,status:200,json:async()=>({})});
  vi.stubGlobal('fetch',fetchMock);
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByRole('link',{name:'Giriş yap / kayıt ol ve devam et'})).toBeNull();
  await userEvent.click(screen.getByRole('button',{name:'Bu ustaya talebi gönder'}));
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls[1][0]).toBe('/api/requests/draft-id/submit');
  expect(await screen.findByRole('heading',{name:'Ustalara iletilmek üzere hazır'})).toBeVisible();
  expect(screen.getByRole('link',{name:'Talebi görüntüle'})).toHaveAttribute('href','/taleplerim/draft-id/teklifler?created=1');
  expect(sessionStorage.getItem(key)).toBeNull();
});
it('offers login again if the session expires between saving and publication',async()=>{
  sessionStorage.setItem(key,JSON.stringify(saved()));
  const fetchMock=vi.fn().mockResolvedValueOnce({ok:true,status:200,json:async()=>({request:{id:'draft-id'}})}).mockResolvedValueOnce({ok:false,status:401,json:async()=>({})});
  vi.stubGlobal('fetch',fetchMock);
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  await userEvent.click(screen.getByRole('button',{name:'Bu ustaya talebi gönder'}));
  await screen.findByRole('link',{name:'Giriş yap / kayıt ol ve devam et'});
  expect(screen.queryByText('Talep alındı')).toBeNull();
  expect(sessionStorage.getItem(key)).not.toBeNull();
  expect(screen.queryByRole('button',{name:'Bu ustaya talebi gönder'})).toBeNull();
});
it('asks guests to register on the final step without attempting any remote write',async()=>{
  auth.guest=true;
  const draft=saved();sessionStorage.setItem(key,JSON.stringify(draft));
  const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  expect(screen.queryByRole('button',{name:'Bu ustaya talebi gönder'})).toBeNull();
  const link=screen.getByRole('link',{name:'Giriş yap / kayıt ol ve devam et'});
  expect(link).toHaveAttribute('href',`/giris?next=${encodeURIComponent(requestResumePath(service.id,target.id))}`);
  // Cancel navigation after the React handoff handler has saved its marker.
  document.addEventListener('click',event=>event.preventDefault(),{once:true});
  await userEvent.click(link);
  expect(sessionStorage.getItem('orkestra:draft-handoff')).toBe(key);
  expect(JSON.parse(sessionStorage.getItem(key)!)).toMatchObject({step:3,targetProfessionalId:target.id,idempotencyKey:draft.idempotencyKey});
  expect(fetchMock).not.toHaveBeenCalled();
});
it('preserves target, exact step and key through login handoff and remount',async()=>{
  const draft=saved();sessionStorage.setItem(key,JSON.stringify(draft));
  const fetchMock=vi.fn().mockResolvedValue({status:401,ok:false,json:async()=>({})});vi.stubGlobal('fetch',fetchMock);
  const view=render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  expect(screen.getByText(/Talebin muhatabı: Test Ustası/)).toBeVisible();
  await userEvent.click(screen.getByRole('button',{name:'Bu ustaya talebi gönder'}));
  const link=await screen.findByRole('link',{name:'Giriş yap / kayıt ol ve devam et'});
  expect(link).toHaveAttribute('href',`/giris?next=${encodeURIComponent(requestResumePath(service.id,target.id))}`);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({routingMode:'direct',targetProfessionalId:target.id,idempotencyKey:draft.idempotencyKey});
  // Avoid navigation in jsdom; persistence is verified before following the link.
  const stored=JSON.parse(sessionStorage.getItem(key)!);
  expect(stored).toMatchObject({step:3,targetProfessionalId:target.id,idempotencyKey:draft.idempotencyKey});
  view.unmount();fetchMock.mockClear();
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  expect(screen.getByText(/Talebin muhatabı: Test Ustası/)).toBeVisible();expect(fetchMock).not.toHaveBeenCalled();
});
it('fails closed on a cached different recipient without overwriting it',()=>{
  const raw=JSON.stringify({...saved(),targetProfessionalId:crypto.randomUUID()});sessionStorage.setItem(key,raw);
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Taslağın hedefi');
  expect(sessionStorage.getItem(key)).toBe(raw);expect(screen.queryByRole('button',{name:'Bu ustaya talebi gönder'})).toBeNull();
});
it('cannot submit a restored location outside the target working area',async()=>{
  sessionStorage.setItem(key,JSON.stringify({...saved(),district:'Mamak'}));const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
  render(<RequestWizard service={service} targetProfessional={target} onClose={vi.fn()}/>);
  await userEvent.click(screen.getByRole('button',{name:'Bu ustaya talebi gönder'}));
  await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('ustanın çalıştığı bölgedeki'));
  expect(fetchMock).not.toHaveBeenCalled();
});
