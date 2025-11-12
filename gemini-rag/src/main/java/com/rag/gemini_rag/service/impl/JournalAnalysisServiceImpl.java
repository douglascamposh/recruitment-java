package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.JournalAnalysisRequest;
import com.rag.gemini_rag.dto.JournalAnalysisResult;
import com.rag.gemini_rag.service.IJournalAnalysisService;
import com.rag.gemini_rag.utils.AiJsonParser;
import com.rag.gemini_rag.utils.PromtBuilder;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.ai.vectorstore.SearchRequest;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class JournalAnalysisServiceImpl implements IJournalAnalysisService {
    private final ChatModel chatModel;
    private final VectorStore vectorStore;

    public JournalAnalysisServiceImpl(ChatModel chatModel, VectorStore vectorStore) {
        this.chatModel = chatModel;
        this.vectorStore = vectorStore;
    }

    /**
     * Endpoint 1: Analyze a new journal entry, save it to ChromaDB, and return the reflection.
     */
    public JournalAnalysisResult analyzeAndSaveJournal(JournalAnalysisRequest newJournal) {
        // 1. Build the prompt
        String promptText = PromtBuilder.buildJournalReflectionPrompt(newJournal);

        // 2. Call the model
        String response = chatModel.call(new Prompt(promptText)).getResult().getOutput().getText().trim();
        // 3. Parse the JSON response
//        JournalAnalysisResult analysis = jsonParser.parse(response);
        JournalAnalysisResult analysis = AiJsonParser.parse(response, JournalAnalysisResult.class);

        // 4. Save to the Vector Store (ChromaDB)
        // Concatenate the title and body to generate a good embedding
        String journalContent = "Title: " + newJournal.title() + "\nBody: " + newJournal.body();

        // Metadata is KEY to allow filtering by user later
        Map<String, Object> metadata = Map.of(
                "userId", newJournal.userId(),
                "sentiment", analysis.sentiment(),
                "themes", String.join(",", analysis.keyThemes()),
                "timestamp", Instant.now().toString()
        );

        Document journalDocument = new Document(journalContent, metadata);
        vectorStore.add(List.of(journalDocument));

        return analysis;
    }

    /**
     * Endpoint 2: Retrieve the most recent journals for a user and generate a summarized reflection.
     */
    public String getReflectionOnRecentJournals(String userId, int limit) {
        // 1. Search the N most recent documents for that user in ChromaDB
        // NOTE: ChromaDB does not order by time; we retrieve by similarity to a general query.
        // A better approach would be similarity search and then filter/sort in business logic if needed.
        // Or use metadata filters if the VectorStore supports it efficiently.
        SearchRequest request = SearchRequest.builder()
                .query("reflection on my week")
                .topK(limit)
                .filterExpression("userId == '" + userId + "'")
                .build();

        List<Document> userJournals = vectorStore.similaritySearch(request);

        if (userJournals.isEmpty()) {
            return "I couldn’t find any recent journal entries to reflect on. Write something when you feel ready!";
        }

        // 2. Build a new prompt for meta-reflection
        String promptText = buildSummaryPrompt(userJournals);

        // 3. Call the model and return the response
        return chatModel.call(promptText);
    }

    private String buildSummaryPrompt(List<Document> journals) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a journaling assistant. You have retrieved the following recent entries from a user. ")
                .append("Your task is to read them and write a general reflection on recurring patterns, feelings, or themes you notice. ")
                .append("Be concise, empathetic, and constructive.\n\n");
        prompt.append("=== RECENT ENTRIES ===\n");
        for (Document doc : journals) {
            prompt.append("--- Entry ---\n")
            .append(doc.getText()) // The content of the document
            .append("\nSentiment: ").append(doc.getMetadata().getOrDefault("sentiment", "N/A"))
            .append("\n");
        }
        prompt.append("\n=== GENERAL REFLECTION ===\n");
        prompt.append("Based on these entries, here’s a reflection on your week:");
        return prompt.toString();
    }
}
