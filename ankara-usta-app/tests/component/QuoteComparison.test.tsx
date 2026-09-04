import { render,screen,fireEvent,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import QuoteComparison,{type ComparableQuote} from '../../app/components/QuoteComparison';

const navigation=vi.hoisted(()=>({refresh:vi.fn(),push:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>navigation}));
beforeEach(()=>{
  vi.clearAllMocks();
  // jsdom does not implement native modal focus/inert behavior; real browser QA is deferred.
  Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value:function(this:HTMLDialogElement){this.setAttribute('open','');}});
  Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value:function(this:HTMLDialogElement){this.removeAttribute('open');}});
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});

const quote=(id:string,name:string):ComparableQuote=>({id,tradespersonId:id,status:'submitted',tradespersonName:name,version:1,laborAmountKurus:100000,materialAmountKurus:25000,estimatedDurationMinutes:120,warrantyDays:90,includedScope:['İşçilik'],excludedScope:[],note:null});

describe('QuoteComparison',()=>{
  it('never allows more than three selected quotes',async()=>{
    const user=userEvent.setup();
    render(<QuoteComparison currentUserId="customer" quotes={[quote('1','Birinci Usta'),quote('2','İkinci Usta'),quote('3','Üçüncü Usta'),quote('4','Dördüncü Usta')]}/>);
    const fourth=screen.getByRole('checkbox',{name:/Dördüncü Usta/});
    expect(fourth).toBeDisabled();
    await user.click(screen.getByRole('checkbox',{name:/Birinci Usta/}));
    expect(fourth).toBeEnabled();
    await user.click(fourth);
    expect(screen.getAllByRole('button',{name:'Bu teklifi kabul et'})).toHaveLength(3);
  });
});
it('keeps a selected professional when the quote ID changes and invalidates an open confirmation',async()=>{
  const user=userEvent.setup();
  const first=quote('1','Birinci Usta');
  const {rerender}=render(<QuoteComparison currentUserId="customer" quotes={[first]}/>);
  await user.click(screen.getByRole('button',{name:'Bu teklifi kabul et'}));
  expect(screen.getByRole('dialog',{name:/Birinci Usta ile/})).toBeVisible();
  expect(screen.getByText('TEKLİF ONAYI · SÜRÜM 1')).toBeVisible();
  rerender(<QuoteComparison currentUserId="customer" quotes={[first,{...first,id:'new',version:2,laborAmountKurus:125099}]}/>);
  expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByRole('button',{name:'Şartları onayla ve kabul et'})).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('Teklif veya talep durumu değişti');
  fireEvent(screen.getByRole('dialog'),new Event('cancel',{cancelable:true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Bu teklifi kabul et'})).toHaveFocus();
});
it('retains the confirmed quote after a network failure and retries it before navigating',async()=>{
  const fetcher=vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({ok:true,json:async()=>({accepted:true,jobId:'job-1'})});
  vi.stubGlobal('fetch',fetcher);
  const user=userEvent.setup();
  render(<QuoteComparison currentUserId="customer" quotes={[quote('1','Birinci Usta')]}/>);
  await user.click(screen.getByRole('button',{name:'Bu teklifi kabul et'}));
  await user.click(screen.getByRole('button',{name:'Şartları onayla ve kabul et'}));
  expect(screen.getByRole('alert')).toHaveTextContent('işlem gerçekleşmiş olabilir');
  expect(screen.getByRole('dialog')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Şartları onayla ve kabul et'}));
  expect(fetcher.mock.calls.map(call=>call[0])).toEqual(['/api/quotes/1/accept','/api/quotes/1/accept']);
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({expectedUserId:'customer'});
  await waitFor(()=>expect(navigation.push).toHaveBeenCalledWith('/islerim/job-1'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('prevents duplicate clicks and escape while acceptance is pending',async()=>{
  let finish!:(value:unknown)=>void;
  const fetcher=vi.fn(()=>new Promise(resolve=>{finish=resolve;}));
  vi.stubGlobal('fetch',fetcher);
  const user=userEvent.setup();
  render(<QuoteComparison currentUserId="customer" quotes={[quote('1','Birinci Usta')]}/>);
  await user.click(screen.getByRole('button',{name:'Bu teklifi kabul et'}));
  const button=screen.getByRole('button',{name:'Şartları onayla ve kabul et'});
  fireEvent.click(button);fireEvent.click(button);
  expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent(screen.getByRole('dialog'),new Event('cancel',{cancelable:true}));
  expect(screen.getByRole('dialog')).toBeVisible();
  finish({ok:true,json:async()=>({accepted:true,jobId:null})});
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('link',{name:'İşlerime git →'})).toHaveAttribute('href','/islerim');
});
it('does not offer another acceptance for closed requests or already accepted quotes',()=>{
  const {rerender}=render(<QuoteComparison currentUserId="customer" canAccept={false} quotes={[quote('1','Birinci Usta')]}/>);
  expect(screen.getByRole('button',{name:'Bu teklifi kabul et'})).toBeDisabled();
  rerender(<QuoteComparison currentUserId="customer" quotes={[{...quote('1','Birinci Usta'),status:'accepted'}]}/>);
  expect(screen.getByRole('button',{name:'Kabul edildi'})).toBeDisabled();
});
