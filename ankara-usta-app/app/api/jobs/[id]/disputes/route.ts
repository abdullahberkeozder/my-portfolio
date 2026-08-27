import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeInputSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const input=disputeInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('open_job_dispute',{p_job_id:id,p_category:input.category,p_description:input.description});if(error)throw error;return NextResponse.json({dispute:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Uyuşmazlık kaydı açılamadı.'},{status:409});}
}
