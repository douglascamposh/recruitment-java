package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.ContentBriefResponse;
import com.rag.gemini_rag.dto.TextualContent;
import com.rag.gemini_rag.dto.VisualFormatRecommendation;
import com.rag.gemini_rag.enums.VisualFormat;
import com.rag.gemini_rag.service.IBriefAssemblerService;
import com.rag.gemini_rag.service.IContentGenerationService;
import com.rag.gemini_rag.service.IKnowledgeBaseService;
import com.rag.gemini_rag.service.IMarketingOrchestratorService;
import com.rag.gemini_rag.service.IPromptAnalysisService;
import com.rag.gemini_rag.service.IRealTimeContextService;
import com.rag.gemini_rag.service.IVideoScriptService;
import com.rag.gemini_rag.service.IVisualConceptService;
import com.rag.gemini_rag.service.IVisualFormatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@RequiredArgsConstructor
@Service
public class MarketingOrchestratorServiceImpl implements IMarketingOrchestratorService {
    private final IPromptAnalysisService promptAnalysisService;
    private final IContentGenerationService contentGenerationService;
    private final IVisualConceptService visualConceptService;
    private final IBriefAssemblerService briefAssemblerService;
    private final IVisualFormatService visualFormatService;
    private final IVideoScriptService videoScriptService;
    private final IRealTimeContextService realTimeContextService;
    private final IKnowledgeBaseService knowledgeBaseService;
    private final Executor taskExecutor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

    @Override
    public ContentBriefResponse generateBrief(String rawPrompt) {
        // STEP 1: Enriquecer el contexto con datos externos
        List<String> trends = realTimeContextService.getCurrentTrends();
        List<String> insights = knowledgeBaseService.findRelevantInsights(rawPrompt, 2);

        // STEP 2: Analizar el prompt con el contexto ya enriquecido
        AnalyzedPromptContext context = promptAnalysisService.analyze(rawPrompt, trends, insights);

        // STEP 3: Recomendar formato visual (Característica #8)
        VisualFormatRecommendation formatRecommendation = visualFormatService.recommend(context);

        // STEP 4: Generar contenido de texto y el visual apropiado en PARALELO
        CompletableFuture<TextualContent> textContentFuture = CompletableFuture.supplyAsync(
                () -> contentGenerationService.generate(context), taskExecutor
        );

        CompletableFuture<?> visualFuture;

        if (formatRecommendation.format() == VisualFormat.VIDEO) {
            visualFuture = CompletableFuture.supplyAsync(
                    () -> videoScriptService.generate(context), taskExecutor
            );
        } else {
            visualFuture = CompletableFuture.supplyAsync(
                    () -> visualConceptService.generate(context), taskExecutor
            );
        }

        CompletableFuture.allOf(textContentFuture, visualFuture).join();

        try {
            TextualContent textContent = textContentFuture.get();
            Object visualResult = visualFuture.get();

            // STEP 5: Ensamblar el brief final
            return briefAssemblerService.assemble(context, textContent, formatRecommendation, visualResult);

        } catch (Exception e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error at generate the content on parallel", e);
        }
    }
}
