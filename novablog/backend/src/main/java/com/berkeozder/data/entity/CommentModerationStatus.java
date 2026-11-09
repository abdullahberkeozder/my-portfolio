package com.berkeozder.data.entity;

/**
 * Yorum denetimi ve moderasyon yaşam döngüsü durumları (Moderation State Machine).
 *
 * @author Berke Özder
 */
public enum CommentModerationStatus {
    /**
     * Yorum sisteme girilmiş, henüz AI veya moderatör tarafından taranmamış.
     */
    PENDING_MODERATION,

    /**
     * AI moderasyonu tarafından incelenmiş ve güvenli bulunarak onaylanmış.
     */
    APPROVED,

    /**
     * AI toksisite eşiğini (>= 0.50) aşmış veya zararlı içerik sebebiyle karantinaya alınmış.
     */
    FLAGGED_TOXIC,

    /**
     * Yorum soft-delete ile silinmiş.
     */
    SOFT_DELETED
}

