package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VideoScript;

public interface IVideoScriptService {
    VideoScript generate(AnalyzedPromptContext context);
}
