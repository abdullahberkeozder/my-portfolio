import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../../lib/supabase/server';

export async function GET() {
  const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
  try {
    const db=await createSupabaseServerClient();
    const {data:{user},error}=await db.auth.getUser();
    if(error && error.name!=='AuthSessionMissingError') return reply({error:'Oturum kontrol edilemedi.'},503);
    if(!user)return reply({user:null});
    const [profile,roles]=await Promise.all([
      db.from('user_profiles').select('display_name').eq('user_id',user.id).maybeSingle(),
      db.from('user_roles').select('role').eq('user_id',user.id),
    ]);
    if(profile.error||roles.error)return reply({error:'Hesap bilgileri yüklenemedi.'},503);
    return reply({user:{id:user.id,name:profile.data?.display_name||'Hesabım',roles:(roles.data??[]).map(item=>item.role)}});
  } catch {return reply({error:'Hesap bilgileri yüklenemedi.'},503);}
}
