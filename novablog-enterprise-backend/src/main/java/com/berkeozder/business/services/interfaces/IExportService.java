package com.berkeozder.business.services.interfaces;

import java.io.ByteArrayInputStream;

/**
 * Kurumsal Blog Dışa Aktarma ve Raporlama Servisi Arayüzü (Adım 13)
 * Blog kayıtlarını biçimlendirilmiş Excel (.xlsx) ve UTF-8 BOM destekli CSV olarak üretir.
 *
 * @author Berke Özder
 */
public interface IExportService {

    /**
     * Blog verilerini Microsoft Excel (.xlsx) formatında üretir.
     *
     * @param includeDeleted Silinmiş (soft-deleted) kayıtların rapora dahil edilip edilmeyeceği
     * @return İndirilebilir ByteArrayInputStream
     */
    ByteArrayInputStream exportBlogsToExcel(boolean includeDeleted);

    /**
     * Blog verilerini UTF-8 BOM destekli (Türkçe karakter uyumlu) CSV formatında üretir.
     *
     * @param includeDeleted Silinmiş (soft-deleted) kayıtların rapora dahil edilip edilmeyeceği
     * @return İndirilebilir ByteArrayInputStream
     */
    ByteArrayInputStream exportBlogsToCsv(boolean includeDeleted);
}

