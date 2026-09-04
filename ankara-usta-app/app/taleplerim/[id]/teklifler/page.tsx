import Link from 'next/link';
import {quoteRevisionsEnabled} from '../../../lib/quoteRevisions';
import RequestConversationLinks from '../../../components/RequestConversationLinks';
import RequestInvitationPanel from '../../../components/RequestInvitationPanel';
import {directedRequestsEnabled} from '../../../lib/directedRequests';
import { notFound,redirect } from 'next/navigation';
import QuoteComparison,{type ComparableQuote} from '../../../components/QuoteComparison';
import RealtimeRefresh from '../../../components/RealtimeRefresh';
import { services } from '../../../data/serviceTaxonomy';
import { getWizardDefinition } from '../../../data/wizardDefinitions';
import type { DeliveryModel, RequestStatus } from '../../../domain/models';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import RequestScopeSummary,{RequestJourney} from '../../../components/RequestScopeSummary';

export const dynamic='force-dynamic';

type QuoteRow={id:string;version:number;status:string;labor_amount_kurus:number;material_amount_kurus:number;estimated_duration_minutes:number;warranty_days:number;included_scope:string[];excluded_scope:string[];note:string|null;tradesperson_id:string;tradesperson_profiles:{display_name:string}|null};

const supplyCopy={no_supply:'Şu anda dört zorunlu koşulu birlikte sağlayan usta bulunamadı. Zaman aralığını genişletmek arzı artırabilir.',limited_supply:'Bölgenizde sınırlı sayıda uygun usta var. Yeni uygunluk oluştuğunda eşleştirme yeniden çalıştırılabilir.',healthy:'Talebiniz için yeterli sayıda doğrulanmış ve müsait usta bulundu.'} as const;

