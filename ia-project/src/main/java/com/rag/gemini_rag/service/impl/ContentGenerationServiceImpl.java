package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.TextualContent;
import com.rag.gemini_rag.dto.TextualContentResponse;
import com.rag.gemini_rag.service.IContentGenerationService;
import com.rag.gemini_rag.utils.AiJsonParser;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class ContentGenerationServiceImpl implements IContentGenerationService {

     private final ChatClient chatClient;

     public ContentGenerationServiceImpl(ChatClient.Builder chatClientBuilder) {
         this.chatClient = chatClientBuilder.build();
     }

    @Override
    public TextualContent generate(AnalyzedPromptContext context) {
        String jsonFormat = """
            {
              "postBody": "The main body of the post...",
              "caption": "The caption with a clear CTA...",
              "hashtags": ["#list", "#of", "#hashtags"],
              "justification": "The justification of my creative choices."
            }
        """;

        String systemMessageText = """
            You are an expert copywriter specializing in high-engagement social media content.
            Your task is to generate a post body, a caption with a clear call-to-action (CTA), and 3-5 relevant hashtags based on a strategic brief.
            You must adhere to the specified tone and include all key facts provided.
            Provide a justification for your creative choices.
            Respond ONLY with a valid JSON object that conforms to the following format:
            %s
        """.formatted(jsonFormat);

        String userPrompt = """
            Generate content based on the following strategic brief:
            
            - Post Type: %s
            - Brand Tone: %s
            - Key Facts to Include: %s
        """.formatted(context.identifiedPostType().toString(), context.identifiedTone(), context.keyFacts());

        UserMessage userMessage = new UserMessage(userPrompt);
        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), userMessage));

        String jsonResponse = chatClient.prompt(prompt)
                .call()
                .content();

        TextualContentResponse response = AiJsonParser.parse(jsonResponse, TextualContentResponse.class);
        if (response == null) {
            throw new RuntimeException("It was not possible parsing the answer form IA to generate the content.");
        }

        return TextualContent.builder()
                .postBody(response.postBody())
                .caption(response.caption())
                .hashtags(response.hashtags())
                .contentJustification(response.justification())
                .build();
    }
}