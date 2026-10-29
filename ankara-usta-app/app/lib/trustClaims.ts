export type PublicTrustClaim = { key: string; label: string; detail: string };

export function buildPublicTrustClaims(input: { verificationConfirmed: boolean; reviewCount?: number; averageRating?: number; completedJobs?: number; serviceAreaCount?: number }): PublicTrustClaim[] {
  const claims: PublicTrustClaim[] = [];
  if (input.verificationConfirmed) claims.push({ key: 'verified', label: 'Doğrulanmış profil', detail: 'Orkestra doğrulaması tamamlandı.' });
  if ((input.reviewCount ?? 0) > 0) claims.push({ key: 'reviews', label: `${input.reviewCount} onaylı yorum`, detail: `${(input.averageRating ?? 0).toFixed(1)}/5 ortalama puan.` });
  if ((input.completedJobs ?? 0) > 0) claims.push({ key: 'jobs', label: `${input.completedJobs} tamamlanan iş`, detail: 'Kamusal iş metriği.' });
  if ((input.serviceAreaCount ?? 0) > 0) claims.push({ key: 'area', label: `${input.serviceAreaCount} ilçede hizmet`, detail: 'Hizmet bölgeleri doğrulandı.' });
  return claims;
}
