import Link from 'next/link';
import { redirect } from 'next/navigation';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic='force-dynamic';
type JobRow={id:string;status:string;updated_at:string;customer_id:string;service_requests:{service_id:string}|null;tradesperson_profiles:{display_name:string}|null};

export default async function JobsPage(){const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/giris');const {data,error}=await supabase.from('jobs').select('id,status,updated_at,customer_id,service_requests(service_id),tradesperson_profiles(display_name)').order('updated_at',{ascending:false});const jobs=(data??[]) as unknown as JobRow[];return <main className="account-shell requests-page"><div className="requests-header"><Link className="account-back" href="/">← Ankara Usta</Link><div><span>İŞ YÖNETİMİ</span><h1>İşlerim</h1></div></div>{error?<p className="account-message">İşler yüklenemedi.</p>:jobs.length?<div className="request-list">{jobs.map(job=>{const service=services.find(item=>item.id===job.service_requests?.service_id);return <article key={job.id}><div><span>{job.status.replaceAll('_',' ')}</span><h2>{service?.name??job.service_requests?.service_id}</h2><p>{job.customer_id===user.id?job.tradesperson_profiles?.display_name??'Seçilen usta':'Müşteri işi'}</p></div><Link className="dialog-primary" href={`/islerim/${job.id}`}>İşi aç</Link></article>})}</div>:<section className="account-card empty-requests"><h2>Henüz aktif işiniz yok</h2><p>Bir teklif kabul edildiğinde mesajlar, kapsam ve iş aşamaları burada yönetilir.</p></section>}</main>}
