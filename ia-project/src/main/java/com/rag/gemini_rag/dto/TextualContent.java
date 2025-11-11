package com.rag.gemini_rag.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TextualContent {
    private String postBody;
    private String caption;
    private List<String> hashtags;
    private String contentJustification;
}
