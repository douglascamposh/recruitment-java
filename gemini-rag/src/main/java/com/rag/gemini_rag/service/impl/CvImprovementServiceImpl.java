package com.rag.gemini_rag.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.ImprovementCandidateRequest;
import com.rag.gemini_rag.service.ICvImprovementService;
import com.rag.gemini_rag.service.IDocumentReaderService;
import com.rag.gemini_rag.utils.Utils;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.ai.chat.messages.Message;

import java.io.IOException;
import java.util.List;

@Service
public class CvImprovementServiceImpl implements ICvImprovementService {

    private final IDocumentReaderService documentReaderService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public CvImprovementServiceImpl(IDocumentReaderService documentReaderService, ChatModel chatModel, ObjectMapper objectMapper) {
        this.documentReaderService = documentReaderService;
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    @Override
    public ImprovementCandidateRequest getImprovedCvProfile(MultipartFile cvFile, String targetJobDescription) throws IOException, JsonProcessingException {

        // 1. Extraer texto del CV original
        String originalCvText = documentReaderService.extractTextFromFile(cvFile);

        String improveSystemPrompt = """
            You are an expert career coach and resume optimization assistant.
            Your task is to rewrite or improve a candidate's CV text to make it more professional,
            readable, and aligned with best HR practices.
            Guidelines:
            - Use concise and powerful language.
            - Emphasize achievements and measurable impact.
            - Keep the structure clear: summary, skills, experience, education.
            - Maintain factual integrity — do not invent details.
            - Output only the improved CV text, no markdown or JSON.
            - If a target job description is provided, tailor the CV.
            - The tone should be confident and professional.
            """;

        String userPrompt = "Here is the original CV:\n---\n" + originalCvText + "\n---";
        if (targetJobDescription != null && !targetJobDescription.isBlank()) {
            userPrompt += "\n\nTarget job description:\n---\n" + targetJobDescription + "\n---";
        }

        Prompt improvePrompt = new Prompt(List.of(new SystemMessage(improveSystemPrompt), new UserMessage(userPrompt)));
        String improvedCvText = chatModel.call(improvePrompt).getResult().getOutput().getText().trim();

        String improvedJson = extractStructuredDataFromCv(improvedCvText);
        String cleanedJson = Utils.cleanRawJson(improvedJson);

        CandidateProfile improvedProfile = objectMapper.readValue(cleanedJson, CandidateProfile.class);
        return new ImprovementCandidateRequest(improvedProfile, improvedCvText);
    }

    private String extractStructuredDataFromCv(String cvText) {
        String systemMessageText = """
        You are an expert HR data extraction bot.
        Your sole task is to analyze the text of a Curriculum Vitae (CV) and output ONLY a single, valid, raw JSON object.

        Strict Rules:
        1.  **JSON Only:** You MUST output *only* the JSON data.
        2.  **No Markdown:** DO NOT use backticks (```json), markdown blocks, or any other formatting.
        3.  **No Explanations:** DO NOT include any preamble, comments, or text outside the JSON structure.
        4.  **Missing Data:**
            - Use `null` for missing string fields (like 'summary', 'phone').
            - Use `[]` (an empty array) for missing list fields (like 'skills', 'education').
            - Use `null` for missing object fields (like 'links').
        5.  **Exact Schema:** You MUST adhere strictly to the following structure:
        
        {
          "candidateName": "Full name of the candidate",
          "email": "joe.doe@gmail.com",
          "phone": "123-456-7890 (or null)",
          "location": "City, Country (or null)",
          "summary": "2-3 line professional summary (or null)",
          "sex": "Male",
          "nationality": "Spain",
          "skills": ["Skill 1", "Skill 2"],
          "links": {
            "linkedIn": "URL to LinkedIn profile (or null)",
            "github": "URL to GitHub profile (or null)",
            "portfolio": "URL to personal portfolio (or null)"
          },
          "workExperience": [
            {
              "role": "Job title",
              "company": "Company name",
              "duration": "Time period (e.g., 'Jan 2020 - Dec 2022')",
              "jobDescription": "Role description"
            }
          ],
          "education": [
            {
              "degree": "Degree obtained (e.g., 'B.S. in Computer Science')",
              "institution": "Name of the institution",
              "durationOrYear": "Time period (e.g., '2018 - 2022')"
            }
          ],
          "languages": [
            {
              "language": "e.g., 'Spanish'",
              "proficiency": "e.g., 'Native' or 'Fluent'"
            }
          ],
          "certifications": ["Certification name 1", "Certification name 2"]
        }
        """;

        Message systemMessage = new SystemMessage(systemMessageText);
        Message userMessage = new UserMessage("Extract the data from the following CV:\n---\n" + cvText + "\n---");
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        return chatModel.call(prompt).getResult().getOutput().getText();
    }
}
