package com.rag.gemini_rag.repository;

import com.rag.gemini_rag.dto.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CandidateProfileRepository extends MongoRepository<CandidateProfile, String> {
    Page<CandidateProfile> findByUserId(String userId, Pageable pageable);
}