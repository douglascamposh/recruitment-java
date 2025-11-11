package com.rag.gemini_rag.utils;

public class Utils {

    public static String cleanRawJson(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }

        if (rawResponse.startsWith("```")) {
            rawResponse = rawResponse
                    .replaceAll("(?s)```json", "")
                    .replaceAll("(?s)```", "")
                    .trim();
        }

        return rawResponse.trim();
    }
}
