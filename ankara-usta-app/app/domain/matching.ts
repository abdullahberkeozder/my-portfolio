import type { MatchDecision, SupplyState, TradespersonApplicationStatus, TradespersonAvailability, VerificationDocument } from './models';
import { hasCurrentProfessionalVerification } from './verification';

export type MatchRequest={
  serviceId:string;
  district:string;
  neighborhood?:string;
  preferredTiming:string;
};

export type MatchCandidate={
  tradespersonId:string;
  applicationStatus:TradespersonApplicationStatus;
  serviceIds:readonly string[];
  areas:readonly {district:string;neighborhood?:string}[];
  availability:readonly TradespersonAvailability[];
  documents:readonly VerificationDocument[];
  verifiedReferenceCount:number;
};

function dateOnly(value:Date|string){
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))throw new Error('Matching date is invalid.');
  return date.toISOString().slice(0,10);
}

export function preferredTimingHorizonDays(preferredTiming:string){
  if(preferredTiming==='Bugün / acil')return 0;
  if(preferredTiming==='Bu hafta')return 7;
  if(preferredTiming==='Önümüzdeki iki hafta')return 14;
  return 30;
}

export function isAvailabilityCompatible(windows:readonly TradespersonAvailability[],preferredTiming:string,asOf:Date|string=new Date()){
  const start=dateOnly(asOf);
  const horizon=preferredTimingHorizonDays(preferredTiming);
  const endDate=new Date(`${start}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate()+horizon);
  const end=dateOnly(endDate);
  return windows.some(window=>window.active&&window.availableFrom<=end&&window.availableTo>=start&&(horizon!==0||window.acceptsUrgent));
}

export function scoreMatchCandidate(request:MatchRequest,candidate:MatchCandidate,asOf:Date|string=new Date()):MatchDecision{
  const service=candidate.serviceIds.includes(request.serviceId);
  const district=candidate.areas.some(area=>area.district===request.district);
  const availability=isAvailabilityCompatible(candidate.availability,request.preferredTiming,asOf);
  const verification=candidate.applicationStatus==='approved'&&hasCurrentProfessionalVerification(candidate.documents,asOf);
  const neighborhood=Boolean(request.neighborhood&&candidate.areas.some(area=>area.district===request.district&&area.neighborhood===request.neighborhood));
  const references=candidate.verifiedReferenceCount>0;
  const components={service:service?35:0,district:district?25:0,availability:availability?20:0,verification:verification?10:0,neighborhood:neighborhood?5:0,references:references?5:0};
  const rejectedBy=[!service&&'Hizmet eşleşmiyor',!district&&'Çalışma bölgesi eşleşmiyor',!availability&&'Tercih edilen zamanda müsait değil',!verification&&'Onay ve mesleki belge koşulu sağlanmıyor'].filter(Boolean) as string[];
  const reasons=[service&&'Talep edilen hizmeti veriyor',district&&`${request.district} ilçesinde çalışıyor`,availability&&'Tercih edilen zaman aralığında müsait',verification&&'Başvurusu ve mesleki belgesi doğrulanmış',neighborhood&&'Aynı mahallede hizmet veriyor',references&&'Doğrulanmış referansı bulunuyor'].filter(Boolean) as string[];
  return {tradespersonId:candidate.tradespersonId,eligible:rejectedBy.length===0,score:Object.values(components).reduce((sum,value)=>sum+value,0),components,reasons,rejectedBy};
}

export function rankEligibleMatches(request:MatchRequest,candidates:readonly MatchCandidate[],asOf:Date|string=new Date()){
  return candidates.map(candidate=>scoreMatchCandidate(request,candidate,asOf)).filter(match=>match.eligible).sort((left,right)=>right.score-left.score||left.tradespersonId.localeCompare(right.tradespersonId));
}

export function getSupplyState(eligibleCount:number):SupplyState{
  if(eligibleCount===0)return 'no_supply';
  if(eligibleCount<3)return 'limited_supply';
  return 'healthy';
}
