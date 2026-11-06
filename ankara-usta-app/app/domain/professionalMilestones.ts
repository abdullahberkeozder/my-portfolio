export type ProfessionalMilestoneThreshold = 5 | 20 | 50;

export interface ProfessionalMilestone {
  threshold: ProfessionalMilestoneThreshold;
  label: string;
  actualCount: number;
  explanation: string;
}

export const PROFESSIONAL_MILESTONE_THRESHOLDS: readonly ProfessionalMilestoneThreshold[] = [
  50, 20, 5,
];

/**
 * Pure resolver for public completed job milestones.
 * Returns null for unknown, non-finite, negative, 0, or below-threshold counts.
 * Returns 5 for 5..19, 20 for 20..49, and 50 for 50+.
 */
export function resolveMilestoneThreshold(
  rawCount: unknown
): ProfessionalMilestoneThreshold | null {
  if (rawCount === null || rawCount === undefined) return null;
  if (typeof rawCount !== 'number' && typeof rawCount !== 'string') return null;
  if (typeof rawCount === 'string' && rawCount.trim() === '') return null;

  const count = Number(rawCount);
  if (!Number.isFinite(count) || count < 5) return null;

  if (count >= 50) return 50;
  if (count >= 20) return 20;
  if (count >= 5) return 5;
  return null;
}

/**
 * Resolves full milestone metadata including explicit label, actual count,
 * and restrained explanation.
 * The explanation explicitly states the actual completed work count and notes
 * that this is not a quality score, rank, or trust indicator.
 * User-visible copy contains no em dashes.
 */
export function resolveProfessionalMilestone(
  rawCount: unknown
): ProfessionalMilestone | null {
  const threshold = resolveMilestoneThreshold(rawCount);
  if (!threshold) return null;

  const count = typeof rawCount === 'number' ? rawCount : Number(rawCount);
  const actualCount = Math.floor(count);

  return {
    threshold,
    label: `${threshold} iş tamamladı`,
    actualCount,
    explanation: `Bu usta platform üzerinden ${actualCount} iş tamamladı. Bu işaret bir kalite puanı veya sıralama değildir; yalnızca kayıtlı iş hacmini belirtir.`,
  };
}
