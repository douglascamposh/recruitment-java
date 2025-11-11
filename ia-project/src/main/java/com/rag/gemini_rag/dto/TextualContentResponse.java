package com.rag.gemini_rag.dto;

import java.util.List;

public record TextualContentResponse(
        String postBody,
        String caption,
        List<String>hashtags,
        String justification
) { }
