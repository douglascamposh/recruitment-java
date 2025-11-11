package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalysisResponse;
import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.enums.PostType;
import com.rag.gemini_rag.service.IPromptAnalysisService;
import com.rag.gemini_rag.utils.AiJsonParser;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
public class PromptAnalysisServiceImpl implements IPromptAnalysisService {

     private final ChatClient chatClient;

    public PromptAnalysisServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public AnalyzedPromptContext analyze(String rawPrompt, List<String> trends, List<String> insights) {
        String postTypes = String.join(", ", Stream.of(PostType.values()).map(Enum::name).toArray(String[]::new));

        String jsonFormat = """
            {
              "postType": "ONE_OF_THE_POST_TYPES",
              "tone": "A description of the brand tone",
              "keyFacts": ["list", "of", "key", "facts"],
              "justification": "The reason for my strategic choices."
            }
        """;

        String systemMessageText = """
            You are an expert marketing strategist. Your task is to analyze a user's prompt and supplementary data to extract key strategic information.
            
            Supplementary Data:
            - Real-Time Trends: %s
            - Relevant Performance Insights: %s
            
            Your analysis MUST incorporate this supplementary data. For example, if a trend aligns with the prompt, mention it in your justification.
            You must classify the prompt into one of the following post types: [%s].
            You must adhere to the specified tone and include all key facts provided.
            Provide a justification for your creative choices.
            Respond ONLY with a valid JSON object that conforms to the following format:
            %s
        """.formatted(trends, insights, postTypes, jsonFormat);

        UserMessage userMessage = new UserMessage("Analyze the following marketing prompt:\n\n---\n" + rawPrompt + "\n---");

        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), userMessage));

        String jsonResponse = chatClient.prompt(prompt)
                .call()
                .content();
        AnalysisResponse response = AiJsonParser.parse(jsonResponse, AnalysisResponse.class);

        if (response == null) {
            throw new RuntimeException("It was not possible parsing the answer from the IA to analyse marketing prompt.");
        }

        return AnalyzedPromptContext.builder()
                .identifiedPostType(response.postType())
                .identifiedTone(response.tone())
                .keyFacts(response.keyFacts())
                .analysisJustification(response.justification())
                .performanceInsights(insights)
                .realTimeTrends(trends)
                .build();
    }
}
