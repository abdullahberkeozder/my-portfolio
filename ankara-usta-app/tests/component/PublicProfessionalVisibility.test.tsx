import {render,screen} from '@testing-library/react';
import {beforeEach,expect,test,vi} from 'vitest';
import PublicTradespersonPage from '../../app/ustalar/[id]/page';

const state=vi.hoisted(()=>({verification:true as boolean|null,error:null as unknown,directed:false,offeredService:'tv-duvar-montaji'}));

vi.mock('next/navigation',()=>({
  notFound:vi.fn(()=>{throw new Error('NOT_FOUND');}),
}));

vi.mock('../../app/lib/directedRequests',()=>({directedRequestsEnabled:()=>state.directed}));

vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({
  rpc:async()=>({data:state.verification,error:state.error}),
  from:(table:string)=>{
    const result=table==='tradesperson_profiles'
      ? {data:{user_id:'professional-1',display_name:'Test Usta',bio:'Test profili',city:'Ankara',application_status:'approved'},error:null}
      : table==='tradesperson_services' && state.directed
        ? {data:[{service_id:state.offeredService}],error:null}
        : table==='tradesperson_service_areas' && state.directed
          ? {data:[{district:'Çankaya',neighborhood:'Ayrancı'}],error:null}
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

beforeEach(()=>{state.verification=true;state.error=null;state.directed=false;state.offeredService='tv-duvar-montaji';});

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
