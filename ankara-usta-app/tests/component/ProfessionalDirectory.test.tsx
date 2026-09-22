import {render, screen, cleanup} from '@testing-library/react';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import Directory from '../../app/ustalar/page';

const state = vi.hoisted(() => ({profiles: [] as unknown[], error: null as unknown}));
vi.mock('../../app/lib/supabase/server', () => ({createSupabaseServerClient: async () => ({
  rpc: async () => ({data:state.profiles,error:state.error}),
  from: (table:string) => {
    const chain = {
      select: () => chain,
      in: async () => ({data:table==='tradesperson_services'
        ? [{tradesperson_id:'test-professional',service_id:'musluk-degisimi'}]
        : [{tradesperson_id:'test-professional',district:'Çankaya'}]}),
    };
    return chain;
  },
})}));
afterEach(cleanup);
beforeEach(() => {state.profiles=[]; state.error=null;});

test('preserves filters in profile links and distinguishes approval from document evidence', async () => {
  state.profiles=[{user_id:'test-professional',display_name:'Uzun İsimli Test Ustası',bio:null,city:'Ankara',total_count:1}];
  render(await Directory({searchParams:Promise.resolve({service:'musluk-degisimi',district:'Çankaya',view:'map'})}));
  expect(screen.getByText('Mesleki belge güncel')).toBeVisible();
  expect(screen.getByText('Başvuru ve güncel mesleki belge kontrolü tamamlandı.')).toBeVisible();
  expect(screen.getByText('Hizmet bölgesi: Çankaya')).toBeVisible();
  expect(screen.getByRole('link',{name:'Profili İncele →'})).toHaveAttribute('href','/ustalar/test-professional?service=musluk-degisimi&district=%C3%87ankaya');
  expect(screen.getByLabelText('Hizmet')).toHaveValue('musluk-degisimi');
  expect(screen.queryByText('Bölgeyi haritada incele')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name:/harita/i})).not.toBeInTheDocument();
  expect(document.querySelector('iframe')).toBeNull();
});
test('empty results offer filter recovery', async () => {
  render(await Directory({searchParams:Promise.resolve({district:'Çankaya'})}));
  expect(screen.getByRole('link',{name:'Filtreleri Temizle'})).toHaveAttribute('href','/ustalar');
  expect(screen.queryByText('Usta listesi yüklenemedi')).not.toBeInTheDocument();
});
test('query failure is not presented as an empty result', async () => {
  state.error={message:'private database details'};
  render(await Directory({searchParams:Promise.resolve({})}));
  expect(screen.getByText('Usta listesi yüklenemedi')).toBeVisible();
  expect(screen.queryByText(/private database/)).not.toBeInTheDocument();
  expect(screen.queryByText(/uygun doğrulanmış usta bulunamadı/)).not.toBeInTheDocument();
});
