import { describe, expect, it } from 'vitest';
import {
  parseDirectoryVisualFixture,
  resolveDirectoryAvailability,
} from '../../app/lib/directoryAvailability';

describe('directory visual fixtures', () => {
  it('accepts milestone fixtures only when the visual fixture gate is enabled', () => {
    expect(parseDirectoryVisualFixture('milestones', true)).toBe('milestones');
    expect(parseDirectoryVisualFixture('milestones', false)).toBeUndefined();
  });

  it.each(['limited', 'waitlist', 'unavailable'] as const)(
    'preserves the existing %s fixture',
    (fixture) => {
      expect(parseDirectoryVisualFixture(fixture, true)).toBe(fixture);
    }
  );

  it('rejects unknown fixture values', () => {
    expect(parseDirectoryVisualFixture('leaderboard', true)).toBeUndefined();
    expect(parseDirectoryVisualFixture(null, true)).toBeUndefined();
  });
});

describe('directory availability', () => {
  it('keeps availability decisions independent from visual fixtures', () => {
    expect(resolveDirectoryAvailability({
      filteredCount: 4,
      hasFilters: false,
      pilotScope: true,
    })).toBeUndefined();
  });
});
