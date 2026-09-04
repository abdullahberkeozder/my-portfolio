// Presentation preference only. Never use editable metadata for authorization,
// matching eligibility, or disclosure of addresses.
export function pilotCityState(metadata: Record<string, unknown> | undefined) {
  const value=metadata?.service_city;
  if(typeof value!=='string'||!value.trim())return 'unset' as const;
  return value.trim().toLocaleLowerCase('tr-TR')==='ankara'?'ankara' as const:'unsupported' as const;
}
export const ankaraMapUrl='https://www.openstreetmap.org/export/embed.html?bbox=32.45%2C39.70%2C33.15%2C40.20&layer=mapnik';
export const ankaraMapLink='https://www.openstreetmap.org/#map=10/39.93/32.85';
