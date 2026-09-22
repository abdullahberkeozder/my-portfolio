import WorkspaceSkeleton from '../components/skeletons/WorkspaceSkeleton';

export default function TaleplerimLoading() {
  return <WorkspaceSkeleton title="Taleplerim" count={3} ariaLabel="Müşteri talepleri yükleniyor…" />;
}
