import type { TradespersonProfile, VerificationDocument } from './models';

function isoDate(value:Date|string){
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))throw new Error('Verification date is invalid.');
  return date.toISOString().slice(0,10);
}

export function hasCurrentProfessionalVerification(
  documents:readonly VerificationDocument[],
  asOf:Date|string=new Date(),
){
  const date=isoDate(asOf);
  return documents.some(document=>
    document.kind==='professional_certificate'&&
    document.status==='verified'&&
    Boolean(document.verifiedAt)&&
    (!document.expiresAt||document.expiresAt.slice(0,10)>=date)
  );
}

export function canTradespersonCreateQuote(
  profile:Pick<TradespersonProfile,'applicationStatus'>,
  documents:readonly VerificationDocument[],
  asOf:Date|string=new Date(),
){
  return profile.applicationStatus==='approved'&&hasCurrentProfessionalVerification(documents,asOf);
}

export const shouldShowVerificationBadge=hasCurrentProfessionalVerification;
