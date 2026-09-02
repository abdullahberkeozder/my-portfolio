import {NextResponse} from 'next/server';
import {z} from 'zod';
import {quoteRevisionRequestSchema} from '../../../../domain/quoteRevision';
import {quoteVersionInputSchema} from '../../../../domain/quotes';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {quoteRevisionsEnabled} from '../../../../lib/quoteRevisions';
import {publicErrorBody} from '../../../../lib/apiErrors';

const schema=z.discriminatedUnion('action',[
  quoteRevisionRequestSchema.extend({action:z.literal('request'),expectedUserId:z.uuid()}),
  quoteVersionInputSchema.extend({action:z.literal('revise'),expectedUserId:z.uuid()}),
]);
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{
    if(!quoteRevisionsEnabled())return NextResponse.json({error:'Teklif revizyonu henüz açılmadı.'},{status:503});
    const {id}=await context.params;z.uuid().parse(id);
    const input=schema.parse(await request.json());
    const client=await createSupabaseServerClient();const {data:{user}}=await client.auth.getUser();
    if(!user)return NextResponse.json({error:'Giriş yapmanız gerekiyor.'},{status:401});
    if(user.id!==input.expectedUserId)return NextResponse.json({error:'Hesap değişti. Sayfayı yenileyin.'},{status:409});
    const {data,error}=input.action==='request'
      ?await client.rpc('request_quote_revision',{p_quote_id:id,p_fields:input.fields,p_reason:input.reason})
      :await client.rpc('revise_quote_version',{p_base_quote_id:id,p_labor_amount_kurus:input.laborAmountKurus,p_material_amount_kurus:input.materialAmountKurus,p_estimated_duration_minutes:input.estimatedDurationMinutes,p_warranty_days:input.warrantyDays,p_included_scope:input.includedScope,p_excluded_scope:input.excludedScope,p_note:input.note||null});
    if(error)throw error;
    return NextResponse.json(input.action==='request'?{revision:data}:{quote:data},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){
    if(error instanceof z.ZodError||error instanceof SyntaxError)return NextResponse.json({error:'Revizyon alanlarını ve açıklamayı kontrol edin.'},{status:400});
    const body=publicErrorBody(error,'Revizyon kaydedilemedi. Güncel teklifi kontrol edip tekrar deneyin.');
    return NextResponse.json({...body,error:body.code==='23514'?'Teklif veya revizyon isteği değişmiş olabilir. Güncel sürümü açın.':body.error},{status:body.status});
  }
}
