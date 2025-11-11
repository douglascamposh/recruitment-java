package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VisualFormatRecommendation;

public interface IVisualFormatService {
    VisualFormatRecommendation recommend(AnalyzedPromptContext context);
}
