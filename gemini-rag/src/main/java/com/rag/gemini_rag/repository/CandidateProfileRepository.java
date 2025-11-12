package com.rag.gemini_rag.repository;

import com.rag.gemini_rag.dto.CandidateProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CandidateProfileRepository extends MongoRepository<CandidateProfile, String> {
}