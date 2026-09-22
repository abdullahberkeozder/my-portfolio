import {ZodError} from 'zod';
import {jsonApiError,jsonPublicError} from './apiErrors';

export class JobInputError extends Error {}
class JobIdentityError extends Error {}
export function assertJobIdentity(request:Request,userId:string){
  // This binds the rendered form to its session; it never grants authorization.
  if(request.headers.get('X-Orkestra-Expected-User')!==userId)throw new JobIdentityError();
}
export function jobApiFailure(error:unknown){
  const identity=error instanceof JobIdentityError;
  const invalid=error instanceof JobInputError||error instanceof ZodError||error instanceof SyntaxError;
  if(identity)return jsonPublicError('ACCOUNT_CHANGED','Oturum değişti. Sayfayı yenileyip hesabınızı kontrol edin.',409);
  if(invalid)return jsonPublicError('INVALID_INPUT','Bilgileri ve dosya gereksinimlerini kontrol edin.',400);
  return jsonApiError(error,'İşlemin sonucu doğrulanamadı. Yeniden göndermeden önce güncel kaydı kontrol edin.');
}
