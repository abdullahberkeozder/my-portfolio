import {render,screen,cleanup,waitFor,act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import RequestConversation from '../../app/components/RequestConversation';
import type {ConversationSnapshot} from '../../app/domain/requestConversation';
const auth=vi.hoisted(()=>({callback:undefined as undefined|((event:string,session:{user:{id:string}}|null)=>void)}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth:{onAuthStateChange:(callback:typeof auth.callback)=>{auth.callback=callback;return {data:{subscription:{unsubscribe:vi.fn()}}};}}})}));
const initial:ConversationSnapshot={conversationId:null,messages:[],cursor:0,hasMore:false,unreadCount:0,canSend:true,jobId:null,acknowledgedId:null};
const fetchMock=vi.fn();
const reply=(data:unknown,status=200)=>({ok:status===200,status,json:async()=>data});
const setup=(snapshot=initial)=>render(<RequestConversation requestId="request" professionalId="professional" currentUserId="customer" initial={snapshot}/>);
beforeEach(()=>{fetchMock.mockReset();fetchMock.mockResolvedValue(reply(initial));vi.stubGlobal('fetch',fetchMock);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('keeps the exact key and text for a failed-send retry',async()=>{
  let attempts=0;
  fetchMock.mockImplementation(async(_url,options)=>{
    if(options?.method==='POST'){
      attempts++;if(attempts===1)throw new Error('Bağlantı kesildi.');
      return reply({...initial,acknowledgedId:'message'});
    }return reply(initial);
  });
  setup();await userEvent.type(screen.getByRole('textbox'),'Kapsamı netleştirelim.');
  await userEvent.click(screen.getByRole('button',{name:'Mesaj gönder'}));
  await screen.findByText(/Gönderilemedi:/);expect(screen.getByRole('textbox')).toBeDisabled();
  await userEvent.click(screen.getByRole('button',{name:'Yeniden dene'}));
  await waitFor(()=>expect(screen.getByRole('textbox')).toHaveValue(''));
  const sends=fetchMock.mock.calls.filter(call=>call[1]?.method==='POST');
  expect(sends).toHaveLength(2);expect(sends[0][1].body).toBe(sends[1][1].body);
  expect(JSON.parse(sends[0][1].body)).toMatchObject({expectedUserId:'customer',professionalId:'professional'});
});
it('disables sending during acknowledgement and does not submit twice',async()=>{
  let finish!:(value:unknown)=>void;
  fetchMock.mockImplementation((_url,options)=>options?.method==='POST'?new Promise(resolve=>{finish=resolve;}):Promise.resolve(reply(initial)));
  setup();await userEvent.type(screen.getByRole('textbox'),'Merhaba');await userEvent.click(screen.getByRole('button',{name:'Mesaj gönder'}));
  expect(screen.getByRole('button',{name:'Gönderiliyor…'})).toBeDisabled();
  expect(fetchMock.mock.calls.filter(call=>call[1]?.method==='POST')).toHaveLength(1);
  await act(async()=>finish(reply({...initial,acknowledgedId:'message'})));
});
it('catches up paged history and reconnects from the last server sequence',async()=>{
  const one={id:'one',sequence:1,sender_id:'professional',body:'İlk mesaj',created_at:'2026-09-03T10:00:00Z'};
  const two={...one,id:'two',sequence:2,body:'İkinci mesaj'};
  let calls=0;
  fetchMock.mockImplementation(async()=>{calls++;return reply({...initial,messages:calls===1?[one]:calls===2?[two]:[],cursor:calls===1?1:2,hasMore:calls===1,unreadCount:2});});
  setup();await screen.findByText('İkinci mesaj');expect(screen.getAllByText('İlk mesaj')).toHaveLength(1);
  expect(fetchMock.mock.calls[1][0]).toContain('after=1');
  act(()=>window.dispatchEvent(new Event('online')));
  await waitFor(()=>expect(fetchMock.mock.calls.at(-1)?.[0]).toContain('after=2'));
  expect(screen.getByText('2 okunmamış mesaj')).toBeVisible();
});
it('preserves history on network error without presenting an empty state',async()=>{
  fetchMock.mockRejectedValue(new Error('Çevrimdışı'));
  setup({...initial,messages:[{id:'one',sequence:1,sender_id:'professional',body:'Korunan mesaj',created_at:'2026-09-03T10:00:00Z'}],cursor:1});
  await screen.findByRole('alert');expect(screen.getByText('Korunan mesaj')).toBeVisible();
});
it('marks only loaded messages read on explicit action',async()=>{
  const snapshot={...initial,cursor:12,unreadCount:2};fetchMock.mockResolvedValue(reply(snapshot));setup(snapshot);
  await userEvent.click(screen.getByRole('button',{name:'Okundu olarak işaretle'}));
  const call=fetchMock.mock.calls.find(call=>call[1]?.method==='POST');
  expect(JSON.parse(call![1].body)).toMatchObject({action:'read',sequence:12});
});
it('shows a job handoff only when the server supplies this pair’s job',()=>{
  const {unmount}=setup({...initial,canSend:false,jobId:'winning-job'});
  expect(screen.getByRole('link',{name:/İş ekranına geç/})).toHaveAttribute('href','/islerim/winning-job');expect(screen.queryByRole('textbox')).toBeNull();
  unmount();setup({...initial,canSend:false});expect(screen.queryByRole('link',{name:/İş ekranına geç/})).toBeNull();
});
it('hides the old account’s messages when identity changes',()=>{
  setup({...initial,messages:[{id:'one',sequence:1,sender_id:'customer',body:'Özel eski mesaj',created_at:'2026-09-03T10:00:00Z'}]});
  act(()=>auth.callback?.('SIGNED_IN',{user:{id:'different-customer'}}));
  expect(screen.queryByText('Özel eski mesaj')).toBeNull();expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByRole('alert')).toHaveTextContent('görüşme kapatıldı');
});
