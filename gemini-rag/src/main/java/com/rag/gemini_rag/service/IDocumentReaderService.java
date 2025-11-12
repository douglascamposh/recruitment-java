package com.rag.gemini_rag.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IDocumentReaderService {
    String extractTextFromFile(MultipartFile file) throws IOException;
}
