'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {z} from 'zod';
import {createSupabaseBrowserClient} from '../lib/supabase/browser';
export type AccountSummary={id:string;name:string;roles:string[]};
export type AccountState={status:'loading'|'error'|'ready';user:AccountSummary|null};
const summarySchema=z.object({user:z.object({id:z.string(),name:z.string(),roles:z.array(z.string())}).nullable()});
export function announceAccountChange() {
  window.dispatchEvent(new Event('orkestra-account-change'));
  if(typeof BroadcastChannel!=='undefined') {const channel=new BroadcastChannel('orkestra-account');channel.postMessage('refresh');channel.close();}
}
export function useAccountSummary() {
  const pathname=usePathname();
  const [state,setState]=useState<AccountState>({status:'loading',user:null});
  useEffect(()=>{
    let active=true;let sequence=0;let controller:AbortController|undefined;
    async function reload(clear=false) {
      const current=++sequence;controller?.abort();controller=new AbortController();
      if(clear)setState({status:'loading',user:null});
      try {
        const response=await fetch('/api/account/summary',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
        if(!response.ok)throw new Error('unavailable');
        const data=summarySchema.parse(await response.json());
        if(active&&current===sequence)setState({status:'ready',user:data.user});
      } catch {if(active&&current===sequence)setState({status:'error',user:null});}
    }
    const refresh=()=>{void reload(true);};
    const focus=()=>{void reload();};
    void reload();
    let unsubscribe=()=>{};
    try {const {data}=createSupabaseBrowserClient().auth.onAuthStateChange(()=>{refresh();});unsubscribe=()=>data.subscription.unsubscribe();} catch { /* Endpoint remains the source of truth. */ }
    const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('orkestra-account'):null;
    if(channel)channel.onmessage=refresh;
    window.addEventListener('orkestra-account-change',refresh);window.addEventListener('focus',focus);
    return ()=>{active=false;controller?.abort();unsubscribe();channel?.close();window.removeEventListener('orkestra-account-change',refresh);window.removeEventListener('focus',focus);};
  },[pathname]);
  return state;
}
