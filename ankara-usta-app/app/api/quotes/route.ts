import { NextResponse } from 'next/server';
import { z } from 'zod';
import { quoteVersionInputSchema } from '../../domain';
import { publicErrorBody } from '../../lib/apiErrors';
import { createSupabaseServerClient } from '../../lib/supabase/server';

const createQuoteSchema=quoteVersionInputSchema.extend({requestId:z.string().uuid()});

export async function POST(request:Request){
  try{
    const payload=createQuoteSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});
    const {data,error}=await supabase.rpc('create_quote_version',{
      p_request_id:payload.requestId,
      p_labor_amount_kurus:payload.laborAmountKurus,
      p_material_amount_kurus:payload.materialAmountKurus,
      p_estimated_duration_minutes:payload.estimatedDurationMinutes,
      p_warranty_days:payload.warrantyDays,
      p_included_scope:payload.includedScope,
      p_excluded_scope:payload.excludedScope,
      p_note:payload.note||null,
    });
    if(error)throw error;
    return NextResponse.json({quote:data});
  }catch(error){
    // Use publicErrorBody to avoid leaking raw Supabase / PostgreSQL messages
    const err=publicErrorBody(error,'Teklif kaydedilemedi.');
    return NextResponse.json({error:err.error,code:err.code,correlationId:err.correlationId},{status:err.status});
  }
}

