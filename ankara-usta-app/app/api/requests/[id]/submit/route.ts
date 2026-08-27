import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestDraft } from '../../../../domain/requestPersistence';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const submitSchema = z.object({idempotencyKey: z.uuid()});

export async function POST(request: Request, context: {params: Promise<{id: string}>}) {
  try {
    const {id} = await context.params;
    if (!z.uuid().safeParse(id).success) return NextResponse.json({error: 'Talep kimliği geçersiz.'}, {status: 400});

    const {idempotencyKey} = submitSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error: 'Oturum açmanız gerekiyor.'}, {status: 401});

    const {data: existing, error: readError} = await supabase
      .from('service_requests')
      .select('id,service_id,answers,district,neighborhood,preferred_timing,status,idempotency_key')
      .eq('id', id)
      .single();
    if (readError || !existing) return NextResponse.json({error: 'Talep bulunamadı.'}, {status: 404});
    if (existing.idempotency_key !== idempotencyKey) return NextResponse.json({error: 'Gönderim anahtarı uyuşmuyor.'}, {status: 409});
    if (['submitted','matching','quotes_received','provider_selected'].includes(existing.status)) return NextResponse.json({request: existing, idempotent: true});
    if (existing.status !== 'draft') return NextResponse.json({error: 'Bu talep artık gönderilemez.'}, {status: 409});

    validateRequestDraft({
      idempotencyKey,
      serviceId: existing.service_id,
      answers: existing.answers,
      district: existing.district,
      neighborhood: existing.neighborhood,
      preferredTiming: existing.preferred_timing,
    }, true);

    const {data, error} = await supabase
      .from('service_requests')
      .update({status: 'submitted', submitted_at: new Date().toISOString()})
      .eq('id', id)
      .eq('status', 'draft')
      .select('id,status,submitted_at')
      .single();
    if (error) throw error;
    const {data:matching,error:matchingError}=await supabase.rpc('match_request',{p_request_id:id});
    return NextResponse.json({request:data,matching:matching??null,matchingWarning:matchingError?.message??null,idempotent:false});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Talep gönderilemedi.'}, {status: 400});
  }
}
