import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {directedRequestsEnabled} from '../../../../lib/directedRequests';
import {publicErrorBody} from '../../../../lib/apiErrors';
import {invitationActionSchema} from '../../../../domain/requestInvitation';

export async function POST(request:Request,context:{params:Promise<{id:string}>}) {
  try {
    if(!directedRequestsEnabled())return NextResponse.json({error:'Özel talepler henüz açılmadı.'},{status:503});
    const {id}=await context.params;
    if(!z.uuid().safeParse(id).success)return NextResponse.json({error:'Geçersiz talep.'},{status:400});
    const action=invitationActionSchema.parse(await request.json());
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Giriş yapmanız gerekiyor.'},{status:401});
    const {data,error}=await supabase.rpc('respond_request_invitation',{
      p_request_id:id,p_action:action.action,p_reason:action.action==='decline'?action.reason:null,p_confirm:action.action==='broaden',
    }).single();
    if(error)throw error;
    return NextResponse.json({invitation:data});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return NextResponse.json({error:'Ret gerekçesini veya paylaşım onayını kontrol edin.'},{status:400});
    const body=publicErrorBody(error,'Talep durumu değişmiş olabilir. Sayfayı yenileyip tekrar deneyin.');
    return NextResponse.json(body,{status:body.status});
  }
}
