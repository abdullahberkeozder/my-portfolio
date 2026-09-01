import { NextResponse } from 'next/server';
import { tradespersonDocumentInputSchema, validateTradespersonApplication } from '../../../domain/tradespersonApplication';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export async function POST(request:Request){
  try{
    const input=await request.json() as {document?:unknown};
    const payload=validateTradespersonApplication(input);
    const document=tradespersonDocumentInputSchema.parse(input.document);
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});

    if(!document.storagePath.startsWith(`${user.id}/`))return NextResponse.json({error:'Belge yolu geçersiz.'},{status:403});
    const {data:profile,error:submitError}=await supabase.rpc('submit_tradesperson_application',{
      p_display_name:payload.displayName,p_bio:payload.bio,p_service_ids:payload.serviceIds,
      p_districts:payload.districts,p_reference:payload.reference??null,
      p_document:{storagePath:document.storagePath,kind:document.kind,originalName:document.originalName,
        contentType:document.contentType,byteSize:document.byteSize,expiresAt:document.expiresAt??null},
    }).single();
    if(submitError)throw submitError;
    return NextResponse.json({profile});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Başvuru kaydedilemedi.'},{status:400})}
}
