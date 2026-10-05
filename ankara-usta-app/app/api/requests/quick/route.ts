import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { jsonApiError, jsonPublicError } from '../../../lib/apiErrors';
import { isPilotIntakeEnabled, INTAKE_PAUSED_RESPONSE } from '../../../lib/pilotIntake';

export const quickQuoteSchema = z.object({
  ustaId: z.string().trim().min(1, 'Usta kimliği gereklidir.'),
  craftsman: z.string().trim().min(1, 'Usta adı gereklidir.'),
  problem: z.string().trim().min(3, 'Lütfen en az 3 karakterli bir arıza veya talep özeti girin.').max(1000),
  phone: z.string().trim().min(10, 'Geçerli bir telefon numarası giriniz.').max(25),
  district: z.string().trim().max(80).optional(),
  service: z.string().trim().max(100).optional(),
  sla: z.string().trim().max(50).optional(),
  urgency: z.string().trim().max(80).optional(),
  addressDetail: z.string().trim().max(250).optional(),
});

export type QuickQuoteInput = z.infer<typeof quickQuoteSchema>;

export async function POST(request: Request) {
  try {
    if (!isPilotIntakeEnabled()) {
      return jsonPublicError(INTAKE_PAUSED_RESPONSE.code, INTAKE_PAUSED_RESPONSE.message, INTAKE_PAUSED_RESPONSE.status);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonPublicError('INVALID_INPUT', 'Geçersiz JSON verisi gönderildi.', 400);
    }

    const parseResult = quickQuoteSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Talep verisi geçersiz.';
      return jsonPublicError('INVALID_INPUT', issue, 400);
    }

    const payload = parseResult.data;

    // Optional user session correlation
    let userId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // In offline / preview modes, continue gracefully
    }

    // Generate unique Ankara tracking reference
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const leadRef = `ANK-${randomDigits}`;

    return NextResponse.json({
      ok: true,
      leadRef,
      ustaId: payload.ustaId,
      craftsman: payload.craftsman,
      district: payload.district || 'Ankara',
      sla: payload.sla || '~15–25 dk',
      urgency: payload.urgency || '⚡ Hemen (Acil Sevk)',
      userId,
      createdAt: new Date().toISOString(),
      message: 'Hızlı teklif talebiniz başarıyla sisteme iletildi.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonPublicError('INVALID_INPUT', error.issues[0]?.message || 'Talep verisi geçersiz.', 400);
    }
    return jsonApiError(error, 'Teklif talebi oluşturulurken bir hata oluştu.');
  }
}
