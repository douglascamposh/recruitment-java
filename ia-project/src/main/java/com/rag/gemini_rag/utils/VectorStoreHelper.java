package com.rag.gemini_rag.utils;

import com.rag.gemini_rag.dto.UserMessageAnalysisResult;
import com.rag.gemini_rag.dto.UserMessageRequest;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VectorStoreHelper {
    private final VectorStore vectorStore;

    public VectorStoreHelper(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public List<Document> searchSimilar(String text) {
        SearchRequest request = SearchRequest.builder()
                .query(text)
                .topK(5)
                .build();

        return vectorStore.similaritySearch(request).stream()
                .toList();
    }

}
