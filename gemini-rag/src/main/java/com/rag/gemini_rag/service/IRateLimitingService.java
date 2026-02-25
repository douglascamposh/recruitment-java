package com.rag.gemini_rag.service;

public interface IRateLimitingService {
    boolean allowRequest(String ip);
}
