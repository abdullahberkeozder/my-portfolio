import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const schema=z.object({accept:z.boolean()});
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Randevu kimliği geçersiz.');const {accept}=schema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('respond_inspection',{p_appointment_id:id,p_accept:accept});if(error)throw error;return NextResponse.json({appointment:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Keşif yanıtlanamadı.'},{status:409});}
}
