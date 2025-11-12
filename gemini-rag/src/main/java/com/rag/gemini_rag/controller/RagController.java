package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.service.IPdfService;
import com.rag.gemini_rag.service.IRagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final IPdfService indexService;
    private final IRagService ragService;

    public RagController(IPdfService indexService, IRagService ragService) {
        this.indexService = indexService;
        this.ragService = ragService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPdf(@RequestParam("file") MultipartFile file) throws IOException {
        File temp = File.createTempFile("pdf-upload-", ".pdf");
        String path = temp.getPath();
        System.out.println("pdf subido" + path);
        file.transferTo(temp);
        indexService.indexPdf(temp);
        return ResponseEntity.ok("PDF procesado e indexado.");
    }

    @GetMapping("/ask")
    public ResponseEntity<String> ask(@RequestParam("q") String question) {
        String answer = ragService.ask(question);

        return ResponseEntity.ok(answer);
    }
}
