import {render,screen,within} from '@testing-library/react';
import {beforeEach,expect,test,vi} from 'vitest';
import PublicTradespersonPage from '../../app/ustalar/[id]/page';

const state=vi.hoisted(()=>({
  verification:true as boolean|null,
  error:null as unknown,
  completedJobsData:null as unknown,
  completedJobsError:null as unknown,
  districtMetrics:[] as Array<{ district: string; completed_jobs: number; average_rating: number }>,
  directed:false,
  offeredService:'tv-duvar-montaji',
}));

vi.mock('next/navigation',()=>({
  notFound:vi.fn(()=>{throw new Error('NOT_FOUND');}),
}));

vi.mock('../../app/lib/directedRequests',()=>({directedRequestsEnabled:()=>state.directed}));

vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({
  rpc:async(functionName:string)=>{
    if(functionName==='get_public_professional_verification'){
      return {data:state.verification,error:state.error};
    }
    if(functionName==='list_public_professional_completed_job_counts'){
      return {data:state.completedJobsData,error:state.completedJobsError};
    }
    return {data:null,error:null};
  },
  from:(table:string)=>{
    const result=table==='tradesperson_profiles'
      ? {data:{user_id:'professional-1',display_name:'Test Usta',bio:'Test profili',city:'Ankara',application_status:'approved'},error:null}
      : table==='tradesperson_services' && state.directed
        ? {data:[{service_id:state.offeredService}],error:null}
        : table==='tradesperson_service_areas' && state.directed
          ? {data:[{district:'Çankaya',neighborhood:'Ayrancı'}],error:null}
          : table==='district_trust_metrics'
            ? {data:state.districtMetrics,error:null}
            : {data:[],error:null};
    const chain={
      select:()=>chain,
      eq:()=>chain,
      order:()=>chain,
      limit:()=>chain,
      maybeSingle:async()=>result,
      then:(resolve:(value:typeof result)=>unknown)=>Promise.resolve(result).then(resolve),
    };
    return chain;
  },
})}));

beforeEach(()=>{
  state.verification=true;
  state.error=null;
  state.completedJobsData=null;
  state.completedJobsError=null;
  state.districtMetrics=[];
  state.directed=false;
  state.offeredService='tv-duvar-montaji';
});

test('publishes an approved profile only when current verification is true',async()=>{
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));
  expect(screen.getByRole('heading',{name:'Test Usta'})).toBeVisible();
  expect(screen.getByText('Yeni profil')).toBeVisible();
  expect(screen.getByLabelText('Orkestra doğrulaması tamamlandı')).toBeVisible();
});

test('does not publish an approved profile with expired or missing verification',async()=>{
  state.verification=false;
  await expect(PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})})).rejects.toThrow('NOT_FOUND');
});

test('shows a recoverable error instead of treating verification failure as absence',async()=>{
  state.error={message:'private database details'};
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));
  expect(screen.getByRole('alert')).toHaveTextContent('Usta doğrulama bilgisi şu anda alınamıyor.');
  expect(screen.queryByText(/private database/)).not.toBeInTheDocument();
});

test('keeps selected service and district on the direct request CTA',async()=>{
  state.directed=true;
  render(await PublicTradespersonPage({
    params:Promise.resolve({id:'professional-1'}),
    searchParams:Promise.resolve({service:'tv-duvar-montaji',district:'Çankaya'}),
  }));

  const cta=screen.getByRole('link',{name:'Bu ustadan teklif al'});
  expect(cta).toHaveAttribute(
    'href',
    '/ustalar/professional-1/talep?service=tv-duvar-montaji&district=cankaya',
  );
  expect(screen.getByText('TV Duvar Montajı', {selector: 'p'})).toBeVisible();
  expect(screen.getByText('Çankaya', {selector: 'p'})).toBeVisible();
});

