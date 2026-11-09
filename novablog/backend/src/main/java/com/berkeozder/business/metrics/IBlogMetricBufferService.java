package com.berkeozder.business.metrics;

import java.util.Map;

/**
 * Blog Etkileşim Metrikleri (Görüntülenme / Beğeni) Tamponlama Servisi Arayüzü.
 * Write-Behind Deseni (Redis INCR / LongAdder Buffer) ile yüksek eşzamanlılıkta
 * veritabanı satır kilitlemelerini (row lock contention) önler.
 *
 * @author Berke Özder
 */
public interface IBlogMetricBufferService {

    /**
     * Blog görüntülenme sayısını tampon bellekte 1 artırır.
     *
     * @param blogId blog id
     */
    void incrementView(Long blogId);

    /**
     * Blog beğeni sayısını tampon bellekte 1 artırır.
     *
     * @param blogId blog id
     */
    void incrementLike(Long blogId);

    /**
     * Blog beğeni sayısını tampon bellekte 1 azaltır (unlike).
     *
     * @param blogId blog id
     */
    void decrementLike(Long blogId);

    /**
     * Belirtilen blog için henüz veritabanına yazılmamış tamponlanmış görüntülenme farkını döner.
     *
     * @param blogId blog id
     * @return tamponlanmış görüntülenme sayısı
     */
    long getBufferedViews(Long blogId);

    /**
     * Belirtilen blog için henüz veritabanına yazılmamış tamponlanmış beğeni farkını döner.
     *
     * @param blogId blog id
     * @return tamponlanmış beğeni sayısı
     */
    long getBufferedLikes(Long blogId);

    /**
     * Tamponlanmış tüm görüntülenme sayılarını atomik olarak boşaltır ve map olarak döner.
     *
     * @return BlogId -> view delta map
     */
    Map<Long, Long> drainViewBuffer();

    /**
     * Tamponlanmış tüm beğeni sayılarını atomik olarak boşaltır ve map olarak döner.
     *
     * @return BlogId -> like delta map
     */
    Map<Long, Long> drainLikeBuffer();

    /**
     * Tamponda bekleyen veri olup olmadığını kontrol eder.
     *
     * @return tampon boş ise true
     */
    boolean isBufferEmpty();
}

