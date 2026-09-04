import Link from 'next/link';
import RetryButton from '../components/RetryButton';
import { jobStatusLabel } from '../lib/presentationLabels';
import { redirect } from 'next/navigation';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import Pagination from '../components/Pagination';

export const dynamic = 'force-dynamic';

type JobRow = {
  id: string;
  status: string;
  updated_at: string;
  customer_id: string;
  service_requests: { service_id: string } | null;
  tradesperson_profiles: { display_name: string } | null;
};

export default async function JobsPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const rawPage=Number.parseInt((await searchParams).page??'1',10);
  const page=Number.isFinite(rawPage)&&rawPage>0?rawPage:1;
  const pageSize=12;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/islerim');

  const { data, error, count } = await supabase
    .from('jobs')
    .select('id,status,updated_at,customer_id,service_requests(service_id),tradesperson_profiles(display_name)',{count:'exact'})
    .order('updated_at', { ascending: false })
    .range((page-1)*pageSize,page*pageSize-1);


  const jobs = (data ?? []) as unknown as JobRow[];

  return (
    <main className="account-shell requests-page">

      <div className="page-body">
        <div className="requests-header">
          <Link className="account-back" href="/">← Ana Sayfa</Link>
          <div>
            <span>İŞ YÖNETİMİ</span>
            <h1>İşlerim</h1>
          </div>
        </div>

        {error ? (
          <section className="account-card" role="alert"><h2>İşler yüklenemedi</h2><p>Bağlantınızı kontrol edip tekrar deneyin.</p><RetryButton /></section>
        ) : jobs.length ? (
          <>
          <div className="request-list">
            {jobs.map(job => {
              const service = services.find(item => item.id === job.service_requests?.service_id);
              return (
                <article key={job.id}>
                  <div>
                    <span>{jobStatusLabel(job.status)}</span>
                    <h2>{service?.name ?? job.service_requests?.service_id}</h2>
                    <p>{job.customer_id === user.id ? job.tradesperson_profiles?.display_name ?? 'Seçilen usta' : 'Müşteri işi'}</p>
                  </div>
                  <Link className="dialog-primary" href={`/islerim/${job.id}`}>İşi incele</Link>
                </article>
              );
            })}
          </div>
          <Pagination page={page} total={count??0} pageSize={pageSize} path="/islerim" />
          </>
        ) : (
          <section className="account-card empty-requests">
            <h2>Henüz işiniz yok</h2>
            <p>Bir teklifi kabul ettiğinizde işin kapsamını ve mesajlarını burada takip edebilirsiniz.</p>
            <Link className="dialog-primary" href="/taleplerim">Taleplerime git</Link>
          </section>
        )}
      </div>
    </main>
  );
}
