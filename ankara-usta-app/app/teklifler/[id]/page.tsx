import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {quoteRevisionsEnabled} from '../../lib/quoteRevisions';
import {quoteTerms,revisionFieldLabels,type QuoteRecord} from '../../domain/quoteRevision';
import QuoteForm from '../../components/QuoteForm';
import QuoteChangeSummary from '../../components/QuoteChangeSummary';
import QuoteRevisionRequestForm from '../../components/QuoteRevisionRequestForm';
import styles from '../../components/quoteRevision.module.css';

export const dynamic='force-dynamic';
export default async function QuoteDetail({params}:{params:Promise<{id:string}>}){
  if(!quoteRevisionsEnabled())notFound();
  const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const client=await createSupabaseServerClient();const {data:{user}}=await client.auth.getUser();
  if(!user)redirect(`/giris?next=${encodeURIComponent(`/teklifler/${id}`)}`);
  const {data:row,error}=await client.from('quotes').select('*').eq('id',id).maybeSingle();
  if(error)return <main className="account-shell"><p role="alert">Teklif yüklenemedi. Tekrar deneyin.</p></main>;
  if(!row)notFound();const quote=row as QuoteRecord;
  const {data:request,error:requestError}=await client.from('service_requests').select('customer_id,status').eq('id',quote.request_id).maybeSingle();
  if(requestError)return <main className="account-shell"><p role="alert">Talep durumu yüklenemedi.</p></main>;
  if(!request||(user.id!==request.customer_id&&user.id!==quote.tradesperson_id))notFound();
  const [{data:history,error:historyError},{data:feedback,error:feedbackError},previous]=await Promise.all([
    client.from('quotes').select('id,version,status,supersedes_quote_id').eq('request_id',quote.request_id).eq('tradesperson_id',quote.tradesperson_id).order('version',{ascending:false}).limit(20),
    client.from('quote_revision_requests').select('id,fields,reason,created_at').eq('quote_id',quote.id).maybeSingle(),
    quote.supersedes_quote_id?client.from('quotes').select('*').eq('id',quote.supersedes_quote_id).eq('request_id',quote.request_id).eq('tradesperson_id',quote.tradesperson_id).maybeSingle():Promise.resolve({data:null,error:null}),
  ]);
  if(historyError||feedbackError||previous.error)return <main className="account-shell"><p role="alert">Teklif geçmişi yüklenemedi. Revizyon göndermeden önce tekrar deneyin.</p></main>;
  const latest=history?.[0];const current=latest?.id===quote.id;
  const actionable=current&&quote.status==='submitted'&&request.status==='quotes_received';
  const customer=user.id===request.customer_id;
  const terms=quoteTerms(quote);const money=(value:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(value/100);
  return <main className="account-shell"><div className={styles.page}>
    <Link href={customer?`/taleplerim/${quote.request_id}/teklifler`:`/usta/teklifler/${quote.request_id}`}>← Talebe dön</Link>
    <h1>Teklif · Sürüm {quote.version}</h1><p>{current?'Güncel sürüm':'Önceki sürüm · Yalnız okunabilir'}{quote.status==='accepted'?' · Kabul edildi':''}</p>
    {!current&&latest&&<Link href={`/teklifler/${latest.id}`}>Güncel sürümü aç →</Link>}
    <section className="account-card"><h2>{money(terms.laborAmountKurus+terms.materialAmountKurus)}</h2>
      <p>İşçilik {money(terms.laborAmountKurus)} · Malzeme {money(terms.materialAmountKurus)}</p><p>{terms.estimatedDurationMinutes} dakika · {terms.warrantyDays} gün işçilik garantisi</p>
      <h3>Dahil kapsam</h3><ul>{terms.includedScope.map((item,index)=><li key={index}>{item}</li>)}</ul>
      <h3>Hariç kapsam</h3>{terms.excludedScope.length?<ul>{terms.excludedScope.map((item,index)=><li key={index}>{item}</li>)}</ul>:<p>Belirtilmedi</p>}{terms.note&&<p>{terms.note}</p>}
    </section>
    {previous.data&&<QuoteChangeSummary before={quoteTerms(previous.data as QuoteRecord)} after={terms}/>}
    {feedback&&<section className={styles.feedback}><h2>Müşterinin revizyon isteği</h2><p>{(feedback.fields as (keyof typeof revisionFieldLabels)[]).map(field=>revisionFieldLabels[field]).join(' · ')}</p><p>{feedback.reason}</p><p>{!current?'Bu isteğin ardından yeni sürüm oluşturuldu. Koşulları karşılaştırın.':actionable?'Ustanın yeni teklifi bekleniyor.':'Talep kapandı. İstek geçmişte korunuyor.'}</p></section>}
    {customer&&actionable&&!feedback&&<QuoteRevisionRequestForm key={`${user.id}:${quote.id}`} quoteId={quote.id} currentUserId={user.id}/>}
    {!customer&&actionable&&<QuoteForm key={`${user.id}:${quote.id}`} requestId={quote.request_id} currentVersion={quote.version} initial={terms} baseQuoteId={quote.id} currentUserId={user.id}/>}
    <details><summary>Sürüm geçmişi (son 20)</summary><ul>{history?.map(item=><li key={item.id}><Link href={`/teklifler/${item.id}`}>Sürüm {item.version}{item.id===quote.id?' · Görüntülenen':''}</Link></li>)}</ul></details>
  </div></main>;
}
