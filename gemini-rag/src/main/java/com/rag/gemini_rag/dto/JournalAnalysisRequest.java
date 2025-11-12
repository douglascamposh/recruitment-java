package com.rag.gemini_rag.dto;

import java.util.List;

public record JournalAnalysisRequest (
        String userId,
        String title,
        String body,
        List<String> moods,
        List<String> withTags,
        List<String> whereTags,
        List<String> doingTags
){
}
