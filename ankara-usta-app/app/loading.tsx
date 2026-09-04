import OrchestraLogo from './components/OrchestraLogo';
import OrkestraWordmark from './components/OrkestraWordmark';
import Skeleton from './components/Skeleton';

export default function Loading() {
  return (
    <>

      <main className="system-state-shell" aria-busy="true" aria-label="Sayfa yükleniyor">
        <section className="system-state-card">
          <div className="system-state-brand"><OrchestraLogo size={44} /><OrkestraWordmark /></div>
          <h1>Sayfa yükleniyor</h1>
          <p>Lütfen bekleyin.</p>
          <div className="system-state-skeletons" aria-hidden="true">
            <Skeleton height="18px" width="68%" />
            <Skeleton height="18px" width="92%" />
            <Skeleton height="52px" width="100%" />
          </div>
        </section>
      </main>
    </>
  );
}
