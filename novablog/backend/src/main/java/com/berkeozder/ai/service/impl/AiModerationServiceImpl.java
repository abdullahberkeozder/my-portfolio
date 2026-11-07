package com.berkeozder.ai.service.impl;

import com.berkeozder.ai.client.IAiChatClient;
import com.berkeozder.ai.dto.AiModerationResponseDto;
import com.berkeozder.ai.service.IAiModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

/**
 * AI İçerik Denetleme ve Duygu Durum Servis Uygulaması.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class AiModerationServiceImpl implements IAiModerationService {

    private final IAiChatClient aiChatClient;

    @Override
    public AiModerationResponseDto moderateComment(String content) {
        log.info("AI Moderasyon denetimi başlatılıyor. İçerik uzunluğu: {}", content != null ? content.length() : 0);
        AiModerationResponseDto result = aiChatClient.moderateContent(content);
        log.info("AI Moderasyon sonucu: Flagged={}, Toxicity={}, Sentiment={}",
                result.isFlagged(), result.getToxicityScore(), result.getSentiment());
        return result;
    }
}
