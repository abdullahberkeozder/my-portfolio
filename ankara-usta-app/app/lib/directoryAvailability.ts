export type DirectoryAvailability = 'limited' | 'waitlist' | 'unavailable' | 'empty';
export type DirectoryVisualFixture = DirectoryAvailability | 'milestones' | 'connection-error';

const FIXTURES: readonly DirectoryVisualFixture[] = [
  'limited',
  'waitlist',
  'unavailable',
  'empty',
  'milestones',
  'connection-error',
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
  if (input.filteredCount > 0) return undefined;
  if (!input.hasFilters) return 'empty';
  if (!input.pilotScope) return 'unavailable';
  if (input.hasGlobalSupply === true) return 'limited';
  if (input.hasGlobalSupply === false) return 'waitlist';
  return undefined;
}

