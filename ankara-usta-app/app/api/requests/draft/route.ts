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
      .from('service_requests')
      .upsert({
        customer_id: user.id,
        service_id: service.id,
        delivery_model: service.deliveryModel,
        answers: payload.answers,
        district: payload.district || null,
        neighborhood: payload.neighborhood || null,
        preferred_timing: payload.preferredTiming || null,
        idempotency_key: payload.idempotencyKey,
      }, {onConflict: 'customer_id,idempotency_key'})
      .select('id,status,updated_at')
      .single();

    if (error) throw error;
    return NextResponse.json({request: data});
  } catch (error) {
    const message = error instanceof ZodError ? 'Talep verisi geçersiz.' : error instanceof Error ? error.message : 'Taslak kaydedilemedi.';
    return NextResponse.json({error: message}, {status: 400});
  }
}

