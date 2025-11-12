package com.rag.gemini_rag.utils;

import com.rag.gemini_rag.dto.JournalAnalysisRequest;
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
    public static String buildJournalReflectionPrompt(JournalAnalysisRequest journal) {
        return """
        You are a compassionate and insightful journaling assistant, inspired by the principles of cognitive-behavioral therapy (CBT). 
        Your goal is to help the user gain clarity and perspective on their thoughts and feelings.

        ### Task
        Analyze the following journal entry. Extract the overall sentiment, identify key themes, and write a short, constructive reflection.

        ### Rules
        1. **Reflection:** The response must be warm, empathetic, and non-judgmental. Do not give direct advice unless the overall sentiment is strongly negative. Instead, use open-ended questions that invite self-reflection. The reflection length should be between 50 and 100 words.
        2. **Sentiment:** Classify the general sentiment of the entry into one of these categories: 'Positive', 'Neutral', 'Negative', 'Mixed'.
        3. **Key Themes:** Identify 1 to 3 main themes or emotions from the entry (e.g., 'Work-related anxiety', 'Gratitude for friendship', 'Uncertainty about the future').
        4. **Output Format:** Respond only with a valid JSON object. Do not include markdown, comments, or any additional text outside the JSON.

        ### User’s Journal Entry
        - Title: %s
        - Body: %s
        - Reported Mood: %s
        - People: %s
        - Places: %s
        - Activities: %s

        ### Output JSON Object
        {
          "sentiment": "...",
          "keyThemes": ["...", "..."],
          "reflection": "..."
        }
        """.formatted(
                journal.title(),
                journal.body(),
                String.join(", ", journal.moods()),
                String.join(", ", journal.withTags()),
                String.join(", ", journal.whereTags()),
                String.join(", ", journal.doingTags())
        );
    }
}
