package com.rag.gemini_rag.utils;

import com.rag.gemini_rag.dto.UserMessageRequest;
import org.springframework.ai.document.Document;

import java.util.List;

public class PromtBuilder {
    public static String buildAnalysisPrompt(UserMessageRequest newMessage, List<UserMessageRequest> history, List<Document> similarDocs) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Analyze if the user is a spammer based on the following message history.\n");
        prompt.append("Definition of spammer: sends repeated messages about multiple articles without clear buying intent.\n\n");

        prompt.append("=== MESSAGE HISTORY ===\n");
        for (UserMessageRequest msg : history) {
            prompt.append("- [")
                    .append(msg.date())
                    .append("] Article ID: ")
                    .append(msg.articleId())
                    .append(" => \"")
                    .append(msg.text())
                    .append("\"\n");
        }

        prompt.append("\n=== SIMILAR MESSAGES FROM OTHER USERS (SPAM ONLY) ===\n");
        for (Document doc : similarDocs) {
            prompt.append("- [SPAM] Article ID: ")
                    .append(doc.getMetadata().getOrDefault("articleId", "N/A"))
                    .append(" => \"")
                    .append(doc.getText())
                    .append("\"\n");
        }

        prompt.append("\n=== NEW MESSAGE ===\n").append(newMessage.text()).append("\n");

        if (newMessage.additionalInfo() != null && !newMessage.additionalInfo().isBlank()) {
            prompt.append("\nAdditional Info: ").append(newMessage.additionalInfo()).append("\n");
        }

        prompt.append("""
        \nReturn result as JSON like:
        {
          "category": "spam | potential_customer | general_inquiry",
          "sentiment": "positive | neutral | negative",
          "isSpammer": true | false
        }
        Do NOT include markdown or explanation. Only return raw JSON.
        """);

        return prompt.toString();
    }
}
