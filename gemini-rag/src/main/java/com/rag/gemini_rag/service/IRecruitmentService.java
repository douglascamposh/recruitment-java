package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.CandidateMatch;

import java.util.List;

public interface IRecruitmentService {
    List<CandidateMatch> findBestCandidatesForJob(String jobDescription, int topK);
}
