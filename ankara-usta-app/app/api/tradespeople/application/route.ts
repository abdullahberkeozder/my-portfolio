import { NextResponse } from 'next/server';
import { validateTradespersonApplication } from '../../../domain/tradespersonApplication';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const editableStatuses=['draft','needs_changes','rejected'];

export async function POST(request:Request){
  try{
    const payload=validateTradespersonApplication(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});

    const {data:existing,error:readError}=await supabase.from('tradesperson_profiles').select('application_status').eq('user_id',user.id).maybeSingle();
    if(readError)throw readError;
    if(existing&&!editableStatuses.includes(existing.application_status))return NextResponse.json({error:'Bu başvuru şu anda düzenlenemez.'},{status:409});

    if(existing){
      const {error}=await supabase.from('tradesperson_profiles').update({display_name:payload.displayName,bio:payload.bio}).eq('user_id',user.id);
      if(error)throw error;
    }else{
      const {error}=await supabase.from('tradesperson_profiles').insert({user_id:user.id,display_name:payload.displayName,bio:payload.bio,application_status:'draft'});
      if(error)throw error;
    }

    const {error:deleteServicesError}=await supabase.from('tradesperson_services').delete().eq('tradesperson_id',user.id);
    if(deleteServicesError)throw deleteServicesError;
    const {error:servicesError}=await supabase.from('tradesperson_services').insert(payload.serviceIds.map(serviceId=>({tradesperson_id:user.id,service_id:serviceId})));
    if(servicesError)throw servicesError;

    const {error:deleteAreasError}=await supabase.from('tradesperson_service_areas').delete().eq('tradesperson_id',user.id);
    if(deleteAreasError)throw deleteAreasError;
    const {error:areasError}=await supabase.from('tradesperson_service_areas').insert(payload.districts.map(district=>({tradesperson_id:user.id,district})));
    if(areasError)throw areasError;

    if(payload.reference){
      const {error}=await supabase.from('tradesperson_references').insert({tradesperson_id:user.id,reference_name:payload.reference.name,relationship:payload.reference.relationship,phone:payload.reference.phone||null,note:payload.reference.note||null});
      if(error)throw error;
    }

    const {data:profile,error:submitError}=await supabase.from('tradesperson_profiles').update({application_status:'submitted',submitted_at:new Date().toISOString()}).eq('user_id',user.id).select('user_id,application_status').single();
    if(submitError)throw submitError;
    return NextResponse.json({profile});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Başvuru kaydedilemedi.'},{status:400})}
}

