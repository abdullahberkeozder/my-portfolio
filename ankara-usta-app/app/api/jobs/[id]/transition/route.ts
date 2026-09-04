import {assertJobIdentity,jobApiFailure,JobInputError} from '../../../../lib/jobApiSafety';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jobStatuses } from '../../../../domain';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const schema=z.object({status:z.enum(jobStatuses)});
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  try{const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new JobInputError('İş kimliği geçersiz.');const payload=schema.parse(await request.json());const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});assertJobIdentity(request,user.id);const {data,error}=await supabase.rpc('transition_job',{p_job_id:id,p_status:payload.status});if(error)throw error;return NextResponse.json({job:data});}catch(error){return jobApiFailure(error);}
}
