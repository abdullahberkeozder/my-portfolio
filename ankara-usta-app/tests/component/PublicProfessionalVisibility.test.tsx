import {render,screen} from '@testing-library/react';
import {beforeEach,expect,test,vi} from 'vitest';
import PublicTradespersonPage from '../../app/ustalar/[id]/page';

const state=vi.hoisted(()=>({verification:true as boolean|null,error:null as unknown}));

vi.mock('next/navigation',()=>({
  notFound:vi.fn(()=>{throw new Error('NOT_FOUND');}),
}));

vi.mock('../../app/lib/directedRequests',()=>({directedRequestsEnabled:()=>false}));

vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({
  rpc:async()=>({data:state.verification,error:state.error}),
  from:(table:string)=>{
    const result=table==='tradesperson_profiles'
      ? {data:{user_id:'professional-1',display_name:'Test Usta',bio:'Test profili',city:'Ankara',application_status:'approved'},error:null}
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

beforeEach(()=>{state.verification=true;state.error=null;});

test('publishes an approved profile only when current verification is true',async()=>{
  render(await PublicTradespersonPage({params:Promise.resolve({id:'professional-1'})}));
  expect(screen.getByRole('heading',{name:'Test Usta'})).toBeVisible();
  expect(screen.getByText('Mesleki belge güncel')).toBeVisible();
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
