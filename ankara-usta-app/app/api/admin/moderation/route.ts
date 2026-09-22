import {NextResponse} from 'next/server';
import {moderationDecisionInputSchema} from '../../../domain';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {z} from 'zod';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';

export async function POST(request:Request){
  try{const input=moderationDecisionInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);const {data,error}=await supabase.rpc('moderate_entity',{p_entity_type:input.entityType,p_entity_id:input.entityId,p_action:input.action,p_reason:input.reason});if(error)throw error;return NextResponse.json({decision:data},{status:201});}catch(error){if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','Moderasyon kararı bilgilerini kontrol edin.',400);return jsonApiError(error,'Moderasyon kararı uygulanamadı.');}
}
