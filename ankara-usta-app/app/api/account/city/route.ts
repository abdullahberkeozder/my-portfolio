import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../../lib/supabase/server';

const schema=z.object({city:z.literal('Ankara')}).strict();
export async function POST(request:Request) {
  const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
  if(request.headers.get('origin')!==new URL(request.url).origin)return respond({error:'İstek doğrulanamadı.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return respond({error:'Geçersiz istek.'},415);
  try {
    const parsed=schema.safeParse(await request.json());
    if(!parsed.success)return respond({error:'Şu anda yalnız Ankara seçilebilir.'},400);
    const supabase=await createSupabaseServerClient();
    const {data:{user},error}=await supabase.auth.getUser();
    if(error||!user)return respond({error:'Şehir kaydetmek için giriş yapın.'},401);
    if(request.headers.get('x-expected-user-id')!==user.id)return respond({error:'Hesap değişti. Sayfayı yenileyin.'},409);
    const result=await supabase.auth.updateUser({data:{service_city:parsed.data.city}});
    if(result.error||result.data.user?.id!==user.id)return respond({error:'Şehir kaydedilemedi. Yeniden deneyin.'},502);
    return respond({city:'Ankara'});
  } catch {return respond({error:'Şehir kaydedilemedi. Hesap sayfasını yenileyip kontrol edin.'},500);}
}
