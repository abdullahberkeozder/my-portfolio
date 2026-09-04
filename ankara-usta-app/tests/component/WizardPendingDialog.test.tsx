import {render,screen,within,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,expect,it,vi} from 'vitest';
import RequestWizard from '../../app/components/RequestWizard';
import {services} from '../../app/data/serviceTaxonomy';
const auth=vi.hoisted(()=>({getUser:vi.fn(),onAuthStateChange:vi.fn(()=>({data:{subscription:{unsubscribe:vi.fn()}}}))}));
vi.mock('../../app/lib/supabase/browser',()=>({createSupabaseBrowserClient:()=>({auth})}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),refresh:vi.fn()})}));
const service=services.find(item=>item.id==='avize-montaji')!;
beforeEach(()=>{sessionStorage.clear();localStorage.clear();vi.clearAllMocks();});

it('keeps pending identity lookup in a named, escapable dialog',async()=>{
  auth.getUser.mockReturnValue(new Promise(()=>{}));
  const close=vi.fn();render(<RequestWizard service={service} onClose={close}/>);
  const dialog=screen.getByRole('dialog',{name:'Avize Montajı — Talebe devam et'});
  expect(within(dialog).getByRole('status')).toHaveTextContent('Hesap ve taslak kontrol ediliyor');
  expect(within(dialog).getByRole('button',{name:'Kapat'})).toHaveFocus();
  await userEvent.setup().keyboard('{Escape}');expect(close).toHaveBeenCalledOnce();
});

it('shows auth failure and retry in the dialog without bypassing ownership',async()=>{
  auth.getUser.mockResolvedValueOnce({data:{user:null},error:{name:'NetworkError'}})
    .mockResolvedValue({data:{user:null},error:null});
  render(<RequestWizard service={service} onClose={vi.fn()}/>);
  const alert=await screen.findByRole('alert');
  expect(screen.getByRole('dialog')).toContainElement(alert);
  expect(screen.queryByRole('radio')).toBeNull();
  await userEvent.setup().click(screen.getByRole('button',{name:'Yeniden dene'}));
  await waitFor(()=>expect(screen.getByRole('dialog',{name:'Avize Montajı'})).toBeInTheDocument());
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
});
