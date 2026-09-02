import Link from 'next/link';
import {quoteRevisionsEnabled} from '../../../lib/quoteRevisions';
import RequestConversationLinks from '../../../components/RequestConversationLinks';
import {notFound,redirect} from 'next/navigation';
import {requestTimingLabel} from '../../../domain/requestTiming';
import QuoteForm from '../../../components/QuoteForm';
import RequestInvitationPanel from '../../../components/RequestInvitationPanel';
import RealtimeRefresh from '../../../components/RealtimeRefresh';
import {services} from '../../../data/serviceTaxonomy';
import {getWizardDefinition} from '../../../data/wizardDefinitions';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {directedRequestsEnabled} from '../../../lib/directedRequests';

export const dynamic='force-dynamic';

export default async function TradespersonQuotePage({params}:{params:Promise<{requestId:string}>}) {
  const {requestId}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris');
  const [{data:request,error:requestError},{data:match,error:matchError},{data:latestQuote,error:quoteError}]=await Promise.all([
    supabase.from('service_requests').select('*').eq('id',requestId).maybeSingle(),
    supabase.from('request_matches').select('score,reasons').eq('request_id',requestId).eq('tradesperson_id',user.id).maybeSingle(),
    supabase.from('quotes').select('id,version').eq('request_id',requestId).eq('tradesperson_id',user.id).order('version',{ascending:false}).limit(1).maybeSingle(),
  ]);
  if(requestError||matchError||quoteError)return <main className="account-shell"><p role="alert">Talep bilgileri yüklenemedi. Lütfen tekrar deneyin.</p></main>;
  if(!request)notFound();
  const direct=request.routing_mode==='direct';
  const invitationResult=direct&&directedRequestsEnabled()?await supabase.from('request_invitations').select('*').eq('request_id',requestId).eq('professional_id',user.id).maybeSingle():null;
  if(invitationResult?.error)return <main className="account-shell"><p role="alert">Davet durumu yüklenemedi.</p></main>;
  const invitation=invitationResult?.data;
  if(direct?!invitation:!match)notFound();
  const service=services.find(item=>item.id===request.service_id);
  const questions=getWizardDefinition(request.service_id).questions;
  const active=['submitted','matching','quotes_received'].includes(request.status);
  const revisionHref=quoteRevisionsEnabled()&&latestQuote?`/teklifler/${latestQuote.id}`:undefined;
  return <main className="account-shell quote-workspace">
    <RealtimeRefresh channelName={`tradesperson-quote-${requestId}`} subscriptions={[{table:'service_requests',filter:`id=eq.${requestId}`},{table:'request_matches',filter:`request_id=eq.${requestId}`},{table:'quotes',filter:`request_id=eq.${requestId}`},...(direct?[{table:'request_invitations',filter:`request_id=eq.${requestId}`}]:[])]} label="Talep ve teklif"/>
    <Link className="account-back" href="/usta/talepler">← İş fırsatları</Link>
    <section className="match-context">
      <span>{direct?'SİZE ÖZEL TALEP':`EŞLEŞME PUANI ${match?.score}`}</span>
      <h1>{service?.name??request.service_id}</h1>
      <p>{request.neighborhood}, {request.district} · {requestTimingLabel(request.preferred_timing??'')}</p>
      {match&&<ul>{(match.reasons as string[]).map(reason=><li key={reason}>{reason}</li>)}</ul>}
      <h2>İşin kapsamı</h2>
      <dl>{questions.filter(q=>request.answers?.[q.id]).map(q=><div key={q.id}><dt>{q.label}</dt><dd>{String(request.answers[q.id])}</dd></div>)}</dl>
    </section>
    {!active&&<p className="account-message">Bu talep yeni teklif veya ret yanıtı kabul etmiyor.</p>}
    <RequestConversationLinks requestId={requestId} professionalId={user.id}/>
    {revisionHref&&<section className="account-card"><h2>Teklifiniz ve revizyonlar</h2><Link href={revisionHref}>Müşterinin isteğini ve sürüm geçmişini incele →</Link></section>}
    {direct&&invitation?<RequestInvitationPanel key={invitation.status} invitation={invitation} serviceId={request.service_id} role="professional" canRespond={active} quoteVersion={!revisionHref&&match?latestQuote?.version??0:undefined}/>:active&&!revisionHref&&<QuoteForm requestId={requestId} currentVersion={latestQuote?.version??0}/>}
    {direct&&!match&&active&&<p className="account-message">Teklif için hizmet, bölge, belge ve müsaitlik koşullarının eşleşmesi gerekir. <Link href="/usta/musaitlik">Müsaitliğinizi kontrol edin</Link>; müşteri uygunluk kontrolünü yenileyebilir. Daveti reddetmek için eşleşme gerekmez.</p>}
  </main>;
}
