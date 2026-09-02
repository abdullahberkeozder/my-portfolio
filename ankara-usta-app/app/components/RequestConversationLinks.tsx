import Link from 'next/link';
import {prejobChatEnabled} from '../lib/prejobChat';
import {createSupabaseServerClient} from '../lib/supabase/server';

export default async function RequestConversationLinks({requestId,professionalId}:{requestId:string;professionalId?:string}){
  if(!prejobChatEnabled())return null;
  if(professionalId)return <section className="account-card"><h2>Müşteriyle kapsamı netleştirin</h2><Link href={`/gorusmeler/${requestId}/${professionalId}`}>Özel görüşmeyi aç →</Link></section>;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return null;
  const {data:request,error}=await supabase.from('service_requests').select('routing_mode,target_professional_id,status').eq('id',requestId).eq('customer_id',user.id).maybeSingle();
  if(error||!request)return <p role="alert">Görüşme bağlantıları yüklenemedi.</p>;
  const [{data:rooms,error:roomError},{data:matches,error:matchError}]=await Promise.all([
    supabase.from('request_conversations').select('professional_id,tradesperson_profiles(display_name)').eq('request_id',requestId).eq('customer_id',user.id),
    supabase.from('request_matches').select('tradesperson_id,tradesperson_profiles(display_name)').eq('request_id',requestId),
  ]);
  if(roomError||matchError)return <p role="alert">Özel görüşmeler yüklenemedi. Tekrar deneyin.</p>;
  const people=new Map<string,string>();
  type Named={tradesperson_profiles:{display_name:string}|null};
  for(const room of (rooms??[]) as unknown as (Named&{professional_id:string})[])people.set(room.professional_id,room.tradesperson_profiles?.display_name??'Usta');
  if(['submitted','matching','quotes_received'].includes(request.status)){
    if(request.routing_mode==='direct')people.set(request.target_professional_id,people.get(request.target_professional_id)??'Seçtiğiniz usta');
    else for(const match of (matches??[]) as unknown as (Named&{tradesperson_id:string})[])people.set(match.tradesperson_id,match.tradesperson_profiles?.display_name??'Usta');
  }
  if(!people.size)return null;
  return <section className="account-card"><h2>İş öncesi özel görüşmeler</h2><p>Her ustayla ayrı görüşürsünüz. Ustalar diğer görüşmelerinizi göremez.</p><ul>{[...people].map(([id,name])=><li key={id}><Link href={`/gorusmeler/${requestId}/${id}`}>{name} ile görüş →</Link></li>)}</ul></section>;
}
