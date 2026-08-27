import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jobMessageInputSchema } from '../../../../domain';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const payload=jobMessageInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('send_job_message',{p_job_id:id,p_body:payload.body,p_idempotency_key:payload.idempotencyKey});if(error)throw error;return NextResponse.json({message:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Mesaj gönderilemedi.'},{status:400});}
}
