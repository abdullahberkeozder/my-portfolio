import { NextResponse } from 'next/server';
import { z } from 'zod';
import { inspectionAppointmentInputSchema } from '../../../../domain';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const payload=inspectionAppointmentInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('propose_inspection',{p_job_id:id,p_scheduled_for:payload.scheduledFor,p_note:payload.note||null});if(error)throw error;return NextResponse.json({appointment:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Keşif önerilemedi.'},{status:400});}
}
