import {NextResponse} from 'next/server';
import {moderationDecisionInputSchema} from '../../../domain';
import {createSupabaseServerClient} from '../../../lib/supabase/server';

export async function POST(request:Request){
  try{const input=moderationDecisionInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('moderate_entity',{p_entity_type:input.entityType,p_entity_id:input.entityId,p_action:input.action,p_reason:input.reason});if(error)throw error;return NextResponse.json({decision:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Moderasyon kararı uygulanamadı.'},{status:409});}
}
