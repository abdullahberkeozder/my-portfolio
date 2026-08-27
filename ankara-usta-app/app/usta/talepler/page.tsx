import Link from 'next/link';
import { redirect } from 'next/navigation';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const dynamic='force-dynamic';

type MatchRow={request_id:string;score:number;reasons:string[];service_requests:{service_id:string;district:string;neighborhood:string;preferred_timing:string;status:string}|null};

export default async function TradespersonRequestsPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris');
  const {data,error}=await supabase.from('request_matches').select('request_id,score,reasons,service_requests(service_id,district,neighborhood,preferred_timing,status)').eq('tradesperson_id',user.id).order('score',{ascending:false});
  const matches=(data??[]) as unknown as MatchRow[];
  return <main className="account-shell requests-page"><div className="requests-header"><Link className="account-back" href="/">← Ankara Usta</Link><div><span>USTA İŞ HAVUZU</span><h1>Eşleşen talepler</h1><p><Link href="/usta/musaitlik">Müsaitliğinizi güncelleyin</Link></p></div></div>{error?<p className="account-message">Eşleşmeler yüklenemedi.</p>:matches.length?<div className="request-list">{matches.map(match=>{const request=match.service_requests;const service=services.find(item=>item.id===request?.service_id);return <article key={match.request_id}><div><span>EŞLEŞME PUANI {match.score}</span><h2>{service?.name??request?.service_id}</h2><p>{request?.neighborhood}, {request?.district} · {request?.preferred_timing}</p><ul className="match-reasons">{match.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>{request?.status==='provider_selected'?<b>Usta seçildi</b>:<Link className="dialog-primary" href={`/usta/teklifler/${match.request_id}`}>Teklif oluştur</Link>}</article>})}</div>:<section className="account-card empty-requests"><h2>Henüz eşleşen talep yok</h2><p>Hizmet, bölge, doğrulama ve müsaitlik koşulları birlikte sağlandığında talepler burada görünür.</p></section>}</main>;
}
