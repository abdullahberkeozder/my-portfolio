import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import ConsentBanner from '../../app/components/ConsentBanner';
import JobWorkspace from '../../app/components/JobWorkspace';
import JobTrustCenter from '../../app/components/JobTrustCenter';
import WorkReceipt from '../../app/components/WorkReceipt';
import {services} from '../../app/data/serviceTaxonomy';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
const props={jobId:'job',currentUserId:'owner',role:'customer' as const,status:'scheduled',events:[],messages:[],appointments:[],scopeChanges:[],address:null};
beforeEach(()=>localStorage.clear());afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('remembers rejection and closes immediately',()=>{
  const view=render(<ConsentBanner/>);fireEvent.click(screen.getByRole('button',{name:'Reddet'}));
  expect(localStorage.getItem('ankara_analytics_consent')).toBe('rejected');expect(screen.queryByRole('region')).not.toBeInTheDocument();
  view.unmount();render(<ConsentBanner/>);expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
it('does not imply consent on storage failure and honors an in-memory dismissal',()=>{
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
  render(<ConsentBanner/>);expect(screen.getByRole('region')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Reddet'}));
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
it('reflects a preference changed in another tab',()=>{
  render(<ConsentBanner/>);act(()=>{localStorage.setItem('ankara_analytics_consent','rejected');window.dispatchEvent(new Event('storage'));});
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});
it('traps confirmation focus, starts on cancel and restores the trigger',async()=>{
  const user=userEvent.setup();render(<JobWorkspace {...props}/>);
  await user.click(screen.getByRole('tab',{name:'Onay ve işlemler'}));
  const trigger=screen.getByRole('button',{name:/İşi iptal et/i});await user.click(trigger);
  const dialog=screen.getByRole('dialog',{name:/işlemini onaylıyor musunuz/});const cancel=within(dialog).getByRole('button',{name:'Vazgeç'});
  expect(cancel).toHaveFocus();expect(document.body.dataset.modalOpen).toBe('true');
  await user.keyboard('{Shift>}{Tab}{/Shift}');expect(within(dialog).getByRole('button',{name:/Evet, İşlemi Onayla/})).toHaveFocus();
  await user.tab();expect(cancel).toHaveFocus();await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();expect(document.body.dataset.modalOpen).toBeUndefined();
});
it('exposes persistent field labels and the selected rating',()=>{
  render(<JobTrustCenter {...props} status="completed" entries={[]} review={null} certificate={null} disputes={[]}/>);
  expect(screen.getByLabelText('Görselin aşaması')).toHaveAttribute('name','kind');
  expect(screen.getByLabelText(/İş görseli \(gerekli/)).toHaveAttribute('type','file');
  expect(screen.getByLabelText('Sorun türü')).toBeInTheDocument();expect(screen.getByLabelText(/Olayın açıklaması/)).toBeRequired();
  expect(screen.getByRole('button',{name:'5 yıldız'})).toHaveAttribute('aria-pressed','true');
  fireEvent.click(screen.getByRole('button',{name:'3 yıldız'}));expect(screen.getByRole('button',{name:'3 yıldız'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('button',{name:'5 yıldız'})).toHaveAttribute('aria-pressed','false');
});
it('presents a compact truthful receipt with only decision-relevant fields',()=>{
  render(<WorkReceipt service={services[0]} answers={{q:'Example answer'}} questions={[{id:'q',label:'Scope'}]} step={3}/>);
  expect(screen.getByText('1/1 yanıt')).toBeInTheDocument();
  expect(screen.getByText('Kontrol edin')).toBeInTheDocument();
  expect(screen.getByText('Konum')).toBeInTheDocument();
  expect(screen.getByText('Zamanlama')).toBeInTheDocument();
  expect(screen.getByText('Medya')).toBeInTheDocument();
  expect(screen.queryByText('Scope')).not.toBeInTheDocument();
  expect(screen.queryByText('Fiş no')).not.toBeInTheDocument();
});
