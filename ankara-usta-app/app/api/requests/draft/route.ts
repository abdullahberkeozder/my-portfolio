import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { validateRequestDraft } from '../../../domain/requestPersistence';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { directedRequestsEnabled } from '../../../lib/directedRequests';
import { publicErrorBody } from '../../../lib/apiErrors';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error: 'Oturum açmanız gerekiyor.'}, {status: 401});

    const {payload, service} = validateRequestDraft(await request.json());
    if (payload.routingMode === 'direct' && !directedRequestsEnabled()) {
      return NextResponse.json({error:'Ustaya özel talepler henüz kullanıma açılmadı.'},{status:503});
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
      return NextResponse.json({error:'Taslağın hedef ustası değiştirilemez. Yeni bir talep başlatın.'},{status:409});
    }
    return NextResponse.json({request: data});
  } catch (error) {
    if(error instanceof ZodError || error instanceof Error) return NextResponse.json({error:'Talep verisi geçersiz. Hizmet ve kapsamı kontrol edin.'},{status:400});
    const body=publicErrorBody(error,'Taslak kaydedilemedi. Seçilen ustanın hizmet ve bölge uygunluğunu kontrol edin.');
    return NextResponse.json(body,{status:body.status});
  }
}
