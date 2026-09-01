import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeStatementSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Uyuşmazlık kimliği geçersiz.');const {statement}=disputeStatementSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('add_dispute_statement',{p_dispute_id:id,p_statement:statement});if(error)throw error;return NextResponse.json({statement:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Yanıt kaydedilemedi.'},{status:409});}}
