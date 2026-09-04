import {act,fireEvent,render,screen,waitFor,cleanup} from '@testing-library/react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import JobWorkspace from '../../app/components/JobWorkspace';
import JobTrustCenter from '../../app/components/JobTrustCenter';
import {workspaceMutation} from '../../app/lib/workspaceMutation';
const mocks=vi.hoisted(()=>({router:{refresh:vi.fn()}}));
vi.mock('next/navigation',()=>({useRouter:()=>mocks.router}));
vi.mock('../../app/lib/workspaceMutation',()=>({workspaceMutation:vi.fn()}));
const mutate=vi.mocked(workspaceMutation);
const props={jobId:'job',currentUserId:'owner',role:'customer' as const,status:'in_progress',events:[],messages:[],appointments:[],scopeChanges:[],address:null};
const trust={...props,status:'completed',entries:[],review:null,certificate:null,disputes:[]};
beforeEach(()=>vi.clearAllMocks());afterEach(cleanup);
describe('job form reliability',()=>{
  it('preserves a newer composer edit when the previous message succeeds',async()=>{
    let resolve!:(value:{ok:true})=>void;mutate.mockReturnValue(new Promise(done=>{resolve=done;}));
    render(<JobWorkspace {...props}/>);
    const input=screen.getByRole('textbox',{name:'Mesajınızı buraya yazın...'});
    fireEvent.change(input,{target:{value:'Message A'}});fireEvent.submit(input.closest('form')!);
    fireEvent.change(input,{target:{value:'Message B'}});fireEvent.submit(input.closest('form')!);
    expect(mutate).toHaveBeenCalledOnce();
    await act(async()=>resolve({ok:true}));
    expect(input).toHaveValue('Message B');expect(mocks.router.refresh).toHaveBeenCalledOnce();
  });
  it('reuses the same idempotency key for an unchanged failed message',async()=>{
    mutate.mockResolvedValue({ok:false,uncertain:true,message:'Connection lost'});
    render(<JobWorkspace {...props}/>);const input=screen.getByRole('textbox',{name:'Mesajınızı buraya yazın...'});
    fireEvent.change(input,{target:{value:'Message A'}});fireEvent.submit(input.closest('form')!);
    await screen.findByText('Connection lost');fireEvent.submit(input.closest('form')!);
    await waitFor(()=>expect(mutate).toHaveBeenCalledTimes(2));
    expect(mutate.mock.calls[1][1]).toEqual(mutate.mock.calls[0][1]);expect(input).toHaveValue('Message A');
  });
  it('preserves an unacknowledged review and prevents blind non-idempotent resubmission',async()=>{
    mutate.mockResolvedValue({ok:false,uncertain:true,message:'Check current record'});render(<JobTrustCenter {...trust}/>);
    const input=screen.getByPlaceholderText('İşçilik, iletişim ve zamanlama deneyiminizi anlatın');
    fireEvent.change(input,{target:{value:'The work was completed on time'}});fireEvent.submit(input.closest('form')!);
    await screen.findByRole('alert');expect(input).toHaveValue('The work was completed on time');
    expect(screen.getByRole('button',{name:'Değerlendirmeyi gönder'})).toBeDisabled();
    expect(screen.getByRole('link',{name:'Güncel kaydı aç ve sonucu kontrol et'})).toHaveAttribute('href','/islerim/job');
    fireEvent.submit(input.closest('form')!);expect(mutate).toHaveBeenCalledOnce();
  });
  it('restores submit controls after a confirmed validation rejection',async()=>{
    mutate.mockResolvedValue({ok:false,uncertain:false,message:'Correct the fields'});render(<JobTrustCenter {...trust}/>);
    const input=screen.getByPlaceholderText('İşçilik, iletişim ve zamanlama deneyiminizi anlatın');
    fireEvent.change(input,{target:{value:'Review remains editable'}});fireEvent.submit(input.closest('form')!);
    await screen.findByRole('alert');expect(screen.getByRole('button',{name:'Değerlendirmeyi gönder'})).toBeEnabled();expect(input).toHaveValue('Review remains editable');
  });
  it('resets a captured upload form only after acknowledged success',async()=>{
    mutate.mockResolvedValue({ok:true});render(<JobTrustCenter {...trust}/>);
    const input=screen.getByPlaceholderText('Bu görselde neyi belgelediniz?');fireEvent.change(input,{target:{value:'Before work'}});
    fireEvent.submit(input.closest('form')!);await screen.findByText('İşlem kaydedildi.');
    expect(input).toHaveValue('');expect(mutate.mock.calls[0][1]).toBeInstanceOf(FormData);
  });
});
