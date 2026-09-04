import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach,expect,it,vi} from 'vitest';
import PilotCityMap from '../../app/components/PilotCityMap';
import AccountCityForm from '../../app/components/AccountCityForm';
const refresh=vi.hoisted(()=>vi.fn());
vi.mock('next/navigation',()=>({useRouter:()=>({refresh})}));
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();vi.clearAllMocks();});
it('defers the external map until explicitly opened and supports keyboard toggling',async()=>{
  render(<PilotCityMap cityState="unset" initiallyExpanded={false}/>);
  expect(screen.queryByTitle(/Ankara şehir haritası/)).not.toBeInTheDocument();
  const button=screen.getByRole('button',{name:'Ankara haritasını göster'});
  button.focus();await userEvent.keyboard('{Enter}');
  expect(button).toHaveAttribute('aria-expanded','true');
  expect(screen.getByRole('status')).toHaveTextContent('Harita yükleniyor');
  fireEvent.load(screen.getByTitle(/Ankara şehir haritası/));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  await userEvent.keyboard(' ');expect(button).toHaveAttribute('aria-expanded','false');
});
it('offers recovery on timeout, retries, and clears timers on hide',()=>{
  vi.useFakeTimers();render(<PilotCityMap cityState="ankara"/>);
  act(()=>vi.advanceTimersByTime(12000));
  expect(screen.getByRole('status')).toHaveTextContent('gecikiyor');
  expect(screen.getByRole('link',{name:'Büyük haritayı aç ↗'})).toBeInTheDocument();
  const oldFrame=screen.getByTitle(/Ankara şehir haritası/);
  fireEvent.click(screen.getByRole('button',{name:'Haritayı yeniden yükle'}));
  expect(screen.getByTitle(/Ankara şehir haritası/)).not.toBe(oldFrame);
  expect(screen.getByRole('status')).toHaveTextContent('yükleniyor');
  act(()=>vi.advanceTimersByTime(12000));
  expect(screen.getByRole('status')).toHaveTextContent('gecikiyor');
  fireEvent.click(screen.getByRole('button',{name:'Haritayı gizle'}));
  act(()=>vi.advanceTimersByTime(12000));expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
it.each(['ankara','unset','unsupported'] as const)('renders a fixed city view without private markers for %s',state=>{
  render(<PilotCityMap cityState={state}/>);
  const frame=screen.getByTitle('Ankara şehir haritası — OpenStreetMap');
  expect(frame.getAttribute('src')).toContain('openstreetmap.org/export/embed.html?bbox=');
  expect(frame.getAttribute('src')).not.toMatch(/marker|user|address|token/);
  expect(frame).toHaveAttribute('referrerpolicy','no-referrer');
  if(state==='unset')expect(screen.getByText(/Henüz şehir kaydetmediniz/)).toBeVisible();
  if(state==='unsupported')expect(screen.getByText(/Kayıtlı şehriniz henüz pilot kapsamda değil/)).toBeVisible();
});
it('can unload and reopen the map using keyboard-accessible controls',async()=>{
  const user=userEvent.setup();render(<PilotCityMap cityState="ankara"/>);
  await user.click(screen.getByRole('button',{name:'Haritayı gizle'}));expect(screen.queryByTitle(/Ankara şehir haritası/)).toBeNull();
  await user.click(screen.getByRole('button',{name:'Ankara haritasını göster'}));expect(screen.getByTitle(/Ankara şehir haritası/)).toBeInTheDocument();
});
it('saves the city through the scoped API and refreshes account data',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,status:200});vi.stubGlobal('fetch',fetch);
  render(<AccountCityForm userId="owner" saved={false}/>);await userEvent.setup().click(screen.getByRole('button',{name:'Şehri kaydet'}));
  expect(await screen.findByRole('status')).toHaveTextContent('Şehriniz Ankara olarak kaydedildi');
  expect(fetch).toHaveBeenCalledWith('/api/account/city',expect.objectContaining({body:'{"city":"Ankara"}',headers:expect.objectContaining({'x-expected-user-id':'owner'})}));
  expect(refresh).toHaveBeenCalled();
});
it('does not report success after a failed save',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:409}));
  render(<AccountCityForm userId="owner" saved={false}/>);await userEvent.setup().click(screen.getByRole('button',{name:'Şehri kaydet'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Hesap değişti');expect(refresh).not.toHaveBeenCalled();
});
