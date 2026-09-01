'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DraftActionsProps {
  requestId: string;
  serviceId: string;
  progressLabel: string;
  missingLabel: string;
}

export default function DraftActions({ requestId, serviceId, progressLabel, missingLabel }: DraftActionsProps) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm('Bu taslağı silmek istediğinizden emin misiniz?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error || 'Taslak silinemedi.');
      }
    } catch {
      alert('Taslak silinirken bir hata oluştu.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="draft-actions-wrap">
      <p><strong>{progressLabel}</strong><span>{missingLabel}</span></p>
      <Link
        href={`/?service=${serviceId}&draftId=${requestId}`}
        className="draft-resume-btn"
      >
        Taslağa Devam Et →
      </Link>
      <button
        type="button"
        className="draft-delete-btn"
        disabled={busy}
        onClick={handleDelete}
      >
        {busy ? 'Siliniyor…' : 'Taslağı Sil'}
      </button>
    </div>
  );
}
