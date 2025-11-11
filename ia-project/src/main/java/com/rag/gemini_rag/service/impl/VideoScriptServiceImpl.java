package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.AnalyzedPromptContext;
import com.rag.gemini_rag.dto.VideoScript;
import com.rag.gemini_rag.service.IVideoScriptService;
import com.rag.gemini_rag.utils.AiJsonParser;
import lombok.Getter;
import lombok.Setter;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoScriptServiceImpl implements IVideoScriptService {

    private final ChatClient chatClient;

    public VideoScriptServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public VideoScript generate(AnalyzedPromptContext context) {
        String systemMessageText = """
            You are a creative director specializing in short-form video content for platforms like Instagram Reels and TikTok.
            Your task is to create a structured video script based on a marketing brief.
            The script must include:
            1.  A "hook" (the first 3 seconds to grab attention).
            2.  A list of 3-5 "scenes", each with a visual description and any on-screen text.
            3.  A final "cta" (call-to-action).
            4.  A "justification" explaining your creative choices.
            
            Respond ONLY with a valid JSON object matching this structure:
            {
              "hook": "...",
              "scenes": [{"description": "...", "onScreenText": "..."}, ...],
              "cta": "...",
              "justification": "..."
            }
        """;

        String userPromptText = """
            Create a video script based on the following brief:
            - Post Type: %s
            - Brand Tone: %s
            - Key Facts to Include: %s
        """.formatted(context.identifiedPostType(), context.identifiedTone(), context.keyFacts());

        Prompt prompt = new Prompt(List.of(new SystemMessage(systemMessageText), new UserMessage(userPromptText)));
        String jsonResponse = chatClient.prompt(prompt).call().content();

        VideoScriptResponse response = AiJsonParser.parse(jsonResponse, VideoScriptResponse.class);

        if (response == null) {
            throw new RuntimeException("Failed to parse video script response from AI.");
        }

        return VideoScript.builder()
                .hook(response.getHook())
                .scenes(response.getScenes())
                .cta(response.getCta())
                .justification(response.getJustification())
                .build();
    }

    @Getter
    @Setter
    private static class VideoScriptResponse {
        private String hook;
        private List<VideoScript.Scene> scenes;
        private String cta;
        private String justification;
    }
}
