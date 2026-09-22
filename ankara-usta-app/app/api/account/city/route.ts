import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../../lib/supabase/server';
import {jsonApiError,jsonPublicError} from '../../../lib/apiErrors';

const schema=z.object({city:z.literal('Ankara')}).strict();
export async function POST(request:Request) {
  const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
  if(request.headers.get('origin')!==new URL(request.url).origin)return jsonPublicError('INVALID_ORIGIN','İstek doğrulanamadı.',403);
  if(!request.headers.get('content-type')?.includes('application/json'))return jsonPublicError('UNSUPPORTED_MEDIA_TYPE','Geçersiz istek.',415);
  try {
    const parsed=schema.safeParse(await request.json());
    if(!parsed.success)return jsonPublicError('INVALID_INPUT','Şu anda yalnız Ankara seçilebilir.',400);
    const supabase=await createSupabaseServerClient();
    const {data:{user},error}=await supabase.auth.getUser();
    if(error||!user)return jsonPublicError('AUTH_REQUIRED','Şehir kaydetmek için giriş yapın.',401);
    if(request.headers.get('x-expected-user-id')!==user.id)return jsonPublicError('ACCOUNT_CHANGED','Hesap değişti. Sayfayı yenileyin.',409);
    const result=await supabase.auth.updateUser({data:{service_city:parsed.data.city}});
    if(result.error||result.data.user?.id!==user.id)return jsonApiError(result.error??new Error('User update mismatch'),'Şehir kaydedilemedi. Yeniden deneyin.',502);
    return respond({city:'Ankara'});
  } catch(error){return jsonApiError(error,'Şehir kaydedilemedi. Hesap sayfasını yenileyip kontrol edin.');}
}
