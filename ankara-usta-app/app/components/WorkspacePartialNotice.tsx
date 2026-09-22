import RetryButton from './RetryButton';

export default function WorkspacePartialNotice({
  message,
}: {
  message: string;
}) {
  return (
    <section className="workspace-partial-notice" role="alert">
      <div>
        <strong>Bazı güncel bilgiler alınamadı</strong>
        <p>{message}</p>
      </div>
      <RetryButton />
    </section>
  );
}
