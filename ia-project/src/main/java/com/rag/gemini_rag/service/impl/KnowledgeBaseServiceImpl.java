package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IKnowledgeBaseService;
import jakarta.annotation.PostConstruct;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseServiceImpl implements IKnowledgeBaseService {

    private final VectorStore vectorStore;

    public KnowledgeBaseServiceImpl(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    /**
     * Este método se ejecuta después de que el bean es creado.
     * Carga la base de conocimiento en ChromaDB. Al usar IDs únicos para cada documento,
     * esta operación es idempotente (no creará duplicados si se ejecuta de nuevo).
     */
    @PostConstruct
    public void initialize() {
        vectorStore.add(List.of(
                new Document("insight-1", "Short videos about food processes ('how it's made') have high engagement on Facebook.", Map.of()),
                new Document("insight-2", "LinkedIn posts for B2B SaaS tools perform better with a professional tone and explanatory carousels.", Map.of()),
                new Document("insight-3", "Flash sales on Instagram generate more clicks if the discount is clear within the first 3 seconds of the video.", Map.of()),
                new Document("insight-4", "For local restaurants, high-quality photos of dishes outperform generic graphics.", Map.of()),
                new Document("insight-5", "Using niche hashtags like #TechManagerTips on LinkedIn increases reach with specific audiences.", Map.of()),
                new Document("insight-6", "Campaigns that mention 'sustainability' or 'eco-friendly' have seen a 15% increase in positive engagement.", Map.of())
        ));
    }

    @Override
    public List<String> findRelevantInsights(String topic, int limit) {
        SearchRequest request = SearchRequest.builder()
                .query(topic)
                .topK(limit)
                .build();
        return vectorStore.similaritySearch(request).stream()
                .map(Document::getText)
                .collect(Collectors.toList());
    }
}
