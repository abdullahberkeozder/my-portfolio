import AppHeader from './components/AppHeader';
import NeighborhoodBond from './components/NeighborhoodBond';
import Skeleton from './components/Skeleton';

export default function Loading() {
  return (
    <>
      <AppHeader />
      <main className="system-state-shell" aria-busy="true" aria-label="Sayfa yükleniyor">
        <section className="system-state-card">
          <NeighborhoodBond variant="brand" className="system-state-mark" />
          <span>ORKESTRA</span>
          <h1>Bilgiler hazırlanıyor</h1>
          <p>İhtiyacınıza ait güncel kapsam ve iş kayıtları güvenli biçimde getiriliyor.</p>
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
