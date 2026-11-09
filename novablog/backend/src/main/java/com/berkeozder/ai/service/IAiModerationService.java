package com.berkeozder.ai.service;

import com.berkeozder.ai.dto.AiModerationResponseDto;

/**
 * AI İçerik Denetleme ve Duygu Durum Servisi.
 *
 * @author Berke Özder
 */
public interface IAiModerationService {

    /**
     * Verilen metni toksisite ve duygu durumu açısından analiz eder.
     */
    AiModerationResponseDto moderateComment(String content);
}

