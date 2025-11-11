package com.rag.gemini_rag.service;

import java.util.List;

public interface IKnowledgeBaseService {
    List<String> findRelevantInsights(String topic, int limit);
}
