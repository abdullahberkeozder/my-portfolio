package com.berkeozder.controller.api.interfaces;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;

/**
 * Kurumsal Blog Dışa Aktarma ve Raporlama REST API Arayüzü (Adım 13)
 *
 * @author Berke Özder
 */
public interface IExportApi {

    /**
     * Blog listesini Excel (.xlsx) formatında indirme uç noktası.
     *
     * @param includeDeleted Silinmiş blog kayıtlarının rapora dahil edilip edilmeyeceği
     * @return .xlsx dosyası olarak InputStreamResource akışı
     */
    ResponseEntity<InputStreamResource> exportBlogsToExcel(boolean includeDeleted);

    /**
     * Blog listesini UTF-8 BOM destekli CSV formatında indirme uç noktası.
     *
     * @param includeDeleted Silinmiş blog kayıtlarının rapora dahil edilip edilmeyeceği
     * @return .csv dosyası olarak InputStreamResource akışı
     */
    ResponseEntity<InputStreamResource> exportBlogsToCsv(boolean includeDeleted);
}

