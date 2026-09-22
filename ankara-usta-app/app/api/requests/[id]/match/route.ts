import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';

export async function POST(_request:Request,context:{params:Promise<{id:string}>}){
  try{
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Talep kimliği geçersiz.',400);
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    const {data,error}=await supabase.rpc('match_request',{p_request_id:id});
    if(error)throw error;
    return NextResponse.json({matching:data});
  }catch(error){
    return jsonApiError(error,'Eşleştirme çalıştırılamadı.');
  }
}
