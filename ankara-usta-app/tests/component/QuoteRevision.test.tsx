import {render,screen,cleanup,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import QuoteForm from '../../app/components/QuoteForm';
import QuoteRevisionRequestForm from '../../app/components/QuoteRevisionRequestForm';
import QuoteChangeSummary from '../../app/components/QuoteChangeSummary';
const router=vi.hoisted(()=>({refresh:vi.fn(),push:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>router}));
const fetchMock=vi.fn();
const terms={laborAmountKurus:15000,materialAmountKurus:0,estimatedDurationMinutes:90,warrantyDays:45,includedScope:['Montaj'],excludedScope:['Boya'],note:'Önceki not'};
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('fetch',fetchMock);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('requires topics and a meaningful reason, then shows a saved request',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({revision:{id:'revision'}})});
  render(<QuoteRevisionRequestForm quoteId="quote" currentUserId="customer"/>);
  expect(screen.getByRole('button',{name:'Revizyon isteğini gönder'})).toBeDisabled();
  await userEvent.click(screen.getByLabelText('Malzeme'));await userEvent.type(screen.getByLabelText('İstediğiniz değişiklik'),'Malzeme bana ait olsun.');
  await userEvent.click(screen.getByRole('button',{name:'Revizyon isteğini gönder'}));
  await screen.findByRole('status');expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({action:'request',fields:['material'],expectedUserId:'customer'});
});
it('preserves the exact feedback after a failed acknowledgement',async()=>{
  fetchMock.mockRejectedValueOnce(new Error('Bağlantı kesildi')).mockResolvedValue({ok:true,json:async()=>({revision:{id:'revision'}})});
  render(<QuoteRevisionRequestForm quoteId="quote" currentUserId="customer"/>);
  await userEvent.click(screen.getByLabelText('Kapsam'));await userEvent.type(screen.getByRole('textbox'),'Kapsama boya ekleyelim.');await userEvent.click(screen.getByRole('button',{name:'Revizyon isteğini gönder'}));
  await screen.findByRole('alert');expect(screen.getByRole('textbox')).toBeDisabled();await userEvent.click(screen.getByRole('button',{name:'Yeniden dene'}));
  await screen.findByRole('status');expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body);
});
it('prefills the original terms, previews changes and reuses the same base on retry',async()=>{
  fetchMock.mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({ok:true,json:async()=>({quote:{id:'next',version:2}})});
  render(<QuoteForm requestId="request" currentVersion={1} initial={terms} baseQuoteId="base" currentUserId="professional"/>);
  expect(screen.getByLabelText('İşçilik (TL)')).toHaveValue(150);expect(screen.getByLabelText('Tahmini süre (dakika)')).toHaveValue(90);
  expect(screen.getByRole('button',{name:'Yeni teklif sürümünü gönder'})).toBeDisabled();
  await userEvent.clear(screen.getByLabelText('İşçilik (TL)'));await userEvent.type(screen.getByLabelText('İşçilik (TL)'),'175');
  expect(screen.getByRole('region',{name:'Teklif değişiklik özeti'})).toHaveTextContent('Toplam');
  await userEvent.click(screen.getByRole('button',{name:'Yeni teklif sürümünü gönder'}));await screen.findByRole('status');
  expect(screen.getByLabelText('İşçilik (TL)')).toBeDisabled();await userEvent.click(screen.getByRole('button',{name:'Yeniden dene'}));
  await waitFor(()=>expect(router.push).toHaveBeenCalledWith('/teklifler/next'));
  expect(fetchMock.mock.calls[0][0]).toBe('/api/quotes/base/revision');expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body);
});
it('retains the original creation endpoint for a first quote',async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({quote:{id:'first',version:1}})});
  render(<QuoteForm requestId="request" currentVersion={0}/>);await userEvent.type(screen.getByLabelText('İşçilik (TL)'),'100');await userEvent.click(screen.getByRole('button',{name:'Yeni teklif sürümünü gönder'}));
  await screen.findByRole('status');expect(fetchMock.mock.calls[0][0]).toBe('/api/quotes');expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({requestId:'request',laborAmountKurus:10000});
});
it('shows explicit before/after labels and renders scope as plain text',()=>{
  render(<QuoteChangeSummary before={terms} after={{...terms,includedScope:['<script>bad</script>']}}/>);
  expect(screen.getByText('Önce')).toBeVisible();expect(screen.getByText('Şimdi')).toBeVisible();expect(screen.getByText('<script>bad</script>')).toBeVisible();
});
