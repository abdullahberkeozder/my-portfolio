/**
 * Orkestra Pilot Intake Circuit Breaker (ROLLBACK-01)
 *
 * Amaç: Talep patlaması, aşırı yüklenme veya operasyonel acil durum anında
 * yeni talep alımını (draft ve submit) sunucu düzeyinde derhal durdurmak.
 *
 * Varsayılan: Aktif (true).
 * Kapatmak için: ORKESTRA_PILOT_INTAKE_ENABLED=false
 */

export function isPilotIntakeEnabled(): boolean {
  const envVal = process.env.ORKESTRA_PILOT_INTAKE_ENABLED ?? process.env.PILOT_INTAKE_ENABLED;
  if (typeof envVal === 'string') {
    const normalized = envVal.trim().toLowerCase();
    if (normalized === 'false' || normalized === '0' || normalized === 'off' || normalized === 'disabled') {
      return false;
    }
  }
  return true;
}

export const INTAKE_PAUSED_RESPONSE = {
  code: 'INTAKE_PAUSED',
  message: 'Pilot talep alımı geçici olarak durdurulmuştur. Lütfen daha sonra tekrar deneyiniz.',
  status: 503,
} as const;
