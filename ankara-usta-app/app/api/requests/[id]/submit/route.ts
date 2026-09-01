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

    const {data: existing, error: readError} = await supabase.from('service_requests')
      .select('id,service_id,answers,district,neighborhood,preferred_timing,status,idempotency_key')
      .eq('id', id).single();
    if (readError || !existing) return NextResponse.json({error: 'Talep bulunamadı.'}, {status: 404});
    validateRequestDraft({idempotencyKey, serviceId: existing.service_id, answers: existing.answers,
      district: existing.district, neighborhood: existing.neighborhood, preferredTiming: existing.preferred_timing}, true);

    const wasAlreadySubmitted = ['submitted','matching','quotes_received','provider_selected'].includes(existing.status);
    const {data, error} = await supabase.rpc('submit_request', {
      p_request_id: id,
      p_idempotency_key: idempotencyKey,
    }).single();
    if (error) throw error;

    const {data:matching,error:matchingError}=await supabase.rpc('match_request',{p_request_id:id});
    return NextResponse.json({request:data,matching:matching??null,matchingWarning:matchingError?.message??null,idempotent:wasAlreadySubmitted});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Talep gönderilemedi.'}, {status: 400});
  }
}
