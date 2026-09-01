import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(_request:Request,context:{params:Promise<{id:string}>}){
  try{
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return NextResponse.json({error:'Talep kimliği geçersiz.'},{status:400});
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});
    const {data,error}=await supabase.rpc('match_request',{p_request_id:id});
    if(error)throw error;
    return NextResponse.json({matching:data});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Eşleştirme çalıştırılamadı.'},{status:400});
  }
}
