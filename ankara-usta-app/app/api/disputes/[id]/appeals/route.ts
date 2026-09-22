import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeAppealSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../lib/apiErrors';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Uyuşmazlık kimliği geçersiz.',400);const {reason}=disputeAppealSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);const {data,error}=await supabase.rpc('submit_dispute_appeal',{p_dispute_id:id,p_reason:reason});if(error)throw error;return NextResponse.json({appeal:data},{status:201});}catch(error){if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','İtiraz gerekçesini kontrol edin.',400);return jsonApiError(error,'İtiraz kaydedilemedi.');}}
