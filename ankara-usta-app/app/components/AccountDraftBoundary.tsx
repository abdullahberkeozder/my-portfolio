'use client';
import {ReactNode,useEffect,useState} from 'react';
import type {AuthChangeEvent,Session} from '@supabase/supabase-js';
import {createSupabaseBrowserClient} from '../lib/supabase/browser';

export type DraftScope = {key:string; storage:Storage; guest:boolean; discardRemote?:boolean; preferLocal?:boolean};
export function draftAccountKey(kind:string,userId:string) {
  return `orkestra:draft:v2:${encodeURIComponent(userId)}:${kind}`;
}

// Local drafts are a convenience, never authorization. Server RLS still owns access.
export default function AccountDraftBoundary({kind,ttl,children}:{kind:string;ttl:number;children:(scope:DraftScope)=>ReactNode}) {
  const [scope,setScope]=useState<DraftScope>();
  const [error,setError]=useState(false);
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true;
    let revision=0;
    let seenId:string|undefined;
    let client:ReturnType<typeof createSupabaseBrowserClient>;
    try {client=createSupabaseBrowserClient();} catch {queueMicrotask(()=>setError(true));return;}
    const resolve=async()=>{
      const ticket=++revision;
      const {data,error:authError}=await client.auth.getUser();
      if(!active||ticket!==revision)return;
      // Missing session is anonymous; network failures must not reveal cached account data.
      if(authError && authError.name!=='AuthSessionMissingError') {setScope(undefined);setError(true);return;}
      const id=data.user?.id ?? 'guest';
      if(seenId!==undefined && seenId!==id) {
        setScope(undefined);
        // Discard all component state, including selected File objects and remote draft props.
        window.location.reload();
        return;
      }
      seenId=id;
      try {
        const storage=id==='guest'?sessionStorage:localStorage;
        const key=draftAccountKey(kind,id);
        const raw=storage.getItem(key);
        if(raw) {
          try {const parsed=JSON.parse(raw);if(!parsed.updatedAt||Date.now()-parsed.updatedAt>ttl)storage.removeItem(key);}
          catch {storage.removeItem(key);}
        }
        setScope({key,storage,guest:id==='guest'});setError(false);
      } catch {setError(true);}
    };
    void resolve().catch(()=>{if(active)setError(true);});
    const {data:{subscription}}=client.auth.onAuthStateChange((_event:AuthChangeEvent,session:Session|null)=>{
      if(seenId!==undefined && (session?.user.id??'guest')!==seenId) setScope(undefined);
      // Do not call getUser while the auth client's callback lock is held.
      setTimeout(()=>{if(active)void resolve().catch(()=>setError(true));},0);
    });
    return()=>{active=false;subscription.unsubscribe();};
  },[kind,ttl,retry]);
  if(error)return <section role="alert" className="account-card">Taslak hesabı doğrulanamadı. Verilerinizi korumak için form açılmadı. <button onClick={()=>{setError(false);setRetry(n=>n+1);}}>Yeniden dene</button></section>;
  if(!scope)return <p role="status">Hesap ve taslak kontrol ediliyor…</p>;
  return <DraftChoice key={scope.key} scope={scope} kind={kind}>{children}</DraftChoice>;
}

function DraftChoice({scope,kind,children}:{scope:DraftScope;kind:string;children:(scope:DraftScope)=>ReactNode}) {
  const [pending,setPending]=useState(()=>{
    try {
      // Anonymous handoff is explicit, same-tab, and only valid for this service.
      const guestKey=draftAccountKey(kind,'guest');
      const transfer=!scope.guest && new URLSearchParams(window.location.search).get('resume')==='1'
        && sessionStorage.getItem('orkestra:draft-handoff')===guestKey;
      const guestRaw=transfer?sessionStorage.getItem(guestKey):null;
      return {saved:scope.storage.getItem(scope.key),guestRaw,guestKey,transfer};
    }catch{return {saved:null,guestRaw:null,guestKey:'',transfer:false};}
  });
  const [ready,setReady]=useState(!pending.saved&&!pending.guestRaw);
  const [error,setError]=useState('');
  const [discardRemote,setDiscardRemote]=useState(false);
  const [preferLocal,setPreferLocal]=useState(false);
  function choose(resume:boolean,guest=false) {
    try {
      if(resume && guest && pending.guestRaw) {
        const value=JSON.parse(pending.guestRaw);
        if(!value.updatedAt||Date.now()-value.updatedAt>7*86400000)throw new Error('expired');
        delete value.requestId; // Never transfer a remote record identity from anonymous storage.
        scope.storage.setItem(scope.key,JSON.stringify(value));
      } else if(!resume) {scope.storage.removeItem(scope.key);setDiscardRemote(true);}
      if(pending.transfer) {
        sessionStorage.removeItem(pending.guestKey);
        sessionStorage.removeItem('orkestra:draft-handoff');
      }
      setPreferLocal(resume);setPending({...pending,saved:null,guestRaw:null});setReady(true);
    } catch {setError('Taslak işlemi tamamlanamadı. Tarayıcı depolama izinlerini kontrol edin.');}
  }
  if(ready)return children({...scope,discardRemote,preferLocal});
  return <section className="account-card" aria-label="Kayıtlı taslak seçimi">
    <h2>Kayıtlı taslağınız var</h2>
    <p>Devam etmeyi seçmeden taslak bilgileri forma aktarılmaz. Silme yalnızca bu cihazdaki taslağı kaldırır; sunucu kaydını silmez.</p>
    {pending.saved&&<button type="button" onClick={()=>choose(true)}>Hesabımdaki taslağa devam et</button>}
    {pending.guestRaw&&<button type="button" onClick={()=>choose(true,true)}>Giriş öncesi taslağı bu hesaba aktar ve devam et</button>}
    <button type="button" onClick={()=>choose(false)}>Taslağı sil ve yeni başla</button>
    {error&&<p role="alert">{error}</p>}
  </section>;
}
