import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeInternalNoteSchema} from '../../../../../domain';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Uyuşmazlık kimliği geçersiz.');const {note}=disputeInternalNoteSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('add_dispute_internal_note',{p_dispute_id:id,p_note:note});if(error)throw error;return NextResponse.json({note:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'İç not eklenemedi.'},{status:409});}}
