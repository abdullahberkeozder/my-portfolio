import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminReviewControls from '../../components/AdminReviewControls';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import RetryButton from '../../components/RetryButton';
import Pagination from '../../components/Pagination';

import { getServerUserAndRoles } from '../../lib/authServer';

export const dynamic='force-dynamic';

type DocumentItem={id:string;kind:string;status:string;original_name:string;expires_at:string|null;storage_path?:string;signedUrl?:string|null};
type ApplicationRow={user_id:string;display_name:string;bio:string;application_status:string;submitted_at:string|null;review_note:string|null;tradesperson_services:{service_id:string}[];tradesperson_service_areas:{district:string}[];tradesperson_documents:DocumentItem[];tradesperson_references:{id:string;reference_name:string;relationship:string;status:string}[]};

export default async function AdminTradespersonQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
} = {}){
  const { user, roles } = await getServerUserAndRoles();
  if(!user) redirect('/giris?next=/yonetim/usta-basvurulari');
  if(!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const rawPage = Number.parseInt((await searchParams)?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = 12;

  const supabase=await createSupabaseServerClient();
  const {data,error,count}=await supabase
    .from('tradesperson_profiles')
    .select('user_id,display_name,bio,application_status,submitted_at,review_note,tradesperson_services(service_id),tradesperson_service_areas(district),tradesperson_documents(id,kind,status,original_name,expires_at,storage_path),tradesperson_references(id,reference_name,relationship,status)', { count: 'exact' })
    .in('application_status',['submitted','under_review','approved','reassessment_required','suspended'])
    .order('submitted_at',{ascending:true})
    .range((page - 1) * pageSize, page * pageSize - 1);

  const rawApplications=(data??[]) as ApplicationRow[];
  const applications=await Promise.all(rawApplications.map(async application=>{
    const docsWithUrls=await Promise.all(application.tradesperson_documents.map(async doc=>{
      let signedUrl:string|null=null;
      if(doc.storage_path){
        const {data:signData}=await supabase.storage.from('tradesperson-documents').createSignedUrl(doc.storage_path,1800);
        signedUrl=signData?.signedUrl??null;
      }
      return {...doc,signedUrl};
    }));
    return {...application,tradesperson_documents:docsWithUrls};
  }));

  const totalCount = count ?? applications.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="account-shell admin-queue">
      <Link className="account-back" href="/">← Orkestra</Link>
      <header>
        <span>YÖNETİM VE MODERASYON</span>
        <h1>Usta inceleme kuyruğu</h1>
        <p>Onaylar, belge kararları ve yeniden değerlendirmeler değiştirilemez audit kayıtları üretir.</p>
      </header>

      {error ? (
        <section className="account-card" role="alert">
          <h2>Kuyruk yüklenemedi</h2>
          <p>Veritabanı bağlantısını kontrol edip tekrar deneyin.</p>
          <RetryButton />
        </section>
      ) : applications.length ? (
        <>
          <div className="admin-application-list">
            {applications.map(application=>(
              <article key={application.user_id}>
                <div className="admin-application-summary">
                  <span>{application.application_status}</span>
                  <h2>{application.display_name}</h2>
                  <p>{application.bio}</p>
                  <dl>
                    <div><dt>Hizmetler</dt><dd>{application.tradesperson_services.map(item=>services.find(service=>service.id===item.service_id)?.name??item.service_id).join(', ')}</dd></div>
                    <div><dt>Bölgeler</dt><dd>{application.tradesperson_service_areas.map(item=>item.district).join(', ')}</dd></div>
                    <div><dt>Referanslar</dt><dd>{application.tradesperson_references.length||'Yok'}</dd></div>
                  </dl>
                </div>
                <AdminReviewControls tradespersonId={application.user_id} status={application.application_status} documents={application.tradesperson_documents} references={application.tradesperson_references}/>
              </article>
            ))}
          </div>
          <div className="admin-pagination-wrapper">
            <Pagination page={page} total={totalCount} pageSize={pageSize} path="/yonetim/usta-basvurulari" />
          </div>
        </>
      ) : (
        <section className="account-card empty-requests">
          <h2>İncelenecek başvuru yok</h2>
          <p>Yeni usta başvuruları burada görünecek.</p>
        </section>
      )}
    </main>
  );
}
