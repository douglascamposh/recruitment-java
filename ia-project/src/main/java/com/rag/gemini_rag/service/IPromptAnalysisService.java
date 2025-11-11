package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;

import java.util.List;

public interface IPromptAnalysisService {
    public AnalyzedPromptContext analyze(String rawPrompt, List<String> trends, List<String> insights);
}
