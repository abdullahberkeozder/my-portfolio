import { redirect } from 'next/navigation';
import Link from 'next/link';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  draft: 'Taslak', submitted: 'Gönderildi', matching: 'Ustalar aranıyor', quotes_received: 'Teklifler geldi',
  provider_selected: 'Usta seçildi', cancelled: 'İptal edildi', expired: 'Süresi doldu',
};

export default async function MyRequestsPage() {
  const supabase = await createSupabaseServerClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect('/giris');

  const {data: requests, error} = await supabase
    .from('service_requests')
    .select('id,service_id,status,district,neighborhood,updated_at,submitted_at')
    .order('updated_at', {ascending: false});

  return <main className="account-shell requests-page"><div className="requests-header"><Link className="account-back" href="/">← Ankara Usta</Link><div><span>MÜŞTERİ ALANI</span><h1>Taleplerim</h1></div></div>{error?<p className="account-message">Talepler yüklenemedi.</p>:requests?.length?<div className="request-list">{requests.map((request)=>{const service=services.find((item)=>item.id===request.service_id);return <article key={request.id}><div><span>{statusLabels[request.status] ?? request.status}</span><h2>{service?.name ?? request.service_id}</h2><p>{request.neighborhood&&request.district?`${request.neighborhood}, ${request.district}`:'Konum henüz eklenmedi'}</p></div><div className="request-card-actions"><time>{new Intl.DateTimeFormat('tr-TR', {dateStyle:'medium',timeStyle:'short'}).format(new Date(request.updated_at))}</time>{request.status!=='draft'&&<Link href={`/taleplerim/${request.id}/teklifler`}>Eşleşme ve teklifler →</Link>}</div></article>})}</div>:<section className="account-card empty-requests"><h2>Henüz talebiniz yok</h2><p>Ana sayfada ihtiyacınızı yazarak ilk talebinizi oluşturabilirsiniz.</p><Link className="dialog-primary" href="/">Hizmet ara</Link></section>}</main>;
}
