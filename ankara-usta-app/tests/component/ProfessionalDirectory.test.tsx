import {render, screen, cleanup} from '@testing-library/react';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import Directory from '../../app/ustalar/page';

const state = vi.hoisted(() => ({
  profiles: [] as unknown[],
  error: null as unknown,
  completedJobRows: [] as unknown[],
  completedJobError: null as unknown,
  clientCalls: 0,
}));
vi.mock('../../app/lib/supabase/server', () => ({createSupabaseServerClient: async () => {
  state.clientCalls += 1;
  return {
    rpc: async (functionName: string) => functionName === 'list_public_professional_completed_job_counts'
      ? {data: state.completedJobRows, error: state.completedJobError}
      : {data:state.profiles,error:state.error},
    from: (table:string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        in: async () => ({data:table==='tradesperson_services'
          ? [{tradesperson_id:'test-professional',service_id:'musluk-degisimi'}]
          : table==='tradesperson_service_areas'
            ? [{tradesperson_id:'test-professional',district:'Çankaya'}]
            : []}),
      };
      return chain;
    },
  };
}}));
afterEach(cleanup);
beforeEach(() => {
  state.profiles=[];
  state.error=null;
  state.completedJobRows=[];
  state.completedJobError=null;
  state.clientCalls=0;
});

test('preserves filters and keeps detailed document evidence on the profile surface', async () => {
  state.profiles=[{user_id:'test-professional',display_name:'Uzun İsimli Test Ustası',bio:null,city:'Ankara',total_count:1}];
  render(await Directory({searchParams:Promise.resolve({service:'musluk-degisimi',district:'Çankaya',view:'map'})}));
  expect(screen.queryByText('Mesleki belge güncel')).not.toBeInTheDocument();
  expect(screen.getAllByRole('article', {name:/Doğrulanmış profil/i}).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Çankaya').length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link',{name:/Profili aç/})[0]).toHaveAttribute('href','/ustalar/test-professional?service=musluk-degisimi&district=cankaya');
  expect(screen.getAllByLabelText('Hizmet')[0]).toHaveValue('musluk-degisimi');
  expect(screen.queryByText('Bölgeyi haritada incele')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name:/harita/i})).not.toBeInTheDocument();
  expect(document.querySelector('iframe')).toBeNull();
});
test('empty results offer filter recovery', async () => {
  render(await Directory({searchParams:Promise.resolve({district:'Çankaya'})}));
  expect(screen.getByRole('link',{name:'Tüm ustaları gör'})).toHaveAttribute('href','/ustalar?view=split&sort=recommended');
  expect(screen.getByRole('link',{name:'İhtiyacını anlat'})).toHaveAttribute('href','/#services');
  expect(screen.getByTestId('directory-empty-state')).toHaveAttribute('data-directory-availability','waitlist');
  expect(screen.queryByText('Usta listesi yüklenemedi')).not.toBeInTheDocument();
});
test('query failure is not presented as an empty result', async () => {
  state.error={message:'private database details'};
  render(await Directory({searchParams:Promise.resolve({})}));
  expect(screen.getByText('Usta listesi yüklenemedi')).toBeVisible();
  expect(screen.queryByText(/private database/)).not.toBeInTheDocument();
  expect(screen.queryByText(/uygun doğrulanmış usta bulunamadı/)).not.toBeInTheDocument();
});

test('maps the authoritative completed-job RPC to desktop and mobile milestone marks', async () => {
  state.profiles=[{user_id:'test-professional',display_name:'Uzun İsimli Test Ustası',bio:null,city:'Ankara',total_count:1}];
  state.completedJobRows=[{user_id:'test-professional',completed_jobs:27}];

  render(await Directory({searchParams:Promise.resolve({view:'split'})}));

  expect(screen.getAllByRole('button', {name:/Uzun İsimli Test Ustası: 20 iş tamamladı/})).toHaveLength(2);
});

test('keeps the directory usable and hides milestones when the aggregate RPC fails', async () => {
  state.profiles=[{user_id:'test-professional',display_name:'Uzun İsimli Test Ustası',bio:null,city:'Ankara',total_count:1}];
  state.completedJobError={message:'aggregate unavailable'};

  render(await Directory({searchParams:Promise.resolve({view:'split'})}));

  expect(screen.getAllByText(/Uzun İsimli Test Ustası/i).length).toBeGreaterThan(0);
  expect(screen.queryByRole('button', {name:/iş tamamladı/})).not.toBeInTheDocument();
  expect(screen.queryByText(/aggregate unavailable/i)).not.toBeInTheDocument();
});

test('renders the milestone visual fixture without creating a Supabase client', async () => {
  render(await Directory({searchParams:Promise.resolve({view:'split',fixture:'milestones'})}));

  expect(state.clientCalls).toBe(0);
  expect(screen.getAllByRole('button', {name:/Deniz Usta: 5 iş tamamladı/})).toHaveLength(2);
  expect(screen.getAllByRole('button', {name:/Mert Usta: 20 iş tamamladı/})).toHaveLength(2);
  expect(screen.getAllByRole('button', {name:/Selin Usta: 50 iş tamamladı/})).toHaveLength(2);
  expect(screen.queryByRole('button', {name:/Eren Usta: .*iş tamamladı/})).not.toBeInTheDocument();
});
