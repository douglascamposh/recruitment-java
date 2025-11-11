package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.FaqRequest;
import com.rag.gemini_rag.dto.FaqResponse;
import com.rag.gemini_rag.service.IMultimodalFaqService;
import com.rag.gemini_rag.utils.AiJsonParser;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import java.net.MalformedURLException;
import java.util.List;

@Service
public class MultimodalFaqServiceImpl implements IMultimodalFaqService {

    private final ChatClient chatClient;

    public MultimodalFaqServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public FaqResponse generateFaqsFromImage(FaqRequest request) throws MalformedURLException {
        String textPrompt = "Generate 3 frequently asked questions (FAQs) for the product shown in the image, which is a '%s'.".formatted(request.productName());

        UserMessage userMessage = UserMessage.builder()
                .text(textPrompt)
                .media(new Media(MimeTypeUtils.IMAGE_JPEG, new UrlResource(request.imageUrl())))
                .build();

        String jsonFormat = """
            {
              "faqs": [
                {"question": "...", "answer": "..."},
                {"question": "...", "answer": "..."}
              ]
            }
        """;

        String systemPromptText = "You are a helpful product assistant. Create FAQs based on the user's image and prompt. Respond ONLY with a valid JSON object matching this structure: " + jsonFormat;
        SystemMessage systemMessage = new SystemMessage(systemPromptText);
        Prompt prompt = new Prompt(List.of(userMessage, systemMessage));

        String jsonResponse = chatClient.prompt(prompt)
                .call()
                .content();

        FaqResponse response = AiJsonParser.parse(jsonResponse, FaqResponse.class);
        if (response == null) {
            throw new RuntimeException("Failed to parse FAQ response from AI.");
        }
        return response;
    }
}
