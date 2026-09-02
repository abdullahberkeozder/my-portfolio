// Enable only after the routing migration and multi-account access tests pass.
export function directedRequestsEnabled() {
  return process.env.ORKESTRA_DIRECT_REQUESTS_ENABLED === 'true';
}
