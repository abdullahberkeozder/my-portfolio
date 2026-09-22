import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestDraft } from '../../../../domain/requestPersistence';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import {directedRequestsEnabled} from '../../../../lib/directedRequests';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';
import { isPilotIntakeEnabled, INTAKE_PAUSED_RESPONSE } from '../../../../lib/pilotIntake';

const submitSchema = z.object({idempotencyKey: z.uuid()});

export async function POST(request: Request, context: {params: Promise<{id: string}>}) {
  try {
    if (!isPilotIntakeEnabled()) {
      return jsonPublicError(INTAKE_PAUSED_RESPONSE.code, INTAKE_PAUSED_RESPONSE.message, INTAKE_PAUSED_RESPONSE.status);
    }

    const {id} = await context.params;
    if (!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Talep kimliği geçersiz.',400);

    const {idempotencyKey} = submitSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);

    const {data: existing, error: readError} = await supabase.from('service_requests')
      .select('*')
      .eq('id', id).eq('customer_id',user.id).single();
    if (readError || !existing)return jsonPublicError('NOT_FOUND','Talep bulunamadı.',404);
    if(existing.routing_mode==='direct'&&!directedRequestsEnabled())return jsonPublicError('FEATURE_DISABLED','Ustaya özel talepler henüz kullanıma açılmadı.',503);
    try{
      validateRequestDraft({idempotencyKey,serviceId:existing.service_id,answers:existing.answers,
        routingMode:existing.routing_mode??'open',targetProfessionalId:existing.target_professional_id??undefined,
        district:existing.district,neighborhood:existing.neighborhood,preferredTiming:existing.preferred_timing},true);
    }catch{return jsonPublicError('INVALID_INPUT','Talep verisi geçersiz. Hizmet ve kapsamı kontrol edin.',400);}

    const wasAlreadySubmitted = ['submitted','matching','quotes_received','provider_selected'].includes(existing.status);
    const {data, error} = await supabase.rpc('submit_request', {
      p_request_id: id,
      p_idempotency_key: idempotencyKey,
    }).single();
    if (error) throw error;

    const {data:matching,error:matchingError}=await supabase.rpc('match_request',{p_request_id:id});
    return NextResponse.json({request:data,matching:matching??null,matchingWarning:matchingError?'Eşleştirme henüz tamamlanamadı. Talep ekranından yeniden deneyebilirsiniz.':null,idempotent:wasAlreadySubmitted});
  } catch (error) {
    if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Talep verisi geçersiz. Hizmet ve kapsamı kontrol edin.',400);
    return jsonApiError(error,'Talep gönderilemedi.');
  }
}