test('does not offer a directed request when the selected district is not served',async()=>{
  state.directed=true;
  render(await PublicTradespersonPage({
    params:Promise.resolve({id:'professional-1'}),
    searchParams:Promise.resolve({service:'tv-duvar-montaji',district:'Keçiören'}),
  }));
  expect(screen.getByText(/Bu usta seçilen ilçede hizmet vermiyor/)).toBeVisible();
  expect(screen.queryByRole('link',{name:'Bu ustadan teklif al'})).not.toBeInTheDocument();
});

test('does not offer a directed request for a service the professional does not provide',async()=>{
  state.directed=true;
  state.offeredService='tek-oda-boya';
  render(await PublicTradespersonPage({
    params:Promise.resolve({id:'professional-1'}),
    searchParams:Promise.resolve({service:'tv-duvar-montaji',district:'Çankaya'}),
  }));
  expect(screen.getByText(/Bu usta seçilen hizmeti sunmuyor/)).toBeVisible();
  expect(screen.queryByRole('link',{name:'Bu ustadan teklif al'})).not.toBeInTheDocument();
});

test('shows highest milestone badge and authoritative completed-job count for count above threshold',async()=>{
  state.completedJobsData=[{user_id:'professional-1',completed_jobs:27}];
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));

  const milestoneTrigger=screen.getByRole('button',{name:/Test Usta: 20 iş tamamladı/});
  expect(milestoneTrigger).toBeVisible();
  expect(milestoneTrigger).toHaveTextContent('20');

  const summary=screen.getByLabelText('Profil özeti');
  expect(within(summary).getByText('27 tamamlanan iş')).toBeVisible();
});

test('shows no milestone badge for below-threshold count while preserving truthful count evidence',async()=>{
  state.completedJobsData=[{user_id:'professional-1',completed_jobs:4}];
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));

  expect(screen.queryByRole('button',{name:/iş tamamladı/})).not.toBeInTheDocument();

  const summary=screen.getByLabelText('Profil özeti');
  expect(within(summary).getByText('4 tamamlanan iş')).toBeVisible();
});

test('shows neither milestone nor completed-job claim when aggregate data is missing or malformed',async()=>{
  state.completedJobsData=[{user_id:'professional-1',completed_jobs:'invalid'}];
  const {rerender}=render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));

  expect(screen.queryByRole('button',{name:/iş tamamladı/})).not.toBeInTheDocument();
  expect(screen.queryByText(/tamamlanan iş/)).not.toBeInTheDocument();

  state.completedJobsData=[];
  rerender(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));
  expect(screen.queryByRole('button',{name:/iş tamamladı/})).not.toBeInTheDocument();
  expect(screen.queryByText(/tamamlanan iş/)).not.toBeInTheDocument();
});

test('fails soft on completed-job RPC error without breaking profile or direct-request CTA',async()=>{
  state.directed=true;
  state.completedJobsError={message:'RPC failure'};
  render(await PublicTradespersonPage({
    params:Promise.resolve({id:'professional-1'}),
    searchParams:Promise.resolve({service:'tv-duvar-montaji',district:'Çankaya'}),
  }));

  expect(screen.getByRole('heading',{name:'Test Usta'})).toBeVisible();
  expect(screen.queryByRole('button',{name:/iş tamamladı/})).not.toBeInTheDocument();
  expect(screen.queryByText(/tamamlanan iş/)).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Bu ustadan teklif al'})).toBeVisible();
});

test('labels review-derived district metrics as onaylı değerlendirme instead of tamamlanan iş',async()=>{
  state.districtMetrics=[
    {district:'Çankaya',completed_jobs:12,average_rating:4.8},
  ];
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));

  expect(screen.getByText('Yerel iş kanıtı')).toBeVisible();
  expect(screen.getByText(/12 onaylı değerlendirme · 4.8\/5/)).toBeVisible();
  expect(screen.queryByText(/12 tamamlanan iş/)).not.toBeInTheDocument();
});
