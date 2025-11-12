package com.rag.gemini_rag.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.repository.CandidateProfileRepository;
import com.rag.gemini_rag.service.ICandidateService;
import com.rag.gemini_rag.service.IDocumentReaderService;
import com.rag.gemini_rag.utils.Utils;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class CandidateServiceImpl implements ICandidateService {

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

    @Override
    public CandidateProfile ingestAndProcessCv(MultipartFile cvFile) throws IOException {
        // 1. Extraer y limpiar el texto del archivo
        String cvText = documentReaderService.extractTextFromFile(cvFile);

        // 2. Usar el LLM para extraer información estructurada
        String jsonResponse = extractStructuredDataFromCv(cvText);
        jsonResponse = Utils.cleanRawJson(jsonResponse);
        CandidateProfile profile = objectMapper.readValue(jsonResponse, CandidateProfile.class);
        // Enriquecer el perfil con el nombre del archivo original
        CandidateProfile profileToSave = new CandidateProfile(
                null, // ID será generado por Mongo
                cvFile.getOriginalFilename(),
                profile.candidateName(),
                profile.summary(),
                profile.skills(),
                profile.workExperience(),
                profile.education()
        );

//         3. Guardar el perfil estructurado en MongoDB
        CandidateProfile savedProfile = candidateRepository.save(profileToSave);

        // 4. Crear un documento para el Vector Store y añadirlo
        // El documento vectorial solo necesita el texto completo para la búsqueda de similitud.
        // La metadata es clave para enlazarlo con el perfil en MongoDB.
        Document vectorDocument = new Document(cvText, Map.of("profileId", savedProfile.id()));
        vectorStore.add(List.of(vectorDocument));

        return savedProfile;
    }

//    private String extractStructuredDataFromCv(String cvText) {
//        String systemMessage = """
//            Eres un asistente experto en Recursos Humanos. Tu tarea es analizar el texto de un Curriculum Vitae (CV)
//            y extraer la información clave en un formato JSON estricto. El JSON debe tener la siguiente estructura:
//            {
//              "candidateName": "Nombre completo del candidato",
//              "summary": "Un resumen profesional de 2 o 3 líneas sobre el candidato.",
//              "skills": ["Habilidad 1", "Habilidad 2", "Habilidad N"],
//              "workExperience": [
//                {
//                  "role": "Cargo desempeñado",
//                  "company": "Nombre de la empresa",
//                  "duration": "Periodo de tiempo (ej. 'Ene 2020 - Dic 2022')"
//                }
//              ],
//              "education": "El título más relevante y la institución"
//            }
//            No incluyas ninguna explicación o texto adicional fuera del JSON.
//            """;
//        var systemPrompt = new SystemPromptTemplate(systemMessage);
//
//        var userPrompt = new UserPromptTemplate("Analiza el siguiente texto del CV y extrae la información:\n\n {cvText}");
//        var prompt = new Prompt(List.of(systemPrompt.createMessage(), userPrompt.createMessage(Map.of("cvText", cvText))));
//
//        return chatModel.call(prompt).getResult().getOutput().getContent();
//    }
    private String extractStructuredDataFromCv(String cvText) {
        String systemMessageText = """
            Eres un asistente experto en Recursos Humanos.
            Tu tarea es analizar el texto de un Curriculum Vitae (CV) y devolver SOLO un objeto JSON válido y estricto.
            
            Reglas estrictas:
            - Devuelve ÚNICAMENTE un JSON válido.
            - NO uses comillas invertidas (```) ni bloques de markdown.
            - NO incluyas explicaciones, comentarios, ni texto adicional fuera del JSON.
            - Respeta la siguiente estructura exacta:
            
            {
              "candidateName": "Nombre completo del candidato",
              "summary": "Un resumen profesional de 2 o 3 líneas sobre el candidato.",
              "skills": ["Habilidad 1", "Habilidad 2", "Habilidad N"],
              "workExperience": [
                {
                  "role": "Cargo desempeñado",
                  "company": "Nombre de la empresa",
                  "duration": "Periodo de tiempo (ej. 'Ene 2020 - Dic 2022')"
                }
              ],
              "education": "El título más relevante y la institución"
            }
            """;

        // 1. Crea el mensaje del sistema
        Message systemMessage = new SystemMessage(systemMessageText);

        // 2. Crea el mensaje del usuario con el texto del CV
        String userMessageText = "Analiza el siguiente texto del CV y extrae la información:\n\n" + cvText;
        Message userMessage = new UserMessage(userMessageText);

        // 3. Construye el Prompt con la lista de mensajes
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        // El resto de la llamada es igual y funciona correctamente
        return chatModel.call(prompt).getResult().getOutput().getText();
    }
}
