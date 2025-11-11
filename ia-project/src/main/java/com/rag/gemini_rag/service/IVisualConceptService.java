package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VisualConcept;

public interface IVisualConceptService {
    VisualConcept generate(AnalyzedPromptContext context);
}
