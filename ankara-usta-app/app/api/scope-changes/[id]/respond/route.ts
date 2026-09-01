import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const schema=z.object({approve:z.boolean()});
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Kapsam kimliği geçersiz.');const {approve}=schema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('respond_scope_change',{p_scope_change_id:id,p_approve:approve});if(error)throw error;return NextResponse.json({scopeChange:data});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Kapsam değişikliği yanıtlanamadı.'},{status:409});}
}
