import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {mapDatabaseError} from './apiErrors';

export class JobInputError extends Error {}
class JobIdentityError extends Error {}
export function assertJobIdentity(request:Request,userId:string){
  // This binds the rendered form to its session; it never grants authorization.
  if(request.headers.get('X-Orkestra-Expected-User')!==userId)throw new JobIdentityError();
}
export function jobApiFailure(error:unknown){
  const mapped=mapDatabaseError(error,'İşlemin sonucu doğrulanamadı. Yeniden göndermeden önce güncel kaydı kontrol edin.');
  const identity=error instanceof JobIdentityError;
  const invalid=error instanceof JobInputError||error instanceof ZodError||error instanceof SyntaxError;
  const code=identity?'ACCOUNT_CHANGED':invalid?'INVALID_INPUT':mapped.code;
  const status=identity?409:invalid?400:mapped.status;
  const message=identity?'Oturum değişti. Sayfayı yenileyip hesabınızı kontrol edin.':invalid?'Bilgileri ve dosya gereksinimlerini kontrol edin.':mapped.message;
  return NextResponse.json({error:message,code,correlationId:mapped.correlationId},{status,headers:{'Cache-Control':'private, no-store'}});
}
