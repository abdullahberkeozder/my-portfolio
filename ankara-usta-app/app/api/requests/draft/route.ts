import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { validateRequestDraft } from '../../../domain/requestPersistence';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error: 'Oturum açmanız gerekiyor.'}, {status: 401});

    const {payload, service} = validateRequestDraft(await request.json());
    const {data, error} = await supabase
      .rpc('upsert_request_draft', {
        p_idempotency_key: payload.idempotencyKey,
        p_service_id: service.id,
        p_delivery_model: service.deliveryModel,
        p_answers: payload.answers,
        p_district: payload.district || null,
        p_neighborhood: payload.neighborhood || null,
        p_preferred_timing: payload.preferredTiming || null,
      })
      .single();

    if (error) throw error;
    return NextResponse.json({request: data});
  } catch (error) {
    const message = error instanceof ZodError ? 'Talep verisi geçersiz.' : error instanceof Error ? error.message : 'Taslak kaydedilemedi.';
    return NextResponse.json({error: message}, {status: 400});
  }
}
