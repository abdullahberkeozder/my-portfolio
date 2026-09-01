import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminReviewControls from '../../components/AdminReviewControls';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';

import { getServerUserAndRoles } from '../../lib/authServer';

export const dynamic='force-dynamic';

type ApplicationRow={user_id:string;display_name:string;bio:string;application_status:string;submitted_at:string|null;review_note:string|null;tradesperson_services:{service_id:string}[];tradesperson_service_areas:{district:string}[];tradesperson_documents:{id:string;kind:string;status:string;original_name:string;expires_at:string|null}[];tradesperson_references:{id:string;reference_name:string;relationship:string;status:string}[]};

export default async function AdminTradespersonQueuePage(){
  const { user, roles } = await getServerUserAndRoles();
  if(!user) redirect('/giris?next=/yonetim/usta-basvurulari');
  if(!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from('tradesperson_profiles').select('user_id,display_name,bio,application_status,submitted_at,review_note,tradesperson_services(service_id),tradesperson_service_areas(district),tradesperson_documents(id,kind,status,original_name,expires_at),tradesperson_references(id,reference_name,relationship,status)').in('application_status',['submitted','under_review','approved','reassessment_required','suspended']).order('submitted_at',{ascending:true});

  const applications=(data??[]) as ApplicationRow[];
  return <main className="account-shell admin-queue"><Link className="account-back" href="/">← Ankara Usta</Link><header><span>YÖNETİM VE MODERASYON</span><h1>Usta inceleme kuyruğu</h1><p>Onaylar, belge kararları ve yeniden değerlendirmeler değiştirilemez audit kayıtları üretir.</p></header>{error?<p className="account-message">Kuyruk yüklenemedi.</p>:applications.length?<div className="admin-application-list">{applications.map(application=><article key={application.user_id}><div className="admin-application-summary"><span>{application.application_status}</span><h2>{application.display_name}</h2><p>{application.bio}</p><dl><div><dt>Hizmetler</dt><dd>{application.tradesperson_services.map(item=>services.find(service=>service.id===item.service_id)?.name??item.service_id).join(', ')}</dd></div><div><dt>Bölgeler</dt><dd>{application.tradesperson_service_areas.map(item=>item.district).join(', ')}</dd></div><div><dt>Referanslar</dt><dd>{application.tradesperson_references.length||'Yok'}</dd></div></dl></div><AdminReviewControls tradespersonId={application.user_id} status={application.application_status} documents={application.tradesperson_documents} references={application.tradesperson_references}/></article>)}</div>:<section className="account-card empty-requests"><h2>İncelenecek başvuru yok</h2><p>Yeni usta başvuruları burada görünecek.</p></section>}</main>;
}
