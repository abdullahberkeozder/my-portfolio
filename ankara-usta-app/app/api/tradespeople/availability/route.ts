import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { jsonApiError } from '../../../lib/apiErrors';

const availabilitySchema=z.object({
  availableFrom:z.iso.date(),
  availableTo:z.iso.date(),
  acceptsUrgent:z.boolean(),
  active:z.boolean(),
}).refine(value=>value.availableFrom<=value.availableTo,{message:'Bitiş tarihi başlangıçtan önce olamaz.'});

export async function POST(request:Request){
  try{
    const payload=availabilitySchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return jsonApiError('Oturum açmanız gerekiyor.',undefined,401);
    const {data,error}=await supabase.from('tradesperson_availability').upsert({
      tradesperson_id:user.id,
      available_from:payload.availableFrom,
      available_to:payload.availableTo,
      accepts_urgent:payload.acceptsUrgent,
      active:payload.active,
      updated_at:new Date().toISOString(),
    }).select('available_from,available_to,accepts_urgent,active').single();
    if(error)throw error;
    return NextResponse.json({availability:data});
  }catch(error){
    return jsonApiError(error,'Müsaitlik kaydedilemedi.',400);
  }
}
