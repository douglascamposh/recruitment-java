package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.UserMessageAnalysisResult;
import com.rag.gemini_rag.dto.UserMessageRequest;
import com.rag.gemini_rag.service.IUserMessageAnalysisService;
import com.rag.gemini_rag.utils.AiJsonParser;
import com.rag.gemini_rag.utils.PromtBuilder;
import com.rag.gemini_rag.utils.VectorStoreHelper;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserMessageAnalysisServiceImpl implements IUserMessageAnalysisService {

    private final ChatModel chatModel;
    private final Set<String> suspectedSpammers = new HashSet<>();
    private final VectorStoreHelper vectorHelper;

    public UserMessageAnalysisServiceImpl(ChatModel chatModel, VectorStoreHelper vectorHelper) {
        this.chatModel = chatModel;
        this.vectorHelper = vectorHelper;
    }

//    @Override
//    public UserMessageAnalysisResult analyze(UserMessageRequest newMessage, List<UserMessageRequest> history) {
//        StringBuilder promptBuilder = new StringBuilder();
//
//        promptBuilder.append("Analyze if the user is a spammer based on the following message history.\n");
//        promptBuilder.append("Definition of spammer: sends repeated messages about multiple articles without clear buying intent.\n\n");
//
//        promptBuilder.append("=== MESSAGE HISTORY ===\n");
//        for (UserMessageRequest msg : history) {
//            promptBuilder.append("- [")
//                    .append(msg.date())
//                    .append("] Article ID: ")
//                    .append(msg.articleId())
//                    .append(" => \"")
//                    .append(msg.text())
//                    .append("\"\n");
//        }
//
//        promptBuilder.append("\n=== NEW MESSAGE ===\n");
//        promptBuilder.append(newMessage.text()).append("\n");
//
//        if (newMessage.additionalInfo() != null && !newMessage.additionalInfo().isBlank()) {
//            promptBuilder.append("\nAdditional Info: ").append(newMessage.additionalInfo()).append("\n");
//        }
//
//        promptBuilder.append("""
//            \nReturn result as JSON like:
//            {
//              "category": "spam | potential_customer | general_inquiry",
//              "sentiment": "positive | neutral | negative",
//              "isSpammer": true | false
//            }
//            """);
//
//        Prompt prompt = new Prompt(promptBuilder.toString());
//
//        String rawResponse = chatModel.call(prompt).getResult().getOutput().getText().trim();
//        rawResponse = Utils.cleanRawJson(rawResponse);
//
//        try {
//            ObjectMapper mapper = new ObjectMapper();
//            JsonNode node = mapper.readTree(rawResponse);
//            String category = node.get("category").asText();
//            String sentiment = node.get("sentiment").asText();
//            boolean isSpammer = node.get("isSpammer").asBoolean();
//
//            if (isSpammer) {
//                suspectedSpammers.add(newMessage.userId());
//            }
//
//            return new UserMessageAnalysisResult(category, sentiment, isSpammer);
//
//        } catch (Exception e) {
//            throw new RuntimeException("Error parsing Gemini response: " + rawResponse, e);
//        }
//    }
    @Override
    public UserMessageAnalysisResult analyze(UserMessageRequest newMessage, List<UserMessageRequest> history) {
        List<Document> similarSpamMessages = vectorHelper.searchSimilarSpams(newMessage.text());

        String promptText = PromtBuilder.buildAnalysisPrompt(newMessage, history, similarSpamMessages);
        String response = chatModel.call(new Prompt(promptText)).getResult().getOutput().getText().trim();

        UserMessageAnalysisResult analysis = AiJsonParser.parse(response);

        if (analysis.isSpammer()) {
            suspectedSpammers.add(newMessage.userId());
        }

        vectorHelper.saveMessageEmbedding(newMessage, analysis);
        return analysis;
    }

    @Override
    public boolean isSuspectedSpammer(String userId) {
        return suspectedSpammers.contains(userId);
    }

    @Override
    public List<String> getAllSuspectedSpammers() {
        return List.copyOf(suspectedSpammers);
    }
}