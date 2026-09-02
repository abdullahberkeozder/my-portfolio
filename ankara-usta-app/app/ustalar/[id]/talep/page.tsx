import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {z} from 'zod';
import {services} from '../../../data/serviceTaxonomy';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {directedRequestsEnabled} from '../../../lib/directedRequests';
import DirectedRequestEntry from '../../../components/DirectedRequestEntry';

export const dynamic='force-dynamic';

export default async function DirectedRequestPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{service?:string;draftId?:string;resume?:string}>}) {
  const {id}=await params;
  const {service:serviceId,draftId}=await searchParams;
  if(!z.uuid().safeParse(id).success)notFound();
  if(!directedRequestsEnabled())return <main className="account-shell"><section className="account-card"><h1>Ustaya özel talepler henüz açılmadı</h1><p>Talebiniz başka ustalara gönderilmedi.</p><Link href={`/ustalar/${id}`}>Profile dön</Link></section></main>;
  const service=services.find(item=>item.id===serviceId);
  if(!service)redirect(`/ustalar/${id}`);
  const client=await createSupabaseServerClient();
  const [profile,offering,areas,verification]=await Promise.all([
    client.from('tradesperson_profiles').select('user_id,display_name').eq('user_id',id).eq('application_status','approved').maybeSingle(),
    client.from('tradesperson_services').select('service_id').eq('tradesperson_id',id).eq('service_id',service.id).maybeSingle(),
    client.from('tradesperson_service_areas').select('district').eq('tradesperson_id',id),
    client.rpc('has_current_professional_verification',{provider_id:id}),
  ]);
  if(profile.error||offering.error||areas.error||verification.error)return <main className="account-shell"><p role="alert">Usta bilgileri yüklenemedi. Lütfen yeniden deneyin.</p><Link href={`/ustalar/${id}`}>Profile dön</Link></main>;
  if(!profile.data||!offering.data||!areas.data?.length)notFound();
  if(verification.data!==true)return <main className="account-shell"><p role="status">Bu ustanın mesleki doğrulaması güncel olmadığı için şu anda talep gönderilemiyor.</p><Link href={`/ustalar/${id}`}>Profile dön</Link></main>;
  let remoteDraft;
  if(draftId) {
    if(!z.uuid().safeParse(draftId).success)notFound();
    const {data:{user}}=await client.auth.getUser();
    if(!user)redirect(`/giris?next=${encodeURIComponent(`/ustalar/${id}/talep?service=${service.id}&draftId=${draftId}`)}`);
    const {data,error}=await client.from('service_requests').select('*').eq('id',draftId).eq('customer_id',user.id).eq('status','draft').eq('service_id',service.id).eq('target_professional_id',id).single();
    if(error||!data)notFound();
    remoteDraft={answers:data.answers??{},district:data.district??'',neighborhood:data.neighborhood??'',timing:data.preferred_timing??'this_week',step:0,idempotencyKey:data.idempotency_key,requestId:data.id,updatedAt:Date.parse(data.updated_at),routingMode:'direct' as const,targetProfessionalId:id};
  }
  return <main className="account-shell"><DirectedRequestEntry service={service} target={{id,name:profile.data.display_name,districts:[...new Set(areas.data.map(area=>area.district))]}} remoteDraft={remoteDraft}/></main>;
}
