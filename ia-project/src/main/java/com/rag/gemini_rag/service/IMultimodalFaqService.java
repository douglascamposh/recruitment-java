package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.FaqRequest;
import com.rag.gemini_rag.dto.FaqResponse;

import java.net.MalformedURLException;

public interface IMultimodalFaqService {
    FaqResponse generateFaqsFromImage(FaqRequest request) throws MalformedURLException;
}