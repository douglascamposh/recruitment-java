package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IRealTimeContextService;
import com.rag.gemini_rag.utils.AiJsonParser;
import lombok.Getter;
import lombok.Setter;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatOptions;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RealTimeContextServiceImpl implements IRealTimeContextService {

    private final ChatClient chatClient;

    public RealTimeContextServiceImpl(ChatClient.Builder chatClientBuilder) {
        // Configuramos el ChatClient para que pueda usar herramientas, como la búsqueda de Google.
        this.chatClient = chatClientBuilder
                .defaultOptions(VertexAiGeminiChatOptions.builder()
                        .googleSearchRetrieval(true) // Habilita la herramienta de búsqueda de Google
                        .build())
                .build();
    }

    /**
     * Llama a la IA con la capacidad de buscar en Google para obtener tendencias de marketing actuales.
     * @return Una lista de strings con las tendencias encontradas.
     */
    @Override
    public List<String> getCurrentTrends() {
        String systemMessageText = """
            You are a market research analyst AI. Your task is to use your search tool to find current, real-time marketing or cultural trends.
            Focus on trends that would be relevant for a social media marketing campaign.
            Summarize the top 2-3 trends you find.
            Respond ONLY with a valid JSON object in the format: {"trends": ["...", "...", ...]}
        """;

        String userMessageText = "Find the top current marketing trends right now.";

        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), new UserMessage(userMessageText)));
        String jsonResponse = chatClient.prompt(prompt).call().content();

        TrendsResponse response = AiJsonParser.parse(jsonResponse, TrendsResponse.class);

        if (response == null || response.getTrends() == null) {
            return List.of("Real-time trends could not be retrieved.");
        }

        return response.getTrends();
    }

    @Getter
    @Setter
    private static class TrendsResponse {
        private List<String> trends;
    }
}
