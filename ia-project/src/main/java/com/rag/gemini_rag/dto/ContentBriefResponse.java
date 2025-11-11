package com.rag.gemini_rag.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ContentBriefResponse(
        String postBody,
        String caption,
        List<String> hashtags,
        VisualConcept visualConcept,
        VideoScript videoScript,
        Reasoning reasoning
) {
    @Builder
    public ContentBriefResponse {}
}
