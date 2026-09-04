import Link from 'next/link';
import {z} from 'zod';
import JobIdentityBoundary from '../../components/JobIdentityBoundary';
import RetryButton from '../../components/RetryButton';
import {notFound,redirect} from 'next/navigation';
import JobTrustCenter from '../../components/JobTrustCenter';
import JobWorkspace from '../../components/JobWorkspace';
import RealtimeRefresh from '../../components/RealtimeRefresh';
import {createSupabaseServerClient} from '../../lib/supabase/server';

export const dynamic='force-dynamic';
type WorkEntry={id:string;kind:string;caption:string|null;storage_path:string;moderation_status:string;customer_publication_consent:boolean;created_at:string};

function LoadFailure(){return <main className="account-shell job-page"><Link href="/islerim">İşlerime dön</Link><section className="account-card" role="alert"><h1>İş odası yüklenemedi</h1><p>Bazı bilgiler alınamadığı için boş kayıt göstermiyoruz. Güncel durumu yeniden yükleyin.</p><RetryButton/></section></main>;}

export default async function JobPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const supabase=await createSupabaseServerClient();const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError&&authError.name!=='AuthSessionMissingError')return <LoadFailure/>;
  if(!user)redirect('/giris?next='+encodeURIComponent('/islerim/'+id));
  const {data:job,error:jobError}=await supabase.from('jobs').select('id,status,customer_id,tradesperson_id').eq('id',id).maybeSingle();if(jobError)return <LoadFailure/>;if(!job)notFound();
  const role=job.customer_id===user.id?'customer':job.tradesperson_id===user.id?'tradesperson':'admin';

  const [
    eventsResult,
    messagesResult,
    appointmentsResult,
    scopeChangesResult,
    addressResult,
    workLogResult,
    reviewResult,
    certificateResult,
    disputesResult,
  ]=await Promise.all([
    supabase.from('job_events').select('id,sequence,event_type,actor_role,payload,created_at').eq('job_id',id).order('sequence'),
    supabase.from('job_messages').select('id,sender_id,body,created_at').eq('job_id',id).order('created_at'),
    supabase.from('inspection_appointments').select('id,proposed_by,scheduled_for,status,note').eq('job_id',id).order('created_at',{ascending:false}),
    supabase.from('scope_changes').select('id,proposed_by,description,labor_delta_kurus,material_delta_kurus,duration_delta_minutes,status').eq('job_id',id).order('created_at',{ascending:false}),
    supabase.from('job_addresses').select('address_line,building,apartment,directions').eq('job_id',id).maybeSingle(),
    supabase.from('work_log_entries').select('id,kind,caption,storage_path,moderation_status,customer_publication_consent,created_at').eq('job_id',id).order('created_at'),
    supabase.from('reviews').select('id,rating,comment,moderation_status,created_at').eq('job_id',id).maybeSingle(),
    supabase.from('workmanship_certificates').select('certificate_number,issued_at,warranty_ends_at,scope_snapshot').eq('job_id',id).maybeSingle(),
    supabase.from('dispute_cases').select('id,category,description,status,resolution,created_at').eq('job_id',id).order('created_at',{ascending:false}),
  ]);

  // Do not present a failed read as an empty appointment/review/address.
  if([eventsResult,messagesResult,appointmentsResult,scopeChangesResult,addressResult,workLogResult,reviewResult,certificateResult,disputesResult].some(result=>result.error))return <LoadFailure/>;

  const entries=await Promise.all(((workLogResult.data??[]) as WorkEntry[]).map(async entry=>{const {data}=await supabase.storage.from('job-media').createSignedUrl(entry.storage_path,3600);return {...entry,signedUrl:data?.signedUrl??null}}));
  return <main className="account-shell job-page"><JobIdentityBoundary key={user.id} userId={user.id}><RealtimeRefresh channelName={`job-room-${id}`} subscriptions={[{table:'jobs',filter:`id=eq.${id}`},{table:'job_events',filter:`job_id=eq.${id}`},{table:'job_messages',filter:`job_id=eq.${id}`},{table:'inspection_appointments',filter:`job_id=eq.${id}`},{table:'scope_changes',filter:`job_id=eq.${id}`},{table:'job_addresses',filter:`job_id=eq.${id}`},{table:'work_log_entries',filter:`job_id=eq.${id}`},{table:'reviews',filter:`job_id=eq.${id}`},{table:'workmanship_certificates',filter:`job_id=eq.${id}`},{table:'dispute_cases',filter:`job_id=eq.${id}`}]} label="İş odası"/><Link className="account-back" href="/islerim">← İşlerim</Link><JobWorkspace jobId={id} currentUserId={user.id} role={role} status={job.status} events={(eventsResult.data??[]) as never[]} messages={(messagesResult.data??[]) as never[]} appointments={(appointmentsResult.data??[]) as never[]} scopeChanges={(scopeChangesResult.data??[]) as never[]} address={addressResult.data as never}/><JobTrustCenter currentUserId={user.id} jobId={id} role={role} status={job.status} entries={entries} review={reviewResult.data as never} certificate={certificateResult.data as never} disputes={(disputesResult.data??[]) as never[]}/></JobIdentityBoundary></main>;
}

