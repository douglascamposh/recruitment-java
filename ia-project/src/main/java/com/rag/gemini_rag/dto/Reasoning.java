package com.rag.gemini_rag.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Reasoning(
        String summary,
        String postTypeSelection,
        String toneAlignment,
        String factualGrounding,
        String visualFormatSelection,
        String visualCreativeJustification,
        String copyJustification
) {
    @Builder
    public Reasoning {}
}
