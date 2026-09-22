import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../../lib/apiErrors';

const documentReviewSchema=z.object({status:z.enum(['verified','rejected','expired']),note:z.string().trim().min(3).max(2000),expiresAt:z.iso.date().optional()});

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Belge kimliği geçersiz.',400);
    const payload=documentReviewSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    const {data:role}=await supabase.from('user_roles').select('role').eq('user_id',user.id).in('role',['admin','moderator']).limit(1).maybeSingle();
    if(!role)return jsonPublicError('ADMIN_REQUIRED','Yönetici yetkisi gerekiyor.',403);
    const verified=payload.status==='verified';
    const {data,error}=await supabase.from('tradesperson_documents').update({status:payload.status,review_note:payload.note,expires_at:payload.expiresAt||null,verified_at:verified?new Date().toISOString():null,verified_by:verified?user.id:null}).eq('id',id).select('id,status').single();
    if(error)throw error;
    return NextResponse.json({document:data});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Belge inceleme bilgilerini kontrol edin.',400);
    return jsonApiError(error,'Belge incelemesi kaydedilemedi.');
  }
}
