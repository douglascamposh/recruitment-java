package com.rag.gemini_rag.dto;

import com.rag.gemini_rag.enums.PostType;

import java.util.List;

public record AnalysisResponse(
        PostType postType,
        String tone,
        List<String> keyFacts,
        String justification
) { }
