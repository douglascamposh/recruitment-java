// src/types/index.ts

export interface CandidateProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate?: string;
  }>;
}

export interface CandidateMatch {
  candidate: CandidateProfile;
  score: number;
  matchingSkills: string[];
}
