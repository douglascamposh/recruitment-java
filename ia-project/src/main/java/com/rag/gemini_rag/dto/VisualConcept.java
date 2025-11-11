package com.rag.gemini_rag.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VisualConcept {
    private String conceptDescription;
    private String visualJustification;
}
