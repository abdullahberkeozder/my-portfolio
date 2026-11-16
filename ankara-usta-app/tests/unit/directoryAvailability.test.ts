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

  it('accepts connection-error fixtures only when the visual fixture gate is enabled', () => {
    expect(parseDirectoryVisualFixture('connection-error', true)).toBe('connection-error');
    expect(parseDirectoryVisualFixture('connection-error', false)).toBeUndefined();
  });

  it.each(['limited', 'waitlist', 'unavailable', 'empty', 'connection-error'] as const)(
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

  it('distinguishes an unfiltered empty directory from a filtered empty result', () => {
    expect(resolveDirectoryAvailability({
      filteredCount: 0,
      hasFilters: false,
      pilotScope: true,
    })).toBe('empty');

    expect(resolveDirectoryAvailability({
      filteredCount: 0,
      hasFilters: true,
      hasGlobalSupply: true,
      pilotScope: true,
    })).toBe('limited');
  });

  it('keeps an unknown global supply result neutral', () => {
    expect(resolveDirectoryAvailability({
      filteredCount: 0,
      hasFilters: true,
      hasGlobalSupply: undefined,
      pilotScope: true,
    })).toBeUndefined();
  });
});
