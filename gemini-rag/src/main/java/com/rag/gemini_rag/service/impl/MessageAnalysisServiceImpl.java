package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.MessageAnalysisResult;
import com.rag.gemini_rag.service.IMessageAnalysisService;
import org.jsoup.Jsoup;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageAnalysisServiceImpl implements IMessageAnalysisService {

    private final ChatModel chatModel;
    private final EmbeddingModel embeddingModel;
    private final VectorStore vectorStore;

    public MessageAnalysisServiceImpl(ChatModel chatModel,
                                      EmbeddingModel embeddingModel,
                                      VectorStore vectorStore) {
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
    }

    @Override
    public MessageAnalysisResult analyze(String rawText) {
        String cleanedText = Jsoup.parse(rawText).text();

        String category = askGemini("""
            Classify the following message into one of the following categories: 
            [spam, potential_customer, general_inquiry]
            
            Message: "%s"
            
            Respond only with the category.
        """.formatted(cleanedText));

        String sentiment = askGemini("""
            Analyze the sentiment of the following message and respond with one of: 
            [positive, neutral, negative]
            
            Message: "%s"
            
            Respond only with the sentiment.
        """.formatted(cleanedText));

        // Crear documento con metadatos
        Document document = new Document(cleanedText);
        document.getMetadata().put("category", category);
        document.getMetadata().put("sentiment", sentiment);

        // Generar y añadir embedding al VectorStore
        embeddingModel.embed(document); // Embedding in-place
        vectorStore.add(List.of(document));

        return new MessageAnalysisResult(category, sentiment);
    }

    private String askGemini(String promptText) {
        var prompt = new Prompt(promptText);
        return chatModel.call(prompt).getResult().getOutput().getText().trim().toLowerCase();
    }
}
