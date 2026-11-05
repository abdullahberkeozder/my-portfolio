export type DirectoryAvailability = 'limited' | 'waitlist' | 'unavailable';

const FIXTURES: readonly DirectoryAvailability[] = ['limited', 'waitlist', 'unavailable'];

export function parseDirectoryVisualFixture(
  value: string | null | undefined,
  enabled: boolean
): DirectoryAvailability | undefined {
  if (!enabled || !value) return undefined;
  return FIXTURES.includes(value as DirectoryAvailability)
    ? value as DirectoryAvailability
    : undefined;
}

export function resolveDirectoryAvailability(input: {
  filteredCount: number;
  hasGlobalSupply?: boolean;
  hasFilters: boolean;
  pilotScope: boolean;
}): DirectoryAvailability | undefined {
  if (input.filteredCount > 0 || !input.hasFilters) return undefined;
  if (!input.pilotScope) return 'unavailable';
  if (input.hasGlobalSupply === true) return 'limited';
  return 'waitlist';
}

