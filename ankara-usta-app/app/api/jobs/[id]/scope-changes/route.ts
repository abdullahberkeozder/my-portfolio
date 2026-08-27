import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scopeChangeInputSchema } from '../../../../domain';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const payload=scopeChangeInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('propose_scope_change',{p_job_id:id,p_description:payload.description,p_labor_delta_kurus:payload.laborDeltaKurus,p_material_delta_kurus:payload.materialDeltaKurus,p_duration_delta_minutes:payload.durationDeltaMinutes,p_included_scope:payload.includedScope,p_excluded_scope:payload.excludedScope});if(error)throw error;return NextResponse.json({scopeChange:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Kapsam değişikliği oluşturulamadı.'},{status:400});}
}
