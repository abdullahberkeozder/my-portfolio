'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  label: string;
};

const HOLD_MS = 850;

export default function HoldToConfirmButton({ loading = false, onConfirm, label }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };

  const start = () => {
    if (loading || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      void onConfirm();
    }, HOLD_MS);
  };

  return (
    <button
      type="button"
      className="wizard-primary hold-to-confirm"
      disabled={loading}
      aria-busy={loading}
      aria-label={`${label}, basılı tutun`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) start();
      }}
      onKeyUp={(event) => {
        if (event.key === 'Enter' || event.key === ' ') cancel();
      }}
    >
      {loading ? 'Gönderiliyor…' : holding ? 'Bırakmadan devam edin…' : `${label} · Basılı tutun`}
    </button>
  );
}
