'use client';
import {useRouter} from 'next/navigation';
import RequestWizard from './RequestWizard';
import type {Service} from '../data/serviceTaxonomy';
import type {RequestTarget} from '../domain/requestRouting';

export default function DirectedRequestEntry({service,target,remoteDraft,initialDistrict}:{service:Service;target:RequestTarget;remoteDraft?:Parameters<typeof RequestWizard>[0]['remoteDraft'];initialDistrict?:string}) {
  const router=useRouter();
  return <RequestWizard service={service} targetProfessional={target} remoteDraft={remoteDraft} initialDistrict={initialDistrict} onClose={()=>router.push(`/ustalar/${target.id}`)}/>;
}
