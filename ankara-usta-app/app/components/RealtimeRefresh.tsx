'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export type RealtimeSubscription = { table: string; filter?: string };
type ConnectionState = 'connecting' | 'live' | 'degraded' | 'unavailable';

export default function RealtimeRefresh({
  channelName,
  subscriptions,
  label = 'Canlı güncellemeler',
}: {
  channelName: string;
  subscriptions: RealtimeSubscription[];
  label?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ConnectionState>('connecting');
  const subscriptionsKey = JSON.stringify(subscriptions);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    function catchUp() {
      if(disposed || refreshTimer) return;
      refreshTimer=setTimeout(()=>{refreshTimer=undefined;if(!disposed)router.refresh();},300);
    }
    function onVisible(){if(document.visibilityState==='visible')catchUp();}
    window.addEventListener('online',catchUp);
    window.addEventListener('focus',catchUp);
    document.addEventListener('visibilitychange',onVisible);
    function cleanup(){
      disposed=true;
      if(refreshTimer)clearTimeout(refreshTimer);
      window.removeEventListener('online',catchUp);
      window.removeEventListener('focus',catchUp);
      document.removeEventListener('visibilitychange',onVisible);
    }

    try {
      const supabase = createSupabaseBrowserClient();
      let channel = supabase.channel(channelName);
      const stableSubscriptions = JSON.parse(subscriptionsKey) as RealtimeSubscription[];
      for (const subscription of stableSubscriptions) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: subscription.table,
            ...(subscription.filter ? { filter: subscription.filter } : {}),
          },
          catchUp
        );
      }

      channel.subscribe((status: string) => {
        if (disposed) return;
        if (status === 'SUBSCRIBED') { setState('live'); catchUp(); }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setState('degraded');
        else if (status === 'CLOSED') setState('unavailable');
      });

      return () => {
        cleanup();
        void supabase.removeChannel(channel);
      };
    } catch {
      queueMicrotask(() => {
        if (!disposed) setState('unavailable');
      });
      return cleanup;
    }
  }, [channelName, router, subscriptionsKey]);

  const copy = state === 'live' ? 'Canlı' : state === 'connecting' ? 'Bağlanıyor' : 'Yenileme gerekebilir';
  return (
    <div className={`realtime-indicator is-${state}`} role="status" aria-live="polite">
      <span aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      {copy}
      <button type="button" onClick={()=>router.refresh()}>Güncel durumu yenile</button>
    </div>
  );
}
