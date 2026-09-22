import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { validateRequestDraft } from '../../../domain/requestPersistence';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { directedRequestsEnabled } from '../../../lib/directedRequests';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';
import { isPilotIntakeEnabled, INTAKE_PAUSED_RESPONSE } from '../../../lib/pilotIntake';

export async function POST(request: Request) {
  try {
    if (!isPilotIntakeEnabled()) {
      return jsonPublicError(INTAKE_PAUSED_RESPONSE.code, INTAKE_PAUSED_RESPONSE.message, INTAKE_PAUSED_RESPONSE.status);
    }
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);

    let validated:ReturnType<typeof validateRequestDraft>;
    try{validated=validateRequestDraft(await request.json());}
    catch{return jsonPublicError('INVALID_INPUT','Talep verisi geçersiz. Hizmet ve kapsamı kontrol edin.',400);}
    const {payload,service}=validated;
    if (payload.routingMode === 'direct' && !directedRequestsEnabled()) {
      return jsonPublicError('FEATURE_DISABLED','Ustaya özel talepler henüz kullanıma açılmadı.',503);
    }
    const {data, error} = await supabase
      .rpc(payload.routingMode === 'direct' ? 'upsert_direct_request_draft' : 'upsert_request_draft', {
        ...(payload.routingMode === 'direct' ? {p_target_professional_id:payload.targetProfessionalId} : {}),
        p_idempotency_key: payload.idempotencyKey,
        p_service_id: service.id,
        p_delivery_model: service.deliveryModel,
        p_answers: payload.answers,
        p_district: payload.district || null,
        p_neighborhood: payload.neighborhood || null,
        p_preferred_timing: payload.preferredTiming || null,
      })
      .single<{id:string;target_professional_id?:string|null}>();

    if (error) throw error;
    if (data?.target_professional_id && data.target_professional_id !== payload.targetProfessionalId) {
      return jsonPublicError('TARGET_PROFESSIONAL_CHANGED','Taslağın hedef ustası değiştirilemez. Yeni bir talep başlatın.',409);
    }
    return NextResponse.json({request: data});
  } catch (error) {
    if(error instanceof ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Talep verisi geçersiz. Hizmet ve kapsamı kontrol edin.',400);
    return jsonApiError(error,'Taslak kaydedilemedi. Seçilen ustanın hizmet ve bölge uygunluğunu kontrol edin.');
  }
}
