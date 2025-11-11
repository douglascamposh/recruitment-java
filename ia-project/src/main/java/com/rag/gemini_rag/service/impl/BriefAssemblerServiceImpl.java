package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.ContentBriefResponse;
import com.rag.gemini_rag.dto.Reasoning;
import com.rag.gemini_rag.dto.TextualContent;
import com.rag.gemini_rag.dto.VideoScript;
import com.rag.gemini_rag.dto.VisualConcept;
import com.rag.gemini_rag.dto.VisualFormatRecommendation;
import com.rag.gemini_rag.service.IBriefAssemblerService;
import org.springframework.stereotype.Service;

@Service
public class BriefAssemblerServiceImpl implements IBriefAssemblerService {

    @Override
    public ContentBriefResponse assemble(AnalyzedPromptContext context,
                                         TextualContent textContent,
                                         VisualFormatRecommendation formatRecommendation,
                                         Object visualResult) {

        VisualConcept finalVisualConcept = null;
        VideoScript finalVideoScript = null;
        String visualCreativeJustification;

        if (visualResult instanceof VisualConcept visualConcept) {
            finalVisualConcept = visualConcept;
            visualCreativeJustification = visualConcept.getVisualJustification();
        } else if (visualResult instanceof VideoScript videoScript) {
            finalVideoScript = videoScript;
            visualCreativeJustification = videoScript.justification();
        } else {
            throw new IllegalArgumentException("Unknown visual result type: " + visualResult.getClass().getName());
        }

        Reasoning reasoning = Reasoning.builder()
                .summary("Content brief strategically generated to meet the objectives of the prompt.")
                .postTypeSelection(context.analysisJustification())
                .toneAlignment("The tone of '%s' was used to align with the brand voice.".formatted(context.identifiedTone()))
                .factualGrounding("The content was based on the following key facts: " + context.keyFacts())
                .visualFormatSelection(formatRecommendation.justification())
                .visualCreativeJustification(visualCreativeJustification)
                .copyJustification(textContent.getContentJustification())
                .build();

        return ContentBriefResponse.builder()
                .postBody(textContent.getPostBody())
                .caption(textContent.getCaption())
                .hashtags(textContent.getHashtags())
                .visualConcept(finalVisualConcept)
                .videoScript(finalVideoScript)
                .reasoning(reasoning)
                .build();
    }
}

