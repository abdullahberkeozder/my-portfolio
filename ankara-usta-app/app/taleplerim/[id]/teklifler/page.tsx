import Link from 'next/link';
import { notFound,redirect } from 'next/navigation';
import QuoteComparison,{type ComparableQuote} from '../../../components/QuoteComparison';
import RealtimeRefresh from '../../../components/RealtimeRefresh';
import { services } from '../../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic='force-dynamic';

type QuoteRow={id:string;version:number;status:string;labor_amount_kurus:number;material_amount_kurus:number;estimated_duration_minutes:number;warranty_days:number;included_scope:string[];excluded_scope:string[];note:string|null;tradesperson_id:string;tradesperson_profiles:{display_name:string}|null};

const supplyCopy={no_supply:'Şu anda dört zorunlu koşulu birlikte sağlayan usta bulunamadı. Zaman aralığını genişletmek arzı artırabilir.',limited_supply:'Bölgenizde sınırlı sayıda uygun usta var. Yeni uygunluk oluştuğunda eşleştirme yeniden çalıştırılabilir.',healthy:'Talebiniz için yeterli sayıda doğrulanmış ve müsait usta bulundu.'} as const;

export default async function CustomerQuotesPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris');
  const [{data:request},{data:run},{data:matchRows},{data:quoteRows,error}]=await Promise.all([
    supabase.from('service_requests').select('service_id,status,district,neighborhood').eq('id',id).single(),
    supabase.from('matching_runs').select('supply_state,eligible_count,recommended_action,calculated_at').eq('request_id',id).maybeSingle(),
    supabase.from('request_matches').select('score,reasons,tradesperson_profiles(display_name)').eq('request_id',id).order('score',{ascending:false}).limit(5),
    supabase.from('quotes').select('id,version,status,labor_amount_kurus,material_amount_kurus,estimated_duration_minutes,warranty_days,included_scope,excluded_scope,note,tradesperson_id,tradesperson_profiles(display_name)').eq('request_id',id).in('status',['submitted','accepted']).order('created_at',{ascending:true}),
  ]);
  if(!request)notFound();
  const service=services.find(item=>item.id===request.service_id);
  const quotes=((quoteRows??[]) as unknown as QuoteRow[]).map((quote):ComparableQuote=>({id:quote.id,tradespersonName:quote.tradesperson_profiles?.display_name??'Usta',version:quote.version,laborAmountKurus:quote.labor_amount_kurus,materialAmountKurus:quote.material_amount_kurus,estimatedDurationMinutes:quote.estimated_duration_minutes,warrantyDays:quote.warranty_days,includedScope:quote.included_scope,excludedScope:quote.excluded_scope,note:quote.note}));
  const matched=(matchRows??[]) as unknown as {score:number;reasons:string[];tradesperson_profiles:{display_name:string}|null}[];
  return <main className="account-shell customer-quotes"><RealtimeRefresh channelName={`customer-quotes-${id}`} subscriptions={[{table:'service_requests',filter:`id=eq.${id}`},{table:'matching_runs',filter:`request_id=eq.${id}`},{table:'request_matches',filter:`request_id=eq.${id}`},{table:'quotes',filter:`request_id=eq.${id}`}]} label="Teklifler"/><Link className="account-back" href="/taleplerim">← Taleplerim</Link><header><span>TEKLİF KARŞILAŞTIRMA</span><h1>{service?.name??request.service_id}</h1><p>{request.neighborhood}, {request.district}</p></header>{run&&<section className={`supply-state ${run.supply_state}`}><b>{run.eligible_count} uygun usta</b><p>{supplyCopy[run.supply_state as keyof typeof supplyCopy]}</p></section>}<section className="match-explanations"><h2>Eşleştirme nedenleri</h2>{matched.map(item=><article key={`${item.tradesperson_profiles?.display_name}-${item.score}`}><b>{item.tradesperson_profiles?.display_name??'Usta'} · {item.score}/100</b><p>{item.reasons.join(' · ')}</p></article>)}</section>{error?<section className="account-card account-state-error" role="alert"><h2>Teklifler yüklenemedi</h2><p>Veriler geçici olarak alınamadı. Sayfayı yenileyerek tekrar deneyin.</p></section>:quotes.length?<><div className="quote-profile-links">{(quoteRows as unknown as QuoteRow[]).map(quote=><Link key={quote.id} href={`/ustalar/${quote.tradesperson_id}`}>{quote.tradesperson_profiles?.display_name??'Usta'} profilini incele →</Link>)}</div><QuoteComparison quotes={quotes}/></>:<section className="account-card empty-requests"><h2>Teklifler bekleniyor</h2><p>Uygun ustalar kapsamı inceleyip teklif gönderdiğinde burada en fazla üç teklifi yan yana karşılaştırabilirsiniz.</p></section>}</main>;
}
