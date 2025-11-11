package com.rag.gemini_rag.dto;

import com.rag.gemini_rag.enums.PostType;
import lombok.Builder;

import java.util.List;

public record AnalyzedPromptContext(
        PostType identifiedPostType,
        String identifiedTone,
        List<String> keyFacts,
        String analysisJustification,
        List<String> performanceInsights,
        List<String> realTimeTrends

) {
    @Builder
    public AnalyzedPromptContext {}
}
