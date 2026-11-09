package com.berkeozder.data.entity;

/**
 * Blog makalesi açık yaşam döngüsü durumları (Lifecycle State Machine).
 *
 * @author Berke Özder
 */
public enum BlogLifecycleStatus {
    /**
     * Makale yayında, aktif olarak okunabilir, beğenilebilir ve yorum yapılabilir.
     */
    ACTIVE,

    /**
     * Makale soft-delete ile silinmiş, 30 günlük saklama (retention) süresi içinde
     * ve admin tarafından geri yüklenebilir (RESTORE).
     */
    SOFT_DELETED,

    /**
     * 30 günlük saklama süresi dolmuş, Spring Batch Chunk Cleanup Job tarafından
     * fiziksel olarak temizlenmeyi (HARD_DELETE / PURGE) bekleyen durum.
     */
    PURGE_ELIGIBLE
}

