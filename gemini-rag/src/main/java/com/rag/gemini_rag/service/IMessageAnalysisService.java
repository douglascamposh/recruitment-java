package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.MessageAnalysisResult;

public interface IMessageAnalysisService {
    MessageAnalysisResult analyze(String rawText);
}
