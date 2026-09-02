import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {z} from 'zod';
import RequestConversation from '../../../components/RequestConversation';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {prejobChatEnabled} from '../../../lib/prejobChat';
import type {ConversationSnapshot} from '../../../domain/requestConversation';

export const dynamic='force-dynamic';
export default async function ConversationPage({params}:{params:Promise<{requestId:string;professionalId:string}>}){
  if(!prejobChatEnabled())notFound();
  const {requestId,professionalId}=await params;
  if(!z.uuid().safeParse(requestId).success||!z.uuid().safeParse(professionalId).success)notFound();
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect(`/giris?next=${encodeURIComponent(`/gorusmeler/${requestId}/${professionalId}`)}`);
  const {data,error}=await supabase.rpc('request_conversation',{p_request_id:requestId,p_professional_id:professionalId,p_action:'fetch'});
  if(error||!data)return <main className="account-shell"><h1>Görüşme açılamadı</h1><p role="alert">Bu görüşmeye erişiminiz olmayabilir veya hizmet geçici olarak kullanılamıyor. Talebinize dönüp tekrar deneyin.</p><Link href={user.id===professionalId?'/usta/talepler':'/taleplerim'}>Taleplere dön</Link></main>;
  return <main className="account-shell"><Link className="account-back" href={user.id===professionalId?'/usta/talepler':`/taleplerim/${requestId}/teklifler`}>← Taleplere dön</Link><RequestConversation key={`${user.id}:${requestId}:${professionalId}`} requestId={requestId} professionalId={professionalId} currentUserId={user.id} initial={data as ConversationSnapshot}/></main>;
}
