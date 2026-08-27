import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jobAddressInputSchema } from '../../../../domain';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const payload=jobAddressInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('save_job_address',{p_job_id:id,p_address_line:payload.addressLine,p_building:payload.building||null,p_apartment:payload.apartment||null,p_directions:payload.directions||null});if(error)throw error;return NextResponse.json({address:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Adres paylaşılamadı.'},{status:400});}
}
