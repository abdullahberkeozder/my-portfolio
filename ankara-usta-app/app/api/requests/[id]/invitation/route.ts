import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {directedRequestsEnabled} from '../../../../lib/directedRequests';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';
import {invitationActionSchema} from '../../../../domain/requestInvitation';

export async function POST(request:Request,context:{params:Promise<{id:string}>}) {
  try {
    if(!directedRequestsEnabled())return jsonPublicError('FEATURE_DISABLED','Özel talepler henüz açılmadı.',503);
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Geçersiz talep.',400);
    const action=invitationActionSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonPublicError('AUTH_REQUIRED','Giriş yapmanız gerekiyor.',401);
    const {data,error}=await supabase.rpc('respond_request_invitation',{
      p_request_id:id,p_action:action.action,p_reason:action.action==='decline'?action.reason:null,p_confirm:action.action==='broaden',
    }).single();
    if(error)throw error;
    return NextResponse.json({invitation:data});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Ret gerekçesini veya paylaşım onayını kontrol edin.',400);
    return jsonApiError(error,'Talep durumu değişmiş olabilir. Sayfayı yenileyip tekrar deneyin.');
  }
}
