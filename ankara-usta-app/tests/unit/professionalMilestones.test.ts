import { describe, expect, it } from 'vitest';
import {
  PROFESSIONAL_MILESTONE_THRESHOLDS,
  resolveMilestoneThreshold,
  resolveProfessionalMilestone,
} from '../../app/domain/professionalMilestones';

describe('professionalMilestones domain logic', () => {
  it('exports milestone thresholds in descending priority', () => {
    expect(PROFESSIONAL_MILESTONE_THRESHOLDS).toEqual([50, 20, 5]);
  });

  describe('resolveMilestoneThreshold', () => {
    it('returns null for unknown and invalid values', () => {
      expect(resolveMilestoneThreshold(undefined)).toBeNull();
      expect(resolveMilestoneThreshold(null)).toBeNull();
      expect(resolveMilestoneThreshold(NaN)).toBeNull();
      expect(resolveMilestoneThreshold(Infinity)).toBeNull();
      expect(resolveMilestoneThreshold(-Infinity)).toBeNull();
      expect(resolveMilestoneThreshold('')).toBeNull();
      expect(resolveMilestoneThreshold('   ')).toBeNull();
      expect(resolveMilestoneThreshold('abc')).toBeNull();
      expect(resolveMilestoneThreshold({})).toBeNull();
      expect(resolveMilestoneThreshold([])).toBeNull();
      expect(resolveMilestoneThreshold(true)).toBeNull();
      expect(resolveMilestoneThreshold(false)).toBeNull();
    });

    it('returns null for negative numbers and zero without claiming 0 work', () => {
      expect(resolveMilestoneThreshold(-1)).toBeNull();
      expect(resolveMilestoneThreshold(-100)).toBeNull();
      expect(resolveMilestoneThreshold(0)).toBeNull();
      expect(resolveMilestoneThreshold(-0)).toBeNull();
    });

    it('returns null for below-threshold counts (1..4)', () => {
      expect(resolveMilestoneThreshold(1)).toBeNull();
      expect(resolveMilestoneThreshold(2)).toBeNull();
      expect(resolveMilestoneThreshold(3)).toBeNull();
      expect(resolveMilestoneThreshold(4)).toBeNull();
      expect(resolveMilestoneThreshold(4.99)).toBeNull();
    });

    it('returns 5 for counts between 5 and 19', () => {
      expect(resolveMilestoneThreshold(5)).toBe(5);
      expect(resolveMilestoneThreshold(5.2)).toBe(5);
      expect(resolveMilestoneThreshold(10)).toBe(5);
      expect(resolveMilestoneThreshold(19)).toBe(5);
      expect(resolveMilestoneThreshold(19.9)).toBe(5);
      expect(resolveMilestoneThreshold('5')).toBe(5);
      expect(resolveMilestoneThreshold('19')).toBe(5);
    });

    it('returns 20 for counts between 20 and 49', () => {
      expect(resolveMilestoneThreshold(20)).toBe(20);
      expect(resolveMilestoneThreshold(25)).toBe(20);
      expect(resolveMilestoneThreshold(49)).toBe(20);
      expect(resolveMilestoneThreshold(49.9)).toBe(20);
      expect(resolveMilestoneThreshold('20')).toBe(20);
      expect(resolveMilestoneThreshold('49')).toBe(20);
    });

    it('returns 50 for counts 50 and above', () => {
      expect(resolveMilestoneThreshold(50)).toBe(50);
      expect(resolveMilestoneThreshold(51)).toBe(50);
      expect(resolveMilestoneThreshold(100)).toBe(50);
      expect(resolveMilestoneThreshold(1000)).toBe(50);
      expect(resolveMilestoneThreshold('50')).toBe(50);
      expect(resolveMilestoneThreshold('120')).toBe(50);
    });
  });

  describe('resolveProfessionalMilestone', () => {
    it('returns null when threshold cannot be resolved', () => {
      expect(resolveProfessionalMilestone(null)).toBeNull();
      expect(resolveProfessionalMilestone(undefined)).toBeNull();
      expect(resolveProfessionalMilestone(0)).toBeNull();
      expect(resolveProfessionalMilestone(4)).toBeNull();
      expect(resolveProfessionalMilestone(-5)).toBeNull();
    });

    it('resolves 5 completed jobs milestone with actual count and restrained explanation', () => {
      const milestone = resolveProfessionalMilestone(14);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(5);
      expect(milestone?.label).toBe('5 iş tamamladı');
      expect(milestone?.actualCount).toBe(14);
      expect(milestone?.explanation).toContain('14 iş tamamladı');
      expect(milestone?.explanation).toContain('kalite puanı veya sıralama değildir');
      // Constraint: No em dash in user-visible copy
      expect(milestone?.label).not.toContain('—');
      expect(milestone?.explanation).not.toContain('—');
    });

    it('resolves 20 completed jobs milestone with actual count', () => {
      const milestone = resolveProfessionalMilestone(35);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(20);
      expect(milestone?.label).toBe('20 iş tamamladı');
      expect(milestone?.actualCount).toBe(35);
      expect(milestone?.explanation).toContain('35 iş tamamladı');
      expect(milestone?.explanation).not.toContain('—');
    });

    it('resolves 50 completed jobs milestone with actual count', () => {
      const milestone = resolveProfessionalMilestone(82);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(50);
      expect(milestone?.label).toBe('50 iş tamamladı');
      expect(milestone?.actualCount).toBe(82);
      expect(milestone?.explanation).toContain('82 iş tamamladı');
      expect(milestone?.explanation).not.toContain('—');
    });

    it('does not contain rank, quality, level, or competition claims in copy', () => {
      const milestone5 = resolveProfessionalMilestone(7);
      const milestone20 = resolveProfessionalMilestone(23);
      const milestone50 = resolveProfessionalMilestone(60);

      const allCopy = [
        milestone5?.label,
        milestone5?.explanation,
        milestone20?.label,
        milestone20?.explanation,
        milestone50?.label,
        milestone50?.explanation,
      ].join(' ');

      expect(allCopy).not.toMatch(/seviye/i);
      expect(allCopy).not.toMatch(/elit/i);
      expect(allCopy).not.toMatch(/lider/i);
      expect(allCopy).not.toMatch(/en iyi/i);
      expect(allCopy).not.toMatch(/ödül/i);
      expect(allCopy).not.toMatch(/madalya/i);
    });
  });
});
