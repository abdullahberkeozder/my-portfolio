export type MutationResult = {ok:true} | {ok:false;message:string;uncertain:boolean};

// No automatic retry: a lost acknowledgement may follow a committed mutation.
export async function workspaceMutation(url:string,body:unknown,expectedUserId:string):Promise<MutationResult> {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try {
    const multipart=body instanceof FormData;
    const response=await fetch(url,{method:'POST',signal:controller.signal,
      headers:{'X-Orkestra-Expected-User':expectedUserId,...(!multipart?{'Content-Type':'application/json'}:{})},
      body:multipart?body:JSON.stringify(body)});
    const data:unknown=await response.json();
    if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid acknowledgement');
    if(!response.ok){
      const ref='correlationId' in data&&typeof data.correlationId==='string'?` (${data.correlationId})`:'';
      const message=response.status===401?'Oturumunuz sona erdi. Yeniden giriş yapın.'
        :response.status===403?'Bu işlem için erişiminiz yok. Hesabınızı kontrol edin.'
        :response.status===409?'İşlem veya oturum durumu değişti. Güncel kaydı kontrol edin.'
        :response.status===400||response.status===422?'Bilgileri ve işin güncel durumunu kontrol edin.'
        :'İşlemin sonucu doğrulanamadı. Yeniden göndermeden önce kaydı kontrol edin.';
      return {ok:false,message:message+ref,uncertain:response.status>=500};
    }
    const acknowledged=['message','entry','review','job','address','appointment','scopeChange','dispute']
      .some(key=>key in data && (data as Record<string,unknown>)[key]!=null);
    if(!acknowledged)throw new Error('Missing acknowledgement');
    return {ok:true};
  }catch{return {ok:false,uncertain:true,message:'Yanıt alınamadı; işlem gerçekleşmiş olabilir. Bilgileriniz korunuyor. Yeniden göndermeden önce güncel kaydı kontrol edin.'};}
  finally{clearTimeout(timer);}
}
