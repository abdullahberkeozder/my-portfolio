'use client';
import {useRouter} from 'next/navigation';
import RequestWizard from './RequestWizard';
import type {Service} from '../data/serviceTaxonomy';
import type {RequestTarget} from '../domain/requestRouting';

export default function DirectedRequestEntry({service,target,remoteDraft}:{service:Service;target:RequestTarget;remoteDraft?:Parameters<typeof RequestWizard>[0]['remoteDraft']}) {
  const router=useRouter();
  return <RequestWizard service={service} targetProfessional={target} remoteDraft={remoteDraft} onClose={()=>router.push(`/ustalar/${target.id}`)}/>;
}
