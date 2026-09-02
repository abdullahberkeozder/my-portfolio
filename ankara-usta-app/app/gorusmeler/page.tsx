import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {prejobChatEnabled} from '../lib/prejobChat';
import {createSupabaseServerClient} from '../lib/supabase/server';
import Pagination from '../components/Pagination';

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
  return <main className="account-shell"><h1>Özel görüşmelerim</h1><p>Talep sonuçlansa da yalnız katıldığınız görüşmeler burada kalır.</p>
    {error?<p role="alert">Görüşmeler yüklenemedi. Sayfayı yenileyerek tekrar deneyin.</p>:data?.length?<div className="request-list">{(data as unknown as Row[]).map(room=><article key={room.id}><div><h2>{user.id===room.professional_id?'Müşteriyle görüşme':room.tradesperson_profiles?.display_name??'Ustayla görüşme'}</h2><p>Talep {room.request_id.slice(0,8)} · {new Date(room.created_at).toLocaleDateString('tr-TR')}</p></div><Link className="dialog-primary" href={`/gorusmeler/${room.request_id}/${room.professional_id}`}>Görüşmeyi aç</Link></article>)}</div>:<p>Henüz görüşmeniz yok. Gönderilmiş talebin teklif ekranından görüşme başlatabilirsiniz.</p>}
    {!error&&<Pagination page={page} total={count??0} pageSize={20} path="/gorusmeler"/>}
  </main>;
}
