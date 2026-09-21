import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { jsonApiError } from '../../../../../lib/apiErrors';

const reviewSchema=z.object({action:z.enum(['start_review','needs_changes','approve','reject','reassess','suspend']),note:z.string().trim().min(3).max(2000)});
const targets={start_review:'under_review',needs_changes:'needs_changes',approve:'approved',reject:'rejected',reassess:'reassessment_required',suspend:'suspended'} as const;

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return jsonApiError('Usta kimliği geçersiz.',undefined,400);
    const payload=reviewSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonApiError('Oturum açmanız gerekiyor.',undefined,401);
    const {data:role}=await supabase.from('user_roles').select('role').eq('user_id',user.id).in('role',['admin','moderator']).limit(1).maybeSingle();
    if(!role)return jsonApiError('Yönetici yetkisi gerekiyor.',undefined,403);
    const target=targets[payload.action];
    const {data,error}=await supabase.from('tradesperson_profiles').update({application_status:target,review_note:payload.note,reviewed_at:new Date().toISOString(),reviewed_by:user.id}).eq('user_id',id).select('user_id,application_status').single();
    if(error)throw error;
    return NextResponse.json({profile:data});
  }catch(error){
    return jsonApiError(error,'İnceleme kaydedilemedi.',400);
  }
}
