package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VisualConcept;
import com.rag.gemini_rag.dto.VisualConceptResponse;
import com.rag.gemini_rag.service.IVisualConceptService;
import com.rag.gemini_rag.utils.AiJsonParser;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class VisualConceptServiceImpl implements IVisualConceptService {

     private final ChatClient chatClient;

     public VisualConceptServiceImpl(ChatClient.Builder chatClientBuilder) {
         this.chatClient = chatClientBuilder.build();
     }

    @Override
    public VisualConcept generate(AnalyzedPromptContext context) {
        String jsonFormat = """
            {
              "conceptDescription": "A clear and actionable description of the visual concept...",
              "justification": "The reason why this visual concept is effective for the brief."
            }
        """;

        String systemMessageText = """
            You are a creative director. Your task is to generate a clear, actionable visual concept for a graphic designer or videographer.
            The concept should align perfectly with the provided marketing brief.
            Provide a justification for why this visual concept is effective.
            Respond ONLY with a valid JSON object that conforms to the following format:
            %s
        """.formatted(jsonFormat);

        String userPrompt = """
            Generate a visual concept based on the following strategic brief:
            
            - Post Type: %s
            - Brand Tone: %s
            - Key Facts: %s
        """.formatted(context.identifiedPostType().toString(), context.identifiedTone(), context.keyFacts());

        UserMessage userMessage = new UserMessage(userPrompt);
        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), userMessage));

        String jsonResponse = chatClient.prompt(prompt)
                .call()
                .content();

        VisualConceptResponse response = AiJsonParser.parse(jsonResponse, VisualConceptResponse.class);
        if (response == null) {
            throw new RuntimeException("The AI response could not be parsed for visual concept generation.");
        }

        return VisualConcept.builder()
                .conceptDescription(response.conceptDescription())
                .visualJustification(response.justification())
                .build();
    }
}
