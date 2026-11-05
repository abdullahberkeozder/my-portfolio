'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'orkestra:saved-discovery:v1';

export function useSavedDiscovery(knownIds: string[]) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
        setSavedIds(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && knownIds.includes(id)) : []);
      } catch { setSavedIds([]); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [knownIds]);

  const toggle = useCallback((id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage is optional */ }
      setNotice(current.includes(id) ? 'İş kaydedilenlerden çıkarıldı.' : 'İş kaydedilenlere eklendi.');
      window.setTimeout(() => setNotice(''), 2200);
      return next;
    });
  }, []);

  return { savedIds, ready, notice, toggle };
}
