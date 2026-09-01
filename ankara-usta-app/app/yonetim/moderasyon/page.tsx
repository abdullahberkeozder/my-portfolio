import Link from 'next/link';
import {redirect} from 'next/navigation';
import ModerationQueue from '../../components/ModerationQueue';
import {createSupabaseServerClient} from '../../lib/supabase/server';

import { getServerUserAndRoles } from '../../lib/authServer';

export const dynamic='force-dynamic';
export default async function ModerationPage(){
  const { user, roles } = await getServerUserAndRoles();
  if(!user) redirect('/giris?next=/yonetim/moderasyon');
  if(!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const supabase=await createSupabaseServerClient();

  const [{data:media},{data:reviews},{count:disputeCount}]=await Promise.all([
    supabase.from('work_log_entries').select('id,kind,caption,storage_path,created_at').eq('moderation_status','pending').order('created_at'),
    supabase.from('reviews').select('id,rating,comment,created_at').eq('moderation_status','pending').order('created_at'),
    supabase.from('dispute_cases').select('id',{count:'exact',head:true}).not('status','in','(closed,dismissed)'),
  ]);
  const mediaItems=await Promise.all((media??[]).map(async item=>{const {data}=await supabase.storage.from('job-media').createSignedUrl(item.storage_path,1800);return{id:item.id,entityType:'work_log_entry' as const,title:item.kind==='after'?'İş sonrası kanıtı':'İş günlüğü kanıtı',description:item.caption||'Açıklama eklenmedi.',meta:new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(item.created_at)),previewUrl:data?.signedUrl??null}}));
  const items=[...mediaItems,...(reviews??[]).map(item=>({id:item.id,entityType:'review' as const,title:`${item.rating}/5 müşteri değerlendirmesi`,description:item.comment||'Metin yorumu bulunmuyor.',meta:'Tamamlanmış işe bağlı değerlendirme'}))];
  return <main className="account-shell admin-queue moderation-page"><Link className="account-back" href="/yonetim/usta-basvurulari">← Yönetim</Link><header><span>GÜVEN VE MODERASYON</span><h1>İçerik inceleme kuyruğu</h1><p>İş kanıtlarını ve tamamlanmış işe bağlı yorumları denetlenebilir bir akıştan yönetin.</p></header><nav className="admin-tabs"><Link href="/yonetim/usta-basvurulari">Usta başvuruları</Link><Link className="active" href="/yonetim/moderasyon">İçerik moderasyonu <b>{items.length}</b></Link><Link href="/yonetim/uyusmazliklar">Uyuşmazlıklar <b>{disputeCount??0}</b></Link></nav>{items.length?<ModerationQueue items={items}/>:<section className="account-card empty-requests"><h2>Kuyruk temiz</h2><p>Bekleyen iş görseli veya değerlendirme bulunmuyor.</p></section>}</main>;
}
