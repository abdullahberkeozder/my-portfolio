import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeInternalNoteSchema} from '../../../../../domain';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../../../lib/apiErrors';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)return jsonPublicError('INVALID_INPUT','Uyuşmazlık kimliği geçersiz.',400);const {note}=disputeInternalNoteSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return jsonPublicError('AUTH_REQUIRED','Oturum açmanız gerekiyor.',401);const {data,error}=await supabase.rpc('add_dispute_internal_note',{p_dispute_id:id,p_note:note});if(error)throw error;return NextResponse.json({note:data},{status:201});}catch(error){if(error instanceof z.ZodError||error instanceof SyntaxError)return jsonPublicError('INVALID_INPUT','İç not bilgilerini kontrol edin.',400);return jsonApiError(error,'İç not eklenemedi.');}}
