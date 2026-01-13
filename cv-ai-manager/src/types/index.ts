// src/types/index.ts

// Corresponde al record LinkProfile en Java
export interface LinkProfile {
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

// Corresponde al record Language en Java
export interface Language {
  language: string;
  proficiency: string;
}

// Corresponde al record Education en Java
export interface Education {
  degree: string;
  institution: string;
  durationOrYear: string;
}

// Corresponde al record Experience en Java
export interface Experience {
  role: string;
  company: string;
  duration: string;
  jobDescription: string;
}

// Corresponde al record CandidateProfile en Java
export interface CandidateProfile {
  id?: string;
  originalFileName?: string;
  candidateName: string;
  summary?: string;
  email: string;
  phone?: string;
  sex?: string;
  nationality?: string;
  location?: string;
  skills: string[];
  education: Education[];
  workExperience: Experience[];
  languages: Language[];
  certifications: string[];
  links?: LinkProfile;
}

// Corresponde al record ImprovementCandidateRequest que devuelve el backend
export interface ImprovementCandidateResponse {
  profile: CandidateProfile;
  improvedText: string;
}

// Tipo para el endpoint /recruitment/match, ajustado al nuevo CandidateProfile
export interface CandidateMatch {
  candidate: CandidateProfile;
  score: number;
  matchingSkills: string[];
}
