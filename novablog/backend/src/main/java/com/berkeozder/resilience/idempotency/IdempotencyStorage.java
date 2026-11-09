package com.berkeozder.resilience.idempotency;

import java.util.Optional;

/**
 * Idempotency anahtarı saklama ve sorgulama arayüzü.
 * Redis ve In-Memory implementasyonları destekler.
 *
 * @author Berke Özder
 */
public interface IdempotencyStorage {

    /**
     * Anahtar daha önce yoksa PROCESSING durumunda oluşturur (Atomik lock).
     *
     * @param key        Idempotency anahtarı
     * @param ttlSeconds Kilit geçerlilik süresi (saniye)
     * @return true ise kilit başarıyla alındı, false ise anahtar zaten mevcut
     */
    boolean lock(String key, long ttlSeconds);

    /**
     * Anahtara ait kaydı sorgular.
     *
     * @param key Idempotency anahtarı
     * @return Opsiyonel kayıt
     */
    Optional<IdempotencyRecord> get(String key);

    /**
     * İşlem başarıyla tamamlandığında yanıtı önbelleğe kaydeder.
     *
     * @param key          Idempotency anahtarı
     * @param statusCode   HTTP durum kodu
     * @param contentType  İçerik tipi
     * @param responseBody Yanıt gövdesi
     * @param ttlSeconds   Önbellek saklama süresi (saniye)
     */
    void complete(String key, int statusCode, String contentType, String responseBody, long ttlSeconds);

    /**
     * Hata veya iptal durumunda kilidi serbest bırakır.
     *
     * @param key Idempotency anahtarı
     */
    void unlock(String key);
}
