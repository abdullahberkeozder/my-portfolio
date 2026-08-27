import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeAppealSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Uyuşmazlık kimliği geçersiz.');const {reason}=disputeAppealSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('submit_dispute_appeal',{p_dispute_id:id,p_reason:reason});if(error)throw error;return NextResponse.json({appeal:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'İtiraz kaydedilemedi.'},{status:409});}}
