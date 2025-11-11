package com.rag.gemini_rag.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record VideoScript(
        String hook,
        List<Scene> scenes,
        String cta,
        String justification
) {
    @Builder
    public record Scene(String description, String onScreenText) {}
}
