package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VisualFormatRecommendation;
import com.rag.gemini_rag.enums.VisualFormat;
import com.rag.gemini_rag.service.IVisualFormatService;
import com.rag.gemini_rag.utils.AiJsonParser;
import lombok.Getter;
import lombok.Setter;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VisualFormatServiceImpl implements IVisualFormatService {
    private final ChatClient chatClient;

    public VisualFormatServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public VisualFormatRecommendation recommend(AnalyzedPromptContext context) {
        String systemMessageText = """
            You are a senior media strategist. Based on the marketing brief, recommend the most effective visual format: IMAGE or VIDEO.
            High-urgency, sales-driven, or dynamic process-focused prompts often benefit from VIDEO.
            Brand introductions, product showcases, or educational carousels often work well as IMAGE.
            Provide a justification for your strategic choice.
            Respond ONLY with a valid JSON object in the format: {"format": "...", "justification": "..."}
        """;

        String userPromptText = """
            Marketing Brief:
            - Post Type: %s
            - Brand Tone: %s
            - Key Facts: %s
        """.formatted(context.identifiedPostType(), context.identifiedTone(), context.keyFacts());

        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), new UserMessage(userPromptText)));
        String jsonResponse = chatClient.prompt(prompt).call().content();

        FormatResponse response = AiJsonParser.parse(jsonResponse, FormatResponse.class);

        if (response == null) {
            // Valor por defecto en caso de error de parseo
            return new VisualFormatRecommendation(VisualFormat.IMAGE, "Defaulting to IMAGE due to an internal error.");
        }

        return new VisualFormatRecommendation(response.getFormat(), response.getJustification());
    }

    @Getter
    @Setter
    private static class FormatResponse {
        private VisualFormat format;
        private String justification;
    }
}
