import { NextResponse } from 'next/server';
import { tradespersonDocumentInputSchema } from '../../../domain/tradespersonApplication';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request:Request){
  try{
    const payload=tradespersonDocumentInputSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});
    if(!payload.storagePath.startsWith(`${user.id}/`))return NextResponse.json({error:'Belge yolu geçersiz.'},{status:403});
    const {data,error}=await supabase.from('tradesperson_documents').insert({tradesperson_id:user.id,kind:payload.kind,storage_path:payload.storagePath,original_name:payload.originalName,content_type:payload.contentType,byte_size:payload.byteSize,expires_at:payload.expiresAt||null}).select('id,status').single();
    if(error)throw error;
    return NextResponse.json({document:data});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Belge kaydedilemedi.'},{status:400})}
}

