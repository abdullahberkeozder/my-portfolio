/**
 * Orkestra U5 Merkezi Durum Sözlüğü ve Next-Action Resolver
 *
 * Amaç: Müşteri ve usta çalışma alanlarında her durum için TEK birincil eylem (single primary CTA)
 * belirlemek, aynı hedefe giden çift CTA'ları engellemek ve erişilebilir (a11y) standartlara tam uymak.
 */

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'matching'
  | 'quotes_received'
  | 'provider_selected'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  description: string;
}

export const REQUEST_STATUS_DICTIONARY: Record<string, StatusMeta> = {
  draft: {
    label: 'Taslak',
    tone: 'warning',
    description: 'Talep henüz tamamlanıp ustalara iletilmedi.',
  },
  submitted: {
    label: 'Gönderildi',
    tone: 'info',
    description: 'Talep sisteme kaydedildi, usta eşleşmesi başlatılıyor.',
  },
  matching: {
    label: 'Ustalar Aranıyor',
    tone: 'info',
    description: 'Bölgenizdeki uygun ustalara talep yönlendiriliyor.',
  },
  quotes_received: {
    label: 'Teklifler Geldi',
    tone: 'success',
    description: 'Ustalar teklif iletti, karşılaştırma yapabilirsiniz.',
  },
  provider_selected: {
    label: 'Usta Seçildi',
    tone: 'accent',
    description: 'Bir teklif kabul edildi ve iş odası açıldı.',
  },
  completed: {
    label: 'Tamamlandı',
    tone: 'success',
    description: 'Hizmet başarıyla tamamlandı.',
  },
  cancelled: {
    label: 'İptal Edildi',
    tone: 'neutral',
    description: 'Talep kullanıcı veya sistem tarafından iptal edildi.',
  },
  expired: {
    label: 'Süresi Doldu',
    tone: 'danger',
    description: 'Talep geçerlilik süresi içinde işlem görmedi.',
  },
};

export interface ActionLink {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'neutral';
  ariaLabel?: string;
}

export interface CustomerActionResolution {
  primaryAction: ActionLink | null;
  secondaryAction?: ActionLink | null;
  helperText?: string | null;
}

export interface CustomerRequestActionContext {
  requestId: string;
  status: string;
  quoteCount?: number;
  jobId?: string | null;
  isDraft?: boolean;
}

/**
 * Müşteri talepleri için tek birincil eylemi (Next Action) çözer.
 * P1.1 kuralı: Aynı hedefe giden çift CTA üretilmez.
 */
export function resolveCustomerRequestAction(
  ctx: CustomerRequestActionContext
): CustomerActionResolution {
  const { requestId, status, quoteCount, jobId, isDraft } = ctx;

  if (isDraft || status === 'draft') {
    return {
      primaryAction: null,
      secondaryAction: null,
      helperText: null,
    };
  }

  if (status === 'quotes_received') {
    const count = typeof quoteCount === 'number' && quoteCount > 0 ? quoteCount : 0;
    const label = count > 0 ? `Teklifleri Karşılaştır (${count}) →` : 'Teklifleri Karşılaştır →';
    return {
      primaryAction: {
        label,
        href: `/taleplerim/${encodeURIComponent(requestId)}/teklifler`,
        variant: 'primary',
      },
      // P1.1: Çift CTA kaldırıldı; aynı sayfaya giden "Eşleşme ve teklifler" linki eklenmez.
      secondaryAction: null,
      helperText: null,
    };
  }

  if (status === 'provider_selected') {
    if (jobId) {
      return {
        primaryAction: {
          label: 'İş Ekranına Git →',
          href: `/islerim/${encodeURIComponent(jobId)}`,
          variant: 'primary',
        },
        secondaryAction: null,
        helperText: null,
      };
    }
    return {
      primaryAction: {
        label: 'İşlerimde Kontrol Et →',
        href: '/islerim',
        variant: 'primary',
      },
      secondaryAction: null,
      helperText: 'İş bağlantısı henüz doğrulanamadı.',
    };
  }

  if (status === 'expired' || status === 'cancelled') {
    return {
      primaryAction: {
        label: 'Yeni Talep Oluştur →',
        href: '/#services',
        variant: 'secondary',
      },
      secondaryAction: {
        label: 'Talep ayrıntıları',
        href: `/taleplerim/${encodeURIComponent(requestId)}/teklifler`,
        variant: 'neutral',
      },
      helperText: null,
    };
  }

  if (status === 'completed') {
    if (jobId) {
      return {
        primaryAction: {
          label: 'Tamamlanan İşi İncele →',
          href: `/islerim/${encodeURIComponent(jobId)}`,
          variant: 'secondary',
        },
        secondaryAction: {
          label: 'Talep ayrıntıları',
          href: `/taleplerim/${encodeURIComponent(requestId)}/teklifler`,
          variant: 'neutral',
        },
        helperText: null,
      };
    }
    return {
      primaryAction: {
        label: 'Talep ayrıntıları →',
        href: `/taleplerim/${encodeURIComponent(requestId)}/teklifler`,
        variant: 'secondary',
      },
      secondaryAction: null,
      helperText: null,
    };
  }

  // submitted, matching veya diğer aktif durumlar
  return {
    primaryAction: {
      label: 'Eşleşme ve teklifler →',
      href: `/taleplerim/${encodeURIComponent(requestId)}/teklifler`,
      variant: 'secondary',
    },
    secondaryAction: null,
    helperText: null,
  };
}

export interface TradespersonActionResolution {
  primaryAction: ActionLink | null;
  secondaryAction?: ActionLink | null;
  helperText?: string | null;
}

export interface TradespersonOpportunityActionContext {
  requestId: string;
  opportunityClosed?: boolean;
  myQuote?: {
    id?: string;
    status: string;
    version?: number;
  } | null;
  jobId?: string | null;
}

/**
 * Usta fırsatları için tek birincil eylemi çözer.
 */
export function resolveTradespersonOpportunityAction(
  ctx: TradespersonOpportunityActionContext
): TradespersonActionResolution {
  const { requestId, opportunityClosed, myQuote, jobId } = ctx;

  if (myQuote?.status === 'accepted') {
    return {
      primaryAction: {
        label: 'İş Ekranına Git →',
        href: jobId ? `/islerim/${encodeURIComponent(jobId)}` : '/islerim',
        variant: 'primary',
      },
      secondaryAction: null,
      helperText: !jobId ? 'İş bağlantısı henüz doğrulanamadı.' : null,
    };
  }

  if (opportunityClosed) {
    return {
      primaryAction: null,
      secondaryAction: null,
      helperText: 'Bu fırsat için yeni işlem yapılamaz',
    };
  }

  if (myQuote) {
    return {
      primaryAction: {
        label: 'Teklifi İncele / Güncelle →',
        href: `/usta/teklifler/${encodeURIComponent(requestId)}`,
        variant: 'secondary',
      },
      secondaryAction: null,
      helperText: null,
    };
  }

  return {
    primaryAction: {
      label: 'Talebi İncele / Teklif Ver →',
      href: `/usta/teklifler/${encodeURIComponent(requestId)}`,
      variant: 'primary',
    },
    secondaryAction: null,
    helperText: null,
  };
}
