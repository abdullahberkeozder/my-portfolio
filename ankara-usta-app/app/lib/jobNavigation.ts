export function navigateToJob(jobId: string) {
  window.location.assign(new URL(`/islerim/${encodeURIComponent(jobId)}`, window.location.origin).href);
}
