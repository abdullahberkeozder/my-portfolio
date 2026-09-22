import { NextResponse } from 'next/server';
import { tradespersonDocumentInputSchema } from '../../../domain/tradespersonApplication';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';
import {z} from 'zod';

export async function POST(request:Request){
  try{
    const payload=tradespersonDocumentInputSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);
    if(!payload.storagePath.startsWith(`${user.id}/`))return jsonPublicError('INVALID_DOCUMENT_PATH','Belge yolu geçersiz.',403);
    const {data,error}=await supabase.from('tradesperson_documents').insert({tradesperson_id:user.id,kind:payload.kind,storage_path:payload.storagePath,original_name:payload.originalName,content_type:payload.contentType,byte_size:payload.byteSize,expires_at:payload.expiresAt||null}).select('id,status').single();
    if(error)throw error;
    return NextResponse.json({document:data});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Belge bilgilerini kontrol edin.',400);
    return jsonApiError(error,'Belge kaydedilemedi.');
  }
}

