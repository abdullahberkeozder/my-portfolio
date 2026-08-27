import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';
import QuoteForm from '../../../components/QuoteForm';
import { services } from '../../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic='force-dynamic';

export default async function TradespersonQuotePage({params}:{params:Promise<{requestId:string}>}){
  const {requestId}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris');
  const {data:match}=await supabase.from('request_matches').select('score,reasons').eq('request_id',requestId).eq('tradesperson_id',user.id).maybeSingle();
  if(!match)notFound();
  const [{data:request},{data:latestQuote}]=await Promise.all([
    supabase.from('service_requests').select('service_id,district,neighborhood,preferred_timing,answers,status').eq('id',requestId).single(),
    supabase.from('quotes').select('version').eq('request_id',requestId).eq('tradesperson_id',user.id).order('version',{ascending:false}).limit(1).maybeSingle(),
  ]);
  if(!request)notFound();
  const service=services.find(item=>item.id===request.service_id);
  return <main className="account-shell quote-workspace"><Link className="account-back" href="/usta/talepler">← Eşleşen talepler</Link><section className="match-context"><span>EŞLEŞME PUANI {match.score}</span><h2>{service?.name??request.service_id}</h2><p>{request.neighborhood}, {request.district} · {request.preferred_timing}</p><ul>{(match.reasons as string[]).map(reason=><li key={reason}>{reason}</li>)}</ul></section>{request.status==='provider_selected'?<section className="account-card"><h2>Bu talep için usta seçildi</h2><p>Yeni teklif sürümü oluşturulamaz.</p></section>:<QuoteForm requestId={requestId} currentVersion={latestQuote?.version??0}/>}</main>;
}
