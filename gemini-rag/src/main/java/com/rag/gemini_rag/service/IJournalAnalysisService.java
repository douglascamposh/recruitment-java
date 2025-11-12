package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.JournalAnalysisRequest;
import com.rag.gemini_rag.dto.JournalAnalysisResult;

public interface IJournalAnalysisService {
    JournalAnalysisResult analyzeAndSaveJournal(JournalAnalysisRequest newJournal);
    String getReflectionOnRecentJournals(String userId, int limit);
}
