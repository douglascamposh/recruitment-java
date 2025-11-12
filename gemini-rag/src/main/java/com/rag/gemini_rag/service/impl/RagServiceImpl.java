package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IRagService;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class RagServiceImpl implements IRagService {

    private final VectorStore vectorStore;
    private final ChatModel chatModel;

    public RagServiceImpl(VectorStore vectorStore, ChatModel chatModel) {
        this.vectorStore = vectorStore;
        this.chatModel = chatModel;
    }

    public String ask(String question) {
        var documents = vectorStore.similaritySearch(question);
        var context = documents.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n"));

        var prompt = new Prompt("Context:\n" + context + "\n\nQuestion:\n" + question);

        System.out.println("=== CONTEXTO ===");
        System.out.println(context);

        return chatModel.call(prompt).getResult().getOutput().getText();
    }
}
