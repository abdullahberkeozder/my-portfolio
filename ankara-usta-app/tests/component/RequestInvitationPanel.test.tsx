import {render,screen,cleanup,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import RequestInvitationPanel from '../../app/components/RequestInvitationPanel';
import {type RequestInvitation} from '../../app/domain/requestInvitation';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
vi.mock('../../app/components/QuoteForm',()=>({default:()=> <div>Teklif formu</div>}));
const initial:RequestInvitation={request_id:'request',status:'awaiting',response_due_at:'2099-09-04T12:00:00Z',decline_reason:null,successor_request_id:null};
const fetchMock=vi.fn();
beforeEach(()=>{fetchMock.mockReset();vi.stubGlobal('fetch',fetchMock);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('requires a written reason, then removes decline and quote controls after success',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({invitation:{...initial,status:'declined',decline_reason:'Müsait değilim.'}})});
  render(<RequestInvitationPanel invitation={initial} serviceId="tv-duvar-montaji" role="professional" quoteVersion={0}/>);
  expect(screen.getByRole('button',{name:'Gerekçeyle reddet'})).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/Bu işi neden/),'Müsait değilim.');
  await userEvent.click(screen.getByRole('button',{name:'Gerekçeyle reddet'}));
  await screen.findByText('Usta talebi reddetti');expect(screen.queryByText('Teklif formu')).toBeNull();
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({action:'decline',reason:'Müsait değilim.'});
});
it('prepares a draft only after explicit consent and never submits it',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({invitation:{...initial,status:'broadened',successor_request_id:'successor'}})});
  render(<RequestInvitationPanel invitation={{...initial,status:'declined',decline_reason:'Müsait değilim.'}} serviceId="tv-duvar-montaji" role="customer"/>);
  await userEvent.click(screen.getByRole('button',{name:'Diğer uygun ustalardan teklif al'}));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByRole('button',{name:'Onayla ve taslağı hazırla'})).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button',{name:'Onayla ve taslağı hazırla'}));
  await screen.findByRole('link',{name:/Yeni taslağı veya talebi/});expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({action:'broaden',confirm:true});
});
it('never automatically broadens an expired invitation and hides professional actions',()=>{
  render(<RequestInvitationPanel invitation={{...initial,response_due_at:'2020-01-01T00:00:00Z'}} serviceId="tv-duvar-montaji" role="professional" quoteVersion={0}/>);
  expect(screen.getByText('Yanıt süresi doldu')).toBeVisible();expect(screen.queryByText('Teklif formu')).toBeNull();expect(screen.queryByRole('textbox')).toBeNull();expect(fetchMock).not.toHaveBeenCalled();
});
it('preserves reason and permits retry on network failure',async()=>{
  fetchMock.mockRejectedValue(new Error('Bağlantı kurulamadı.'));
  render(<RequestInvitationPanel invitation={initial} serviceId="tv-duvar-montaji" role="professional"/>);
  await userEvent.type(screen.getByLabelText(/Bu işi neden/),'Müsait değilim.');await userEvent.click(screen.getByRole('button',{name:'Gerekçeyle reddet'}));
  await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Bağlantı kurulamadı.'));
  expect(screen.getByRole('textbox')).toHaveValue('Müsait değilim.');expect(screen.getByRole('button',{name:'Gerekçeyle reddet'})).toBeEnabled();
});
it('does not offer mutations for a closed request',()=>{
  render(<RequestInvitationPanel invitation={initial} serviceId="tv-duvar-montaji" role="professional" canRespond={false} quoteVersion={1}/>);
  expect(screen.queryByRole('textbox')).toBeNull();expect(screen.queryByText('Teklif formu')).toBeNull();
});
