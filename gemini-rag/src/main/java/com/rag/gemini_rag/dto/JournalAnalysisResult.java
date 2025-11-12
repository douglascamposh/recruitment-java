package com.rag.gemini_rag.dto;

import java.util.List;

public record JournalAnalysisResult (
        String sentiment,
        List<String> keyThemes,
        String reflection
) { }
