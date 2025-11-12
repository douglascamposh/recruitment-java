package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.service.IPdfService;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingOptionsBuilder;
import org.springframework.ai.embedding.TokenCountBatchingStrategy;
import org.springframework.ai.reader.pdf.ParagraphPdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class PdfServiceImpl implements IPdfService {

    private final EmbeddingModel embeddingModel;
    private final VectorStore vectorStore;

    public PdfServiceImpl(EmbeddingModel embeddingModel, VectorStore vectorStore) {
        this.embeddingModel = embeddingModel;
        this.vectorStore = vectorStore;
    }


    @Override
    public void indexPdf(File pdfFile) {
        try {
            String classpathPath = "tmp/" + pdfFile.getName();
            File targetFile = new File("target/classes/" + classpathPath);
            targetFile.getParentFile().mkdirs();
            Files.copy(pdfFile.toPath(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            // Leer texto por párrafos
            var reader = new ParagraphPdfDocumentReader(classpathPath);
            List<Document> docs = reader.get();

            // Dividir en chunks controlados con TokenTextSplitter
            TokenTextSplitter splitter = new TokenTextSplitter(
                    256,  // chunkSize: tamaño máximo del fragmento
                    100,  // minChunkSizeChars: mínimo de caracteres por chunk
                    20,   // minChunkLengthToEmbed: mínimo de longitud para generar embedding
                    1000, // maxNumChunks: máximo de chunks que generará
                    false // keepSeparator: si se mantienen separadores como "\n"
            );
            List<Document> splitDocs = splitter.split(docs);

            TokenCountBatchingStrategy batchingStrategy = new TokenCountBatchingStrategy();

            List<float[]> embeddings = embeddingModel.embed(
                    splitDocs,
                    EmbeddingOptionsBuilder.builder().build(),
                    batchingStrategy
            );

            // Luego añade documentos con embeddings ya asignados:
            vectorStore.add(splitDocs);

        } catch (IOException e) {
            throw new RuntimeException("Error procesando el PDF", e);
        }
    }

}
