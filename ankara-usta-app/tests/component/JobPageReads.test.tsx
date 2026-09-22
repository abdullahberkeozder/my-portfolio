import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import JobPage from '../../app/islerim/[id]/page';
const mocks=vi.hoisted(()=>({failure:'',missing:false,authError:null as null|{name:string},actorId:'owner',jobCustomerId:'owner',operatorRole:null as null|{role:string},from:vi.fn()}));
vi.mock('next/navigation',()=>({notFound:()=>{throw new Error('NOT_FOUND');},redirect:()=>{throw new Error('REDIRECT');}}));
vi.mock('../../app/components/RetryButton',()=>({default:()=> <button>Retry</button>}));
vi.mock('../../app/components/JobIdentityBoundary',()=>({default:({children}:{children:React.ReactNode})=>children}));
vi.mock('../../app/components/RealtimeRefresh',()=>({default:()=>null}));
vi.mock('../../app/components/JobWorkspace',()=>({default:()=> <p>Loaded workspace</p>}));
vi.mock('../../app/components/JobTrustCenter',()=>({default:()=> <p>Loaded trust center</p>}));
vi.mock('../../app/lib/supabase/server',()=>({createSupabaseServerClient:async()=>({auth:{getUser:async()=>({data:{user:{id:mocks.actorId}},error:mocks.authError})},from:mocks.from})}));
const id='f31e936b-d492-4d9b-a44a-a6ce932976d0';
beforeEach(()=>{
  mocks.failure='';mocks.missing=false;mocks.authError=null;mocks.actorId='owner';mocks.jobCustomerId='owner';mocks.operatorRole=null;
  mocks.from.mockImplementation((table:string)=>{
    const result={data:table==='jobs'?(mocks.missing?null:{id,status:'completed',customer_id:mocks.jobCustomerId,tradesperson_id:'pro'}):table==='user_roles'?mocks.operatorRole:[],error:table===mocks.failure?{message:'private SQL'}:null};
    const chain={select:()=>chain,eq:()=>chain,in:()=>chain,limit:()=>chain,order:async()=>result,maybeSingle:async()=>result};return chain;
  });
});afterEach(cleanup);
it.each(['jobs','job_events','job_messages','inspection_appointments','scope_changes','job_addresses','work_log_entries','reviews','workmanship_certificates','dispute_cases'])('does not render a failed %s read as empty data',async table=>{
  mocks.failure=table;render(await JobPage({params:Promise.resolve({id})}));
  expect(screen.getByRole('alert')).toHaveTextContent('İş odası yüklenemedi');expect(screen.queryByText('Loaded workspace')).not.toBeInTheDocument();
});
it('distinguishes true missing jobs from query failures',async()=>{
  mocks.missing=true;await expect(JobPage({params:Promise.resolve({id})})).rejects.toThrow('NOT_FOUND');
});
it('renders confirmed empty histories normally',async()=>{
  render(await JobPage({params:Promise.resolve({id})}));expect(screen.getByText('Loaded workspace')).toBeInTheDocument();
});
it('shows retry instead of redirect for a transient auth error',async()=>{
  mocks.authError={name:'AuthRetryableFetchError'};render(await JobPage({params:Promise.resolve({id})}));expect(screen.getByRole('alert')).toBeInTheDocument();
});
it('does not infer admin access for an unrelated authenticated user',async()=>{
  mocks.actorId='stranger';mocks.jobCustomerId='customer';
  await expect(JobPage({params:Promise.resolve({id})})).rejects.toThrow('NOT_FOUND');
});
it('allows an explicitly authorized operator to open the job',async()=>{
  mocks.actorId='operator';mocks.jobCustomerId='customer';mocks.operatorRole={role:'admin'};
  render(await JobPage({params:Promise.resolve({id})}));expect(screen.getByText('Loaded workspace')).toBeInTheDocument();
});
it('fails closed when operator role verification errors',async()=>{
  mocks.actorId='operator';mocks.jobCustomerId='customer';mocks.failure='user_roles';
  render(await JobPage({params:Promise.resolve({id})}));expect(screen.getByRole('alert')).toHaveTextContent('İş odası yüklenemedi');
});
