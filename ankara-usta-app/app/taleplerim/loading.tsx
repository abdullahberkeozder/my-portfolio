import WorkspaceSkeleton from '../components/skeletons/WorkspaceSkeleton';

export default function TaleplerimLoading() {
  return <WorkspaceSkeleton role="customer" title="Taleplerim" count={3} ariaLabel="Müşteri talepleri yükleniyor…" />;
}
