package com.rag.gemini_rag.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.UserMessageAnalysisResult;

public class AiJsonParser {

    private static final ObjectMapper mapper = new ObjectMapper();

//    public static UserMessageAnalysisResult parse(String rawJson) {
//        try {
//            JsonNode node = mapper.readTree(Utils.cleanRawJson(rawJson));
//            return new UserMessageAnalysisResult(
//                    node.get("category").asText(),
//                    node.get("sentiment").asText(),
//                    node.get("isSpammer").asBoolean()
//            );
//        } catch (Exception e) {
//            throw new RuntimeException("Error parsing AI response: " + rawJson, e);
//        }
//    }
    public static UserMessageAnalysisResult parse(String rawJson) {
        return parse(rawJson, UserMessageAnalysisResult.class);
    }
    public static <T> T parse(String rawJson, Class<T> valueType) {
        try {
            return mapper.readValue(Utils.cleanRawJson(rawJson), valueType);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing AI JSON response into " + valueType.getSimpleName() + ": " + rawJson, e);
        }
    }
}
