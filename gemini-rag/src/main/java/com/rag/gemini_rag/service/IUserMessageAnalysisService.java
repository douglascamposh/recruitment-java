package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.UserMessageAnalysisResult;
import com.rag.gemini_rag.dto.UserMessageRequest;

import java.util.List;

public interface IUserMessageAnalysisService {
    UserMessageAnalysisResult analyze(UserMessageRequest newMessage, List<UserMessageRequest> messageHistory);
    boolean isSuspectedSpammer(String userId);
    List<String> getAllSuspectedSpammers();
}
