import {NextResponse} from 'next/server';

export type PublicApiError={code:string;message:string;correlationId:string;status:number};
type ErrorDefinition={code:string;message?:string;status:number};

const ERROR_CODE_MAP:Record<string,ErrorDefinition>={
  // Internal database identifiers are translated to stable public codes.
  '23505':{code:'CONFLICT',message:'Bu kayıt zaten mevcut veya daha önce oluşturulmuş.',status:409},
  '23503':{code:'RELATED_RECORD_NOT_FOUND',message:'İlişkili kayıt bulunamadı veya silinmiş.',status:400},
  '23502':{code:'INVALID_INPUT',message:'Zorunlu bir alan eksik bırakıldı.',status:400},
  '23514':{code:'ELIGIBILITY_CHANGED',message:'Talep veya seçilen ustanın uygunluğu değişti. Hizmet, bölge ve usta durumunu kontrol edin.',status:422},
  '22P02':{code:'INVALID_INPUT',message:'Geçersiz veri biçimi veya kimlik formatı.',status:400},
  '42501':{code:'FORBIDDEN',message:'Bu işlem için yetkiniz bulunmuyor.',status:403},
  'P0001':{code:'CONFLICT',status:409},
  'PGRST116':{code:'NOT_FOUND',message:'Aranan kayıt bulunamadı.',status:404},
  'PGRST301':{code:'RESOURCE_UNAVAILABLE',message:'Kaynak taşınmış veya erişilemiyor.',status:503},
  'JWT_EXPIRED':{code:'AUTH_EXPIRED',message:'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',status:401},
};

const createCorrelationId=()=>`err_${crypto.randomUUID()}`;
const sourceErrorCode=(error:unknown)=>{
  if(typeof error!=='object'||error===null)return undefined;
  const code=(error as {code?:unknown}).code;
  return typeof code==='string'?code:undefined;
};

export function mapDatabaseError(error:unknown,fallbackMessage='İşlem sırasında bir hata oluştu.'):PublicApiError{
  const correlationId=createCorrelationId();
  if(typeof error==='string')return {code:'USER_ERROR',message:error,correlationId,status:400};
  if(typeof error==='object'&&error!==null){
    const sourceCode=sourceErrorCode(error);
    const mapped=sourceCode?ERROR_CODE_MAP[sourceCode]:undefined;
    if(mapped)return {code:mapped.code,message:mapped.message??fallbackMessage,correlationId,status:mapped.status};
    const message=(error as {message?:unknown}).message;
    if(typeof message==='string'&&message.includes('JWT')){
      const auth=ERROR_CODE_MAP.JWT_EXPIRED;
      return {code:auth.code,message:auth.message!,correlationId,status:auth.status};
    }
  }
  return {code:'INTERNAL_ERROR',message:fallbackMessage,correlationId,status:500};
}

export function publicErrorBody(error:unknown,fallbackMessage?:string){
  const mapped=mapDatabaseError(error,fallbackMessage);
  return {error:mapped.message,code:mapped.code,correlationId:mapped.correlationId,status:mapped.status};
}

function errorResponse(mapped:PublicApiError){
  return NextResponse.json(
    {error:mapped.message,code:mapped.code,correlationId:mapped.correlationId},
    {status:mapped.status,headers:{'Cache-Control':'private, no-store','X-Correlation-ID':mapped.correlationId}},
  );
}

export function jsonPublicError(code:string,message:string,status:number){
  return errorResponse({code,message,status,correlationId:createCorrelationId()});
}

export function jsonApiError(error:unknown,fallbackMessage?:string,statusOverride?:number){
  const mapped=mapDatabaseError(error,fallbackMessage);
  if(statusOverride!==undefined)mapped.status=statusOverride;
  // Full database messages never leave the server. Logs retain only correlation metadata.
  if(mapped.code==='INTERNAL_ERROR')console.error('API request failed',{correlationId:mapped.correlationId,sourceCode:sourceErrorCode(error)??'unknown'});
  return errorResponse(mapped);
}
