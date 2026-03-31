package com.rag.gemini_rag.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import com.rag.gemini_rag.exception.ResourceNotFoundException;
import com.rag.gemini_rag.repository.CandidateProfileRepository;
import com.rag.gemini_rag.service.ICandidateService;
import com.rag.gemini_rag.service.IDocumentReaderService;
import com.rag.gemini_rag.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.rag.gemini_rag.security.services.UserDetailsImpl;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CandidateServiceImpl implements ICandidateService {

    private static final Logger log = LoggerFactory.getLogger(CandidateServiceImpl.class);
    private final IDocumentReaderService documentReaderService;
    private final ChatModel chatModel;
    private final VectorStore vectorStore;
    private final CandidateProfileRepository candidateRepository;
    private final ObjectMapper objectMapper;

    public CandidateServiceImpl(IDocumentReaderService documentReaderService, ChatModel chatModel, VectorStore vectorStore, CandidateProfileRepository candidateRepository, ObjectMapper objectMapper) {
        this.documentReaderService = documentReaderService;
        this.chatModel = chatModel;
        this.vectorStore = vectorStore;
        this.candidateRepository = candidateRepository;
        this.objectMapper = objectMapper;
    }
        // la app se podria llamar networking
    //solo guarda el csv tal cual
    @Override
    public CandidateProfile ingestAndProcessCv(MultipartFile cvFile) throws IOException {
        // 1. Extraer y limpiar el texto del archivo
        String cvText = documentReaderService.extractTextFromFile(cvFile);

        // 2. Usar el LLM para extraer información estructurada
        String jsonResponse = extractStructuredDataFromCv(cvText);
        jsonResponse = Utils.cleanRawJson(jsonResponse);

        CandidateProfile profile = objectMapper.readValue(jsonResponse, CandidateProfile.class);
        
        String userId = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            userId = userDetails.getId();
        }

        CandidateProfile profileToSave = new CandidateProfile(
                null,
                cvFile.getOriginalFilename(),
                profile.candidateName(),
                profile.summary(),
                profile.email(),
                profile.phone(),
                profile.sex(),
                profile.nationality(),
                profile.location(),
                userId,
                profile.skills(),
                profile.education(),
                profile.workExperience(),
                profile.languages(),
                profile.certifications(),
                profile.links()
        );

        // 3. Guardar el perfil estructurado en MongoDB
        CandidateProfile savedProfile = candidateRepository.save(profileToSave);

        // 4. Crear un documento para el Vector Store y añadirlo
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("profileId", savedProfile.id());
        if (userId != null) {
            metadata.put("userId", userId);
        }
        Document vectorDocument = new Document(cvText, metadata);
        vectorStore.add(List.of(vectorDocument));

        return savedProfile;
    }
    //Recibe un dto con la informacion del CV mejorado y lo guarda
    public CandidateProfile saveImprovedProfile(ImprovementCandidateResponse improvementCandidate) {
//        if (improvementCandidate.profile() == null || improvementCandidate.improvedText() == null) {
//            throw new ErrorResponseException(HttpStatus.BAD_REQUEST, "profile or improvedtext is required"); //deberia ser badrequest o deberia validar los datos
//        }
        CandidateProfile savedProfile = candidateRepository.save(improvementCandidate.profile());

        Document vectorDocument = new Document(
                improvementCandidate.improvedText(),
                Map.of("profileId", savedProfile.id())
        );

        vectorStore.add(List.of(vectorDocument));
        return savedProfile;
    }

    @Override
    public Page<CandidateProfile> getCandidatesByUserId(String userId, Pageable pageable) {
        return candidateRepository.findByUserId(userId, pageable);
    }

    @Override
    public CandidateProfile getCandidateById(String id) {
        Optional<CandidateProfile> candidate = candidateRepository.findById(id);
        return candidate.orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + id));
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
                - Use `null` for missing object fields (like 'links') or its sub-fields.
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
