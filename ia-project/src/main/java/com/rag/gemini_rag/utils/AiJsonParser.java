package com.rag.gemini_rag.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.UserMessageAnalysisResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AiJsonParser {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(AiJsonParser.class);

    public static <T> T parse(String jsonText, Class<T> targetClass) {
        String cleanedJson = jsonText.trim().replace("```json", "").replace("```", "").trim();

        try {
            return mapper.readValue(cleanedJson, targetClass);
        } catch (JsonProcessingException e) {
            logger.error("Error parsing AI response: " + jsonText);
            throw new RuntimeException("Error parsing AI response: " + jsonText, e);
        }
    }
}
