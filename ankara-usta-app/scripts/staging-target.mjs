// Fail closed before authentication or writes. A boolean flag alone is not isolation.
export function assertStagingTarget(env) {
  const ref = env.E2E_STAGING_PROJECT_REF;
  if (!/^[a-z]{20}$/.test(ref ?? '') || ref === 'qzrktfyouloqxjbkhjce') {
    throw new Error('A separate E2E_STAGING_PROJECT_REF is required; production is forbidden.');
  }
  const url = new URL(env.E2E_SUPABASE_URL);
  if (url.origin !== `https://${ref}.supabase.co` || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('E2E_SUPABASE_URL must exactly match the approved staging project.');
  }
  if (env.E2E_ALLOW_STAGING_WRITES !== 'true') throw new Error('Staging writes must be explicitly enabled.');
}
