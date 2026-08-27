import {NextResponse} from 'next/server';
import {z} from 'zod';
import {sanctionSchema} from '../../../../../domain';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Uyuşmazlık kimliği geçersiz.');const input=sanctionSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('apply_tradesperson_sanction',{p_dispute_id:id,p_type:input.type,p_reason:input.reason,p_ends_at:input.endsAt??null});if(error)throw error;return NextResponse.json({sanction:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Yaptırım kaydedilemedi.'},{status:409});}}
