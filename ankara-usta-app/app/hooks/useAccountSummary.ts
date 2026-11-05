'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {z} from 'zod';
import {createSupabaseBrowserClient} from '../lib/supabase/browser';
export type AccountSummary={id:string;name:string;roles:string[]};
export type AccountState={status:'loading'|'error'|'ready';user:AccountSummary|null};
const summarySchema=z.object({user:z.object({id:z.string(),name:z.string(),roles:z.array(z.string())}).nullable()});
let summaryInFlight:Promise<AccountSummary|null>|null=null;
let summaryConsumers=0;

async function readAccountSummary(force=false) {
  if(summaryInFlight&&!force)return summaryInFlight;
  summaryInFlight=(async()=>{
    const response=await fetch('/api/account/summary',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('unavailable');
    return summarySchema.parse(await response.json()).user;
  })().finally(()=>{summaryInFlight=null;});
  return summaryInFlight;
}

export function announceAccountChange() {
  window.dispatchEvent(new Event('orkestra-account-change'));
  if(typeof BroadcastChannel!=='undefined') {const channel=new BroadcastChannel('orkestra-account');channel.postMessage('refresh');channel.close();}
}
export function useAccountSummary() {
  const pathname=usePathname();
  const [state,setState]=useState<AccountState>({status:'loading',user:null});
  useEffect(()=>{
    summaryConsumers+=1;
    let active=true;let sequence=0;
    async function reload(clear=false) {
      const current=++sequence;
      if(clear)setState({status:'loading',user:null});
      try {
        const user=await readAccountSummary(clear);
        if(active&&current===sequence)setState({status:'ready',user});
      } catch {if(active&&current===sequence)setState({status:'error',user:null});}
    }
    const refresh=()=>{void reload(true);};
    const focus=()=>{void reload();};
    void reload();
    let unsubscribe=()=>{};
    // The initial server-backed reload already reads the current session.
    // INITIAL_SESSION is subscription initialization, not a new auth mutation.
    try {const {data}=createSupabaseBrowserClient().auth.onAuthStateChange((event:string)=>{if(event!=='INITIAL_SESSION')refresh();});unsubscribe=()=>data.subscription.unsubscribe();} catch { /* Endpoint remains the source of truth. */ }
    const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('orkestra-account'):null;
    if(channel)channel.onmessage=refresh;
    window.addEventListener('orkestra-account-change',refresh);window.addEventListener('focus',focus);
    return ()=>{active=false;summaryConsumers=Math.max(0,summaryConsumers-1);if(summaryConsumers===0)summaryInFlight=null;unsubscribe();channel?.close();window.removeEventListener('orkestra-account-change',refresh);window.removeEventListener('focus',focus);};
  },[pathname]);
  return state;
}
