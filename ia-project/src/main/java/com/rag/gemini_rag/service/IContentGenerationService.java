package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.TextualContent;

public interface IContentGenerationService {
    TextualContent generate(AnalyzedPromptContext context);
}
