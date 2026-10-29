import WorkspaceSkeleton from '../../components/skeletons/WorkspaceSkeleton';

export default function UstaTaleplerLoading() {
  return <WorkspaceSkeleton role="tradesperson" title="İş Fırsatları" count={3} ariaLabel="Usta iş fırsatları yükleniyor…" />;
}
