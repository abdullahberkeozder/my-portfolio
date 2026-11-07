export type DirectoryAvailability = 'limited' | 'waitlist' | 'unavailable';
export type DirectoryVisualFixture = DirectoryAvailability | 'milestones';

const FIXTURES: readonly DirectoryVisualFixture[] = [
  'limited',
  'waitlist',
  'unavailable',
  'milestones',
];

export function parseDirectoryVisualFixture(
  value: string | null | undefined,
  enabled: boolean
): DirectoryVisualFixture | undefined {
  if (!enabled || !value) return undefined;
  return FIXTURES.includes(value as DirectoryVisualFixture)
    ? value as DirectoryVisualFixture
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

