import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';
const schema=z.object({displayName:z.string().trim().min(2).max(120).regex(/^[^\u0000-\u001f\u007f]+$/)}).strict();
export async function POST(request:Request) {
  const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
  if(request.headers.get('origin')!==new URL(request.url).origin)return jsonPublicError('INVALID_ORIGIN','İstek doğrulanamadı.',403);
  const body=await request.json().catch(()=>null);
  const parsed=schema.safeParse(body);
  if(!parsed.success)return jsonPublicError('INVALID_INPUT','Görünen ad 2–120 karakter olmalıdır.',400);
  try {
    const db=await createSupabaseServerClient();
    const {data:{user},error}=await db.auth.getUser();
    if(error||!user)return jsonPublicError('AUTH_REQUIRED','Yeniden giriş yapın.',401);
    if(request.headers.get('x-expected-user-id')!==user.id)return jsonPublicError('ACCOUNT_CHANGED','Hesap değişti. Sayfayı yenileyin.',409);
    const result=await db.from('user_profiles').update({display_name:parsed.data.displayName,updated_at:new Date().toISOString()}).eq('user_id',user.id).select('display_name').single();
    if(result.error||!result.data)return jsonApiError(result.error??new Error('Profile update returned no row'),'Ad kaydedilemedi. Yeniden deneyin.',502);
    return reply({displayName:result.data.display_name});
  } catch(error){return jsonApiError(error,'Kayıt sonucu doğrulanamadı. Sayfayı yenileyip kontrol edin.');}
}
