import Link from 'next/link';
import RetryButton from '../components/RetryButton';
import { jobStatusLabel } from '../lib/presentationLabels';
import { redirect } from 'next/navigation';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import Pagination from '../components/Pagination';
import styles from '../components/decisionWorkspace.module.css';

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
    <main className={`account-shell ${styles.workspace}`}>

      <div className="page-body">
        <header className={styles.intro}><div><h1>İşlerim</h1><p>Kabul edilen tekliflerin kapsamını, mesajlarını ve tamamlanma durumunu takip edin.</p></div></header>

        {error ? (
          <section className="account-card" role="alert"><h2>İşler yüklenemedi</h2><p>Bağlantınızı kontrol edip tekrar deneyin.</p><RetryButton /></section>
        ) : jobs.length ? (
          <>
          <div className={styles.list}>
            {jobs.map(job => {
              const service = services.find(item => item.id === job.service_requests?.service_id);
              return (
                <article className={styles.item} key={job.id}>
                  <div>
                    <span className={styles.itemMeta}>{jobStatusLabel(job.status)}</span>
                    <h2>{service?.name ?? job.service_requests?.service_id}</h2>
                    <p>{job.customer_id === user.id ? job.tradesperson_profiles?.display_name ?? 'Seçilen usta' : 'Müşteri işi'}</p>
                  </div>
                  <Link className={styles.itemLink} href={`/islerim/${job.id}`}>İş detayına git <span aria-hidden="true">→</span></Link>
                </article>
              );
            })}
          </div>
          <Pagination page={page} total={count??0} pageSize={pageSize} path="/islerim" />
          </>
        ) : (
          <section className={styles.empty}>
            <h2>Henüz işiniz yok</h2>
            <p>Bir teklifi kabul ettiğinizde işin kapsamını ve mesajlarını burada takip edebilirsiniz.</p>
            <Link className={styles.itemLink} href="/taleplerim">Taleplerime git <span aria-hidden="true">→</span></Link>
          </section>
        )}
      </div>
    </main>
  );
}