export default async function CustomerQuotesPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{created?:string}>}){
  const {id}=await params;
  const created=(await searchParams).created==='1';
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris');
  const [{data:request,error:requestError},{data:run,error:runError},{data:matchRows,error:matchError},{data:quoteRows,error},{data:job,error:jobError}]=await Promise.all([
    supabase.from('service_requests').select('*').eq('id',id).eq('customer_id',user.id).maybeSingle(),
    supabase.from('matching_runs').select('supply_state,eligible_count,recommended_action,calculated_at').eq('request_id',id).maybeSingle(),
    supabase.from('request_matches').select('score,reasons,tradesperson_profiles(display_name)').eq('request_id',id).order('score',{ascending:false}).limit(5),
    supabase.from('quotes').select('id,version,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,warranty_days,included_scope,excluded_scope,note,tradesperson_id,tradesperson_profiles(display_name)').eq('request_id',id).in('status',['submitted','accepted']).order('created_at',{ascending:true}),
    supabase.from('jobs').select('id,status').eq('request_id',id).eq('customer_id',user.id).maybeSingle(),
  ]);
  if(requestError)return <main className="account-shell"><p role="alert">Talep yüklenemedi. Lütfen tekrar deneyin.</p></main>;
  if(!request)notFound();
  const direct=request.routing_mode==='direct';
  const invitationResult=direct&&directedRequestsEnabled()?await supabase.from('request_invitations').select('*').eq('request_id',id).eq('customer_id',user.id).maybeSingle():null;
  const invitation=invitationResult?.data;
  const service=services.find(item=>item.id===request.service_id);
  const questions=getWizardDefinition(request.service_id).questions;
  const quotes=((quoteRows??[]) as unknown as QuoteRow[]).map((quote):ComparableQuote=>({id:quote.id,tradespersonId:quote.tradesperson_id,status:quote.status,tradespersonName:quote.tradesperson_profiles?.display_name??'Usta',version:quote.version,laborAmountKurus:quote.labor_amount_kurus,materialAmountKurus:quote.material_amount_kurus,estimatedDurationMinutes:quote.estimated_duration_minutes,warrantyDays:quote.warranty_days,includedScope:quote.included_scope,excludedScope:quote.excluded_scope,note:quote.note,detailHref:quoteRevisionsEnabled()?`/teklifler/${quote.id}`:undefined}));
  const matched=(matchRows??[]) as unknown as {score:number;reasons:string[];tradesperson_profiles:{display_name:string}|null}[];
  return <main className="account-shell customer-quotes">
    <RealtimeRefresh channelName={`customer-quotes-${id}`} subscriptions={[{table:'service_requests',filter:`id=eq.${id}`},{table:'matching_runs',filter:`request_id=eq.${id}`},{table:'request_matches',filter:`request_id=eq.${id}`},{table:'quotes',filter:`request_id=eq.${id}`},{table:'jobs',filter:`request_id=eq.${id}`},...(direct&&directedRequestsEnabled()?[{table:'request_invitations',filter:`request_id=eq.${id}`}]:[])]} label="Talep çalışma alanı"/>
    <Link className="account-back" href="/taleplerim">← Taleplerim</Link>
    <header><span>TALEP ÇALIŞMA ALANI</span><h1>{service?.name??request.service_id}</h1><p>{request.neighborhood}, {request.district}</p></header>
    {created&&<p className="account-message" role="status">Talebiniz kaydedildi. Eşleşme ve teklif durumunu bu sayfadan takip edebilirsiniz.</p>}
    <RequestJourney status={request.status as RequestStatus} quoteCount={quotes.length} jobHref={job?.id?`/islerim/${job.id}`:undefined}/>
    {jobError&&request.status==='provider_selected'&&<p role="alert">İş bağlantısı yüklenemedi. İşlerim alanından güncel kaydı kontrol edin.</p>}
    <RequestScopeSummary serviceName={service?.name??request.service_id} deliveryModel={(service?.deliveryModel??request.delivery_model) as DeliveryModel} questions={questions} answers={request.answers??{}} district={request.district} neighborhood={request.neighborhood} timing={request.preferred_timing??''}/>
    <RequestConversationLinks requestId={id}/>
    {direct&&(invitation?<RequestInvitationPanel key={invitation.status} invitation={invitation} serviceId={request.service_id} role="customer" canRespond={['submitted','matching','quotes_received'].includes(request.status)}/>:<p role="alert">Özel talebin yanıt durumu şu anda alınamıyor.</p>)}
    {!direct&&(runError||matchError)&&<p role="alert">Eşleştirme bilgileri yüklenemedi.</p>}
    {!direct&&run&&<section className={`supply-state ${run.supply_state}`}><b>{run.eligible_count} uygun usta</b><p>{supplyCopy[run.supply_state as keyof typeof supplyCopy]}</p></section>}
    {!direct&&matched.length>0&&<section className="match-explanations"><h2>Eşleştirme nedenleri</h2>{matched.map(item=><article key={`${item.tradesperson_profiles?.display_name}-${item.score}`}><b>{item.tradesperson_profiles?.display_name??'Usta'} · {item.score}/100</b><p>{item.reasons.join(' · ')}</p></article>)}</section>}
    {error?<section className="account-card account-state-error" role="alert"><h2>Teklifler yüklenemedi</h2><p>Veriler geçici olarak alınamadı. Sayfayı yenileyerek tekrar deneyin.</p></section>:quotes.length?<><div className="quote-profile-links">{(quoteRows as unknown as QuoteRow[]).map(quote=><Link key={quote.id} href={`/ustalar/${quote.tradesperson_id}`}>{quote.tradesperson_profiles?.display_name??'Usta'} profilini incele →</Link>)}</div><QuoteComparison key={user.id} quotes={quotes} currentUserId={user.id} canAccept={request.status==='quotes_received'}/></>:<section className="account-card empty-requests"><h2>Henüz teklif yok</h2><p>{direct?'Seçtiğiniz ustanın gönderdiği teklif burada görünecek. Davetin yanıt durumunu yukarıdan takip edebilirsiniz.':'Uygun ustalar kapsamı inceleyip teklif gönderdiğinde burada teklifleri karşılaştırabilirsiniz.'}</p></section>}
  </main>;
}
