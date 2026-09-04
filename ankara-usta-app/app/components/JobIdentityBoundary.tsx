'use client';
import {useEffect,useState,type ReactNode} from 'react';
import Link from 'next/link';
import type {AuthChangeEvent,Session} from '@supabase/supabase-js';
import {createSupabaseBrowserClient} from '../lib/supabase/browser';

// Unmount private forms on identity changes; server APIs independently check identity.
export default function JobIdentityBoundary({userId,children}:{userId:string;children:ReactNode}){
  const [blocked,setBlocked]=useState(false);
  useEffect(()=>{
    let active=true;
    try{
      const client=createSupabaseBrowserClient();
      const {data:{subscription}}=client.auth.onAuthStateChange((_event:AuthChangeEvent,session:Session|null)=>{
        if(active&&(session?.user.id??null)!==userId)setBlocked(true);
      });
      return()=>{active=false;subscription.unsubscribe();};
    }catch{queueMicrotask(()=>{if(active)setBlocked(true);});}
    return()=>{active=false;};
  },[userId]);
  if(blocked)return <section className="account-card" role="alert"><h2>Oturum değişti</h2><p>Gizliliğiniz için iş odası kapatıldı. Güncel hesabınızla devam etmek için sayfayı yenileyin.</p><Link href="/islerim" prefetch={false}>İşlerimi yeniden aç</Link></section>;
  return children;
}
