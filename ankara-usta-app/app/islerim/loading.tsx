import WorkspaceSkeleton from '../components/skeletons/WorkspaceSkeleton';

export default function IslerimLoading() {
  return <WorkspaceSkeleton title="İşlerim" count={2} ariaLabel="İş odaları yükleniyor…" />;
}
