import WorkspaceSkeleton from '../components/skeletons/WorkspaceSkeleton';

export default function IslerimLoading() {
  return <WorkspaceSkeleton role="jobs" title="İşlerim" count={2} ariaLabel="İş odaları yükleniyor…" />;
}
