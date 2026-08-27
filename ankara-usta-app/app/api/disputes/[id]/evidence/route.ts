import {NextResponse} from 'next/server';
import {z} from 'zod';
import {disputeEvidenceSchema} from '../../../../domain';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';

const mimeExtensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','application/pdf':'pdf','text/plain':'txt'};
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  let uploadedPath:string|undefined;
  try{
    const {id}=await context.params;if(!z.uuid().safeParse(id).success)throw new Error('Uyuşmazlık kimliği geçersiz.');
    const form=await request.formData();const file=form.get('file');
    const input=disputeEvidenceSchema.parse({kind:form.get('kind'),description:form.get('description')});
    if(!(file instanceof File)||file.size<1||file.size>25*1024*1024)throw new Error('Kanıt dosyası en fazla 25 MB olabilir.');
    const extension=mimeExtensions[file.type];if(!extension)throw new Error('JPG, PNG, WebP, MP4, PDF veya metin dosyası yükleyebilirsiniz.');
    const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:'Oturum açmanız gerekiyor.'},{status:401});
    uploadedPath=`${id}/${user.id}/${crypto.randomUUID()}.${extension}`;
    const {error:uploadError}=await supabase.storage.from('dispute-evidence').upload(uploadedPath,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;
    const {data,error}=await supabase.from('dispute_evidence').insert({dispute_id:id,submitted_by:user.id,kind:input.kind,description:input.description,storage_path:uploadedPath,content_type:file.type,byte_size:file.size}).select().single();
    if(error){await supabase.storage.from('dispute-evidence').remove([uploadedPath]);throw error;}
    return NextResponse.json({evidence:data},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Kanıt yüklenemedi.'},{status:409});}
}
