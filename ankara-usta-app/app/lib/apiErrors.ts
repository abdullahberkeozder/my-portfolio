export type PublicApiError = {
  code: string;
  message: string;
  correlationId: string;
  status: number;
};

const ERROR_CODE_MAP: Record<string, { message: string; status: number }> = {
  // PostgreSQL Constraints
  '23505': { message: 'Bu kayıt zaten mevcut veya daha önce oluşturulmuş.', status: 409 },
  '23503': { message: 'İlişkili kayıt bulunamadı veya silinmiş.', status: 400 },
  '23502': { message: 'Zorunlu bir alan eksik bırakıldı.', status: 400 },
  '23514': { message: 'Talep veya seçilen ustanın uygunluğu değişti. Hizmet, bölge ve usta durumunu kontrol edin.', status: 422 },
  '22P02': { message: 'Geçersiz veri biçimi veya kimlik formatı.', status: 400 },
  '42501': { message: 'Bu işlem için yetkiniz bulunmuyor.', status: 403 },

  // PostgREST / Supabase errors
  'PGRST116': { message: 'Aranan kayıt bulunamadı.', status: 404 },
  'PGRST301': { message: 'Kaynak taşınmış veya erişilemiyor.', status: 301 },
  'JWT_EXPIRED': { message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.', status: 401 },
};

export function mapDatabaseError(error: unknown, fallbackMessage = 'İşlem sırasında bir hata oluştu.'): PublicApiError {
  const correlationId = `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  if (typeof error === 'object' && error !== null) {
    const errObj = error as { code?: string; message?: string; status?: number };
    const mapped = errObj.code ? ERROR_CODE_MAP[errObj.code] : undefined;

    if (mapped) {
      return {
        code: errObj.code!,
        message: mapped.message,
        correlationId,
        status: mapped.status,
      };
    }

    if (errObj.message && errObj.message.includes('JWT')) {
      return {
        code: 'JWT_EXPIRED',
        message: ERROR_CODE_MAP['JWT_EXPIRED'].message,
        correlationId,
        status: 401,
      };
    }
  }

  return {
    code: 'INTERNAL_ERROR',
    message: fallbackMessage,
    correlationId,
    status: 500,
  };
}

export function publicErrorBody(error: unknown, fallbackMessage?: string) {
  const mapped = mapDatabaseError(error, fallbackMessage);
  return {
    error: mapped.message,
    code: mapped.code,
    correlationId: mapped.correlationId,
    status: mapped.status,
  };
}
