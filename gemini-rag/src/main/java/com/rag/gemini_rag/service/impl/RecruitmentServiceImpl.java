package com.rag.gemini_rag.service.impl;

import com.rag.gemini_rag.dto.CandidateMatch;
import com.rag.gemini_rag.repository.CandidateProfileRepository;
import com.rag.gemini_rag.service.IRecruitmentService;
import com.rag.gemini_rag.utils.VectorStoreHelper;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RecruitmentServiceImpl implements IRecruitmentService {

    private final VectorStore vectorStore;
    private final CandidateProfileRepository candidateRepository;
    private final VectorStoreHelper vectorHelper;

    public RecruitmentServiceImpl(VectorStore vectorStore, CandidateProfileRepository candidateRepository, VectorStoreHelper vectorHelper) {
        this.vectorStore = vectorStore;
        this.candidateRepository = candidateRepository;
        this.vectorHelper = vectorHelper;
    }

    @Override
    public List<CandidateMatch> findBestCandidatesForJob(String jobDescription, int topK) {
        // 1. Buscar en el Vector Store los CVs más similares a la descripción del trabajo
//        SearchRequest request = SearchRequest.query(jobDescription).withTopK(topK);
//        List<Document> similarDocuments = vectorStore.similaritySearch(request);
        List<Document> similarDocuments = vectorHelper.searchSimilarSpams(jobDescription);

        // 2. Para cada documento encontrado, recuperar el perfil completo desde MongoDB
        return similarDocuments.stream()
                .map(doc -> {
                    String profileId = (String) doc.getMetadata().get("profileId");
                    if (profileId == null) {
                        System.out.println("Documento con id no tiene profileId en metadata");
                        System.out.println(doc.getId());
                        // Ignorar documentos sin profileId
                        return null;
                    }
                    // La distancia puede usarse como score de similitud. 0 es el más similar.
                    Float similarity = (doc.getMetadata().get("distance") != null) ? (1 - (Float) doc.getMetadata().get("distance")) : null;

                    return candidateRepository.findById(profileId)
                            .map(profile -> new CandidateMatch(profile, similarity))
                            .orElse(null); // O manejar el caso en que el perfil no se encuentre
                })
                .filter(match -> match != null) // Filtrar nulos si algún perfil fue borrado
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
