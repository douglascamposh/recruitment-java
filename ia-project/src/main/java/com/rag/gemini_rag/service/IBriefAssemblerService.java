package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.ContentBriefResponse;
import com.rag.gemini_rag.dto.TextualContent;
import com.rag.gemini_rag.dto.VisualConcept;
import com.rag.gemini_rag.dto.VisualFormatRecommendation;

public interface IBriefAssemblerService {
    ContentBriefResponse assemble(AnalyzedPromptContext context, TextualContent textContent, VisualFormatRecommendation formatRecommendation, Object visualResult);

}
