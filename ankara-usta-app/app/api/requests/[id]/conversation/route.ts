import {NextResponse} from 'next/server';
import {z} from 'zod';
import {conversationActionSchema,conversationQuerySchema} from '../../../../domain/requestConversation';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {prejobChatEnabled} from '../../../../lib/prejobChat';
import {publicErrorBody} from '../../../../lib/apiErrors';

async function handle(request:Request,context:{params:Promise<{id:string}>},write:boolean){
  try{
    if(!prejobChatEnabled())return NextResponse.json({error:'İş öncesi görüşmeler henüz açılmadı.'},{status:503});
    const {id}=await context.params;z.uuid().parse(id);
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Görüşme için giriş yapın.'},{status:401});
    const raw=write?await request.json():Object.fromEntries(new URL(request.url).searchParams);
    const expectedUserId=z.object({expectedUserId:z.uuid()}).parse(raw).expectedUserId;
    if(expectedUserId!==user.id)return NextResponse.json({error:'Hesap değişti. Görüşmeyi yeniden açın.'},{status:409});
    const input=write?conversationActionSchema.parse(raw):conversationQuerySchema.parse(raw);
    const action='action' in input?input.action:'fetch';
    const {data,error}=await supabase.rpc('request_conversation',{
      p_request_id:id,p_professional_id:input.professionalId,p_action:action,
      p_body:'body' in input?input.body:null,p_key:'key' in input?input.key:null,
      p_after:'sequence' in input?input.sequence:'after' in input?input.after:0,
    });
    if(error)throw error;
    return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return NextResponse.json({error:'Mesajı ve görüşme bilgilerini kontrol edin.'},{status:400});
    const body=publicErrorBody(error,'Görüşme yüklenemedi veya artık mesaj kabul etmiyor. Tekrar deneyin.');
    return NextResponse.json(body,{status:body.status});
  }
}
export const GET=(request:Request,context:{params:Promise<{id:string}>})=>handle(request,context,false);
export const POST=(request:Request,context:{params:Promise<{id:string}>})=>handle(request,context,true);
