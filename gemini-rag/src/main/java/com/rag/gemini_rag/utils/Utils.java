package com.rag.gemini_rag.utils;

public class Utils {

    /**
     * Elimina delimitadores como ```json ... ``` o ``` del inicio y fin.
     * También recorta espacios innecesarios.
     */
    public static String cleanRawJson(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "";
        }

        // Limpieza común: eliminar bloques Markdown como ```json ... ```
        if (rawResponse.startsWith("```")) {
            rawResponse = rawResponse
                    .replaceAll("(?s)```json", "")
                    .replaceAll("(?s)```", "")
                    .trim();
        }

        return rawResponse.trim();
    }
    public static String cleanText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }
        String cleanedText = rawText.replaceAll("\\s+", " ").trim();
        return cleanedText;
    }
}
