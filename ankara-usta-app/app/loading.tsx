import DiscoveryGridSkeleton from './components/skeletons/DiscoveryGridSkeleton';
import OrchestraLogo from './components/OrchestraLogo';
import OrkestraWordmark from './components/OrkestraWordmark';

export default function Loading() {
  return (
    <>
      <div className="sr-only">
        <OrchestraLogo />
        <OrkestraWordmark />
      </div>
      <DiscoveryGridSkeleton ariaLabel="Orkestra keşif alanı yükleniyor…" />
    </>
  );
}
