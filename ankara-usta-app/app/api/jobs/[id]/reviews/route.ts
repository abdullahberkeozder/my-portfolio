import {NextResponse} from 'next/server';
import {z} from 'zod';
import {reviewInputSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('İş kimliği geçersiz.');const input=reviewInputSchema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});const {data,error}=await supabase.rpc('create_job_review',{p_job_id:id,p_rating:input.rating,p_comment:input.comment??null});if(error)throw error;return NextResponse.json({review:data},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Değerlendirme oluşturulamadı.'},{status:409});}
}
