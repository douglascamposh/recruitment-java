package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.ContentBriefResponse;

public interface IMarketingOrchestratorService {
    ContentBriefResponse generateBrief(String rawPrompt);
}
