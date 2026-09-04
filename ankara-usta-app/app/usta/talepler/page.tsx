import Link from 'next/link';
import {prejobChatEnabled} from '../../lib/prejobChat';
import {redirect} from 'next/navigation';
import {requestTimingLabel} from '../../domain/requestTiming';
import {type RequestInvitation} from '../../domain/requestInvitation';
import {services} from '../../data/serviceTaxonomy';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {directedRequestsEnabled} from '../../lib/directedRequests';
import RequestInvitationPanel from '../../components/RequestInvitationPanel';
import RealtimeRefresh from '../../components/RealtimeRefresh';
import PilotCityMap from '../../components/PilotCityMap';
import {pilotCityState} from '../../lib/pilotCity';

export const dynamic='force-dynamic';
type Scope={service_id:string;district:string;neighborhood:string;preferred_timing:string;status:string;routing_mode?:string};
type Opportunity={request_id:string;score?:number;reasons?:string[];service_requests:Scope|null};
type InvitationRow=RequestInvitation&Opportunity;

export default async function TradespersonRequestsPage({searchParams}:{searchParams:Promise<{view?:string;page?:string}>}) {
  const params=await searchParams;
  const enabled=directedRequestsEnabled();
  const view=enabled&&params.view!=='open'?'direct':'open';
  const page=Math.min(1000,Math.max(1,parseInt(params.page??'1',10)||1));
  const pageSize=12;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris?next=/usta/talepler');
  let rows:Opportunity[]=[];let invitations:InvitationRow[]=[];let failed=false;let count=0;
  if(view==='direct') {
    const result=await supabase.from('request_invitations').select('*,service_requests!request_invitations_request_id_fkey(service_id,district,neighborhood,preferred_timing,status)',{count:'exact'})
      .eq('professional_id',user.id).order('created_at',{ascending:false}).order('request_id').range((page-1)*pageSize,page*pageSize-1);
    invitations=(result.data??[]) as unknown as InvitationRow[];rows=invitations;failed=Boolean(result.error);count=result.count??0;
  } else {
    let query=supabase.from('request_matches').select('request_id,score,reasons,service_requests!inner(*)',{count:'exact'}).eq('tradesperson_id',user.id);
    if(enabled)query=query.eq('service_requests.routing_mode','open');
    const result=await query.order('score',{ascending:false}).order('request_id').range((page-1)*pageSize,page*pageSize-1);
    rows=(result.data??[]) as unknown as Opportunity[];failed=Boolean(result.error);count=result.count??0;
  }
  return <main className="account-shell requests-page">
    <div className="public-profile-container">
      <h1>İş fırsatları</h1><Link href="/usta/musaitlik">Müsaitliğimi güncelle →</Link>
      <PilotCityMap cityState={pilotCityState(user.user_metadata)}/>
      {prejobChatEnabled()&&<p><Link className="account-back" href="/gorusmeler">Özel görüşmelerim →</Link></p>}
      {enabled&&<RealtimeRefresh channelName={`opportunities-${user.id}`} subscriptions={[{table:'request_invitations',filter:`professional_id=eq.${user.id}`},{table:'request_matches',filter:`tradesperson_id=eq.${user.id}`}]} label="İş fırsatları"/>}
      <nav className="pagination" aria-label="Talep türü">
        {enabled&&<Link href="/usta/talepler?view=direct" aria-current={view==='direct'?'page':undefined}>Bana özel talepler</Link>}
        <Link href="/usta/talepler?view=open" aria-current={view==='open'?'page':undefined}>Uygun açık talepler</Link>
      </nav>
      {failed?<p className="account-message" role="alert">Talepler yüklenemedi. Lütfen sayfayı yenileyin.</p>:rows.length?<div className="request-list">{rows.map(row=>{
        const request=row.service_requests;if(!request)return null;
        const invitation=invitations.find(i=>i.request_id===row.request_id);
        return <article key={row.request_id}><div>
          <h2>{services.find(s=>s.id===request.service_id)?.name??request.service_id}</h2>
          <p>{request.neighborhood}, {request.district} · {requestTimingLabel(request.preferred_timing)}</p>
          {invitation?<RequestInvitationPanel key={invitation.status} invitation={invitation} serviceId={request.service_id} role="professional" compact/>:<><p>Eşleşme puanı: {row.score}/100</p><ul>{row.reasons?.map(reason=><li key={reason}>{reason}</li>)}</ul></>}
        </div><Link className="dialog-primary" href={`/usta/teklifler/${row.request_id}`}>Talebi incele</Link></article>;
      })}</div>:<section className="account-card"><h2>{view==='direct'?'Henüz size özel talep yok':'Uygun açık talep bulunamadı'}</h2><p>{view==='direct'?'Müşterilerin doğrudan size gönderdiği talepler burada görünür.':'Hizmet, bölge, doğrulama ve müsaitlik koşullarınıza uygun talepler burada listelenir.'}</p></section>}
      <nav className="pagination" aria-label="Talep sayfaları">{page>1&&<Link href={`/usta/talepler?view=${view}&page=${page-1}`}>← Önceki</Link>}<span>Sayfa {page}</span>{page*pageSize<count&&<Link href={`/usta/talepler?view=${view}&page=${page+1}`}>Sonraki →</Link>}</nav>
    </div>
  </main>;
}
