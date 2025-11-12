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

    public List<Document> searchSimilarSpams(String text) {
        SearchRequest request = SearchRequest.builder()
                .query(text)
                .topK(5) //numero de resultados a devolver
                .build();
        return vectorStore.similaritySearch(request);
        //este bloque es para filtrar los que son spam
//        return vectorStore.similaritySearch(request).stream()
//                .filter(doc -> "true".equalsIgnoreCase(String.valueOf(doc.getMetadata().get("isSpammer"))))
//                .toList();
    }

    public void saveMessageEmbedding(UserMessageRequest msg, UserMessageAnalysisResult analysis) {
        Document doc = new Document(msg.text());
        doc.getMetadata().put("userId", msg.userId());
        doc.getMetadata().put("articleId", msg.articleId());
        doc.getMetadata().put("category", analysis.category());
        doc.getMetadata().put("sentiment", analysis.sentiment());
        doc.getMetadata().put("isSpammer", String.valueOf(analysis.isSpammer()));
        vectorStore.add(List.of(doc));
    }
}
