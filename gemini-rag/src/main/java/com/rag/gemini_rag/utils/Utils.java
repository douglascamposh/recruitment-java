package com.rag.gemini_rag.utils;

import jakarta.servlet.http.HttpServletRequest;

public class Utils {

    /**
     * Elimina delimitadores como ```json ... ``` o ``` del inicio y fin.
     * También recorta espacios innecesarios.
     */
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
    public static String cleanText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }
        String cleanedText = rawText.replaceAll("\\s+", " ").trim();
        return cleanedText;
    }
    public static String getClientIp(HttpServletRequest request) {
        // Primero, buscamos la "nota adhesiva" que dejan los proxies o Docker
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null || xForwardedForHeader.isEmpty()) {
            // Si no hay nota (ej. probando en localhost), leemos directamente
            return request.getRemoteAddr();
        }
        // Si hay una cadena de proxies (ej. Cloudflare -> AWS -> Docker),
        // la primera IP de la lista, separada por comas, es siempre la del usuario real.
        return xForwardedForHeader.split(",")[0].trim();
    }
}
