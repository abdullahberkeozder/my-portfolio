import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {prejobChatEnabled} from '../lib/prejobChat';
import {createSupabaseServerClient} from '../lib/supabase/server';
import Pagination from '../components/Pagination';
import styles from '../components/decisionWorkspace.module.css';

export const dynamic='force-dynamic';
export default async function ConversationInbox({searchParams}:{searchParams:Promise<{page?:string}>}){
  if(!prejobChatEnabled())notFound();
  const page=Math.min(1000,Math.max(1,parseInt((await searchParams).page??'1',10)||1));
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect('/giris?next=/gorusmeler');
  const {data,error,count}=await supabase.from('request_conversations')
    .select('id,request_id,customer_id,professional_id,created_at,tradesperson_profiles(display_name)',{count:'exact'})
    .or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`)
    .order('created_at',{ascending:false}).order('id').range((page-1)*20,page*20-1);
  type Row={id:string;request_id:string;customer_id:string;professional_id:string;created_at:string;tradesperson_profiles:{display_name:string}|null};
  return <main className={`account-shell ${styles.workspace}`}><header className={styles.intro}><div><h1>Görüşmeler</h1><p>Talebinizle ilgili konuşmalar yalnız sizinle ilgili usta arasında kalır.</p></div></header>
    {error?<section className={styles.empty} role="alert"><h2>Görüşmeler yüklenemedi</h2><p>Sayfayı yenileyerek tekrar deneyin.</p></section>:data?.length?<div className={styles.list}>{(data as unknown as Row[]).map(room=><article className={styles.item} key={room.id}><div><span className={styles.itemMeta}>Talep {room.request_id.slice(0,8)} · {new Date(room.created_at).toLocaleDateString('tr-TR')}</span><h2>{user.id===room.professional_id?'Müşteriyle görüşme':room.tradesperson_profiles?.display_name??'Ustayla görüşme'}</h2><p>Bu konuşmanın mesajlarını ve teklif öncesi ayrıntıları inceleyin.</p></div><Link className={styles.itemLink} href={`/gorusmeler/${room.request_id}/${room.professional_id}`}>Görüşmeye git <span aria-hidden="true">→</span></Link></article>)}</div>:<section className={styles.empty}><h2>Henüz görüşmeniz yok</h2><p>Gönderilmiş bir talebin teklif ekranından ustayla görüşme başlatabilirsiniz.</p><Link className={styles.itemLink} href="/taleplerim">Taleplerime git <span aria-hidden="true">→</span></Link></section>}
    {!error&&<Pagination page={page} total={count??0} pageSize={20} path="/gorusmeler"/>}
  </main>;
}
