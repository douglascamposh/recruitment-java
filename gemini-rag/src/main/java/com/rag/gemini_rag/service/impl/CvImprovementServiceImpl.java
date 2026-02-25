package com.rag.gemini_rag.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.CompanyInsightsResponse;
import com.rag.gemini_rag.dto.CourseRecommendation;
import com.rag.gemini_rag.dto.Experience;
import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import com.rag.gemini_rag.dto.InterviewPrep;
import com.rag.gemini_rag.service.ICvImprovementService;
import com.rag.gemini_rag.service.IDocumentReaderService;
import com.rag.gemini_rag.utils.Utils;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.ai.chat.messages.Message;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CvImprovementServiceImpl implements ICvImprovementService {

    private final IDocumentReaderService documentReaderService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;
    private static final List<String> IMPLICIT_SKILLS = List.of(
            "git", "github", "clean code", "testing", "agile", "scrum",
            "manual testing", "unit testing", "rest api", "solid"
    );

    public CvImprovementServiceImpl(IDocumentReaderService documentReaderService, ChatModel chatModel, ObjectMapper objectMapper) {
        this.documentReaderService = documentReaderService;
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    @Override
    public ImprovementCandidateResponse getImprovedCvProfile(
            MultipartFile cvFile,
            String targetJobDescription,
            String companyName) throws IOException {

        // 1. Extraer texto base
        String originalCvText = documentReaderService.extractTextFromFile(cvFile);

        // 2. Orquestación paso a paso
        String improvedCvText = improveCvContent(originalCvText, targetJobDescription);
        CandidateProfile profile = extractStructuredProfile(improvedCvText);

        // 3. Generar preparación para la entrevista (Cursos + Empresa)
        InterviewPrep interviewPrep = generateInterviewPrep(profile, targetJobDescription, companyName);

        return new ImprovementCandidateResponse(profile, improvedCvText, interviewPrep);
    }

    private String improveCvContent(String originalCvText, String jobDescription) {
        String systemPrompt = """
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

        String userPrompt = "Original CV:\n---\n" + originalCvText + "\n---";
        if (jobDescription != null && !jobDescription.isBlank()) {
            userPrompt += "\n\nTarget job description:\n---\n" + jobDescription + "\n---";
        }

        return chatModel.call(new Prompt(List.of(new SystemMessage(systemPrompt), new UserMessage(userPrompt))))
                .getResult().getOutput().getText().trim();
    }

    private String extractStructuredDataFromCv(String cvText) {
        String systemMessageText = """
        You are an expert HR data extraction bot.
        Your role task is to analyze the text of a Curriculum Vitae (CV) and output ONLY a single, valid, raw JSON object.

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

        String userMessageText = "Extract the data from the following CV:\n---\n" + cvText + "\n---";
        return callLlmForJson(systemMessageText, userMessageText);
    }

    private CandidateProfile extractStructuredProfile(String cvText) {
        String profileJson = extractStructuredDataFromCv(cvText);
        String cleanedJson = Utils.cleanRawJson(profileJson);
        try {
            return objectMapper.readValue(Utils.cleanRawJson(cleanedJson), CandidateProfile.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing profile");
        }
    }

    public InterviewPrep generateInterviewPrep(CandidateProfile profile, String jd, String company) {
        String seniority = estimateSeniority(profile);
        // 1. Extraer skills del JD
        List<String> jdSkills = (jd == null || jd.isBlank()) ? List.of() : extractSkillsFromJd(jd);

        // 2. Normalizar y detectar faltantes
        List<String> missingSkills = findMissingSkills(profile, jdSkills);
        if ("Senior".equals(seniority) || "Lead".equals(seniority)) {
            missingSkills.removeIf(skill -> IMPLICIT_SKILLS.contains(skill.toLowerCase()));
        }

        // 3. Detectar version mismatch (ej: Spring Boot 2 vs 4)
        List<String> versionMismatches = detectVersionMismatches(profile, jdSkills);
        for (String vm : versionMismatches) {
            if (!missingSkills.contains(vm)) missingSkills.add(vm);
        }

        // 4. Calcular años de experiencia por skill requerido
        Map<String, Double> yearsBySkill = new HashMap<>();
        for (String skill : jdSkills) {
            yearsBySkill.put(skill, estimateYearsOfExperienceForSkill(profile, skill));
        }

        // 6. Obtener Insights de la Empresa (Con Búsqueda Web si hay nombre de empresa)
        CompanyInsightsResponse insightsResponse = new CompanyInsightsResponse(false, "", List.of(), List.of());
        if (company != null && !company.isBlank()) {
            String json = fetchCompanyInsightsWithSearch(profile, jd, company, missingSkills);
            insightsResponse = parseSafe(json, CompanyInsightsResponse.class, insightsResponse);
        } else {
            String json = generateGenericCompanyInsights(profile, jd, missingSkills);
            insightsResponse = parseSafe(json, CompanyInsightsResponse.class, insightsResponse);
        }

        // 7. Generar Cursos solo si hay brechas (gaps)
        List<CourseRecommendation> courses = new ArrayList<>();
//        if (!missingSkills.isEmpty()) {
//            String coursesJson = fetchCourseRecommendations(profile, missingSkills, yearsBySkill, seniority);
//            try {
//                // Parseamos como lista de mapas y mapeamos al Record
//                List<Map<String, String>> raw = objectMapper.readValue(cleanRawJson(coursesJson), new TypeReference<>() {});
//                courses = raw.stream()
//                        .map(m -> new CourseRecommendation(
//                                m.get("skill"), m.get("title"), m.get("platform"),
//                                m.get("url"), m.get("reason")))
//                        .toList();
//            } catch (Exception e) {
//                // Silenciamos el error para no romper todo el proceso si falla el formato de los cursos
//            }
//        }

        // 8. Calcular el Readiness Text
        String readiness = estimateReadinessText(profile, seniority, missingSkills, yearsBySkill);

        // 9. Retornar DTO Final
        return new InterviewPrep(
                seniority,
                readiness,
                insightsResponse.companyInsights() != null ? insightsResponse.companyInsights() : "",
                insightsResponse.possibleQuestions() != null ? insightsResponse.possibleQuestions() : List.of(),
                courses,
                insightsResponse.companyInfoFound()
        );
    }

    private String callLlmForJson(String system, String user) {
        return chatModel.call(new Prompt(List.of(new SystemMessage(system), new UserMessage(user))))
                .getResult().getOutput().getText();
    }

    private String callLlmForJsonWithSearch(String systemPrompt, String userPrompt) {
        VertexAiGeminiChatOptions options = VertexAiGeminiChatOptions.builder()
                .temperature(0.2)
                .googleSearchRetrieval(true)
                .build();

        Prompt prompt = new Prompt(List.of(
                new SystemMessage(systemPrompt),
                new UserMessage(userPrompt)
        ), options);

        return chatModel.call(prompt).getResult().getOutput().getText();
    }

    private List<String> extractSkillsFromJd(String jd) {
        String systemPrompt = """
            You are a JSON extractor. Return ONLY a JSON array of technical skills/keywords required in this Job Description.
            - Output must be a single valid JSON array of strings, e.g. ["java", "spring boot 4", "solr"]
            - Normalize versions (e.g., "Spring Boot 4" -> "spring boot 4")
            """;
        try {
            String json = callLlmForJson(systemPrompt, jd);
            return objectMapper.readValue(cleanRawJson(json), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return naiveSkillFallback(jd);
        }
    }

    private String fetchCompanyInsightsWithSearch(CandidateProfile profile, String jd, String company, List<String> missingSkills) {
        String systemPrompt = """
            You are an expert technical recruiter. You have Google Search enabled.
            TASK: Look for recent info on interview processes, culture, and tech stack for the given company.
            CRUCIAL: DO NOT HALLUCINATE. If you cannot find reliable public info, set companyInfoFound=false.
            OUTPUT ONLY RAW JSON:
            { "companyInfoFound": boolean, "companyInsights": "short text", "possibleQuestions": ["q1", "q2"], "tips": ["t1","t2"] }
            """;
        String userPrompt = String.format("Company: %s\nJD: %s\nMissingSkills: %s", company, jd != null ? jd : "", missingSkills);
        return callLlmForJsonWithSearch(systemPrompt, userPrompt);
    }

    private String generateGenericCompanyInsights(CandidateProfile profile, String jd, List<String> missingSkills) {
        String systemPrompt = """
            You are a technical recruiter. Produce generic industry-standard interview insights based on the JD.
            OUTPUT ONLY RAW JSON:
            { "companyInfoFound": false, "companyInsights": "text", "possibleQuestions": ["..."], "tips": ["..."] }
            """;
        return callLlmForJson(systemPrompt, "JD: " + jd);
    }

    private String fetchCourseRecommendations(CandidateProfile profile, List<String> missingSkills, Map<String, Double> yearsBySkill, String seniority) {

        String systemPrompt = String.format("""
        You are an elite Tech Lead and Executive Career Coach.
        Your task is to recommend 3 HIGH-LEVEL courses for a candidate who is at a %s level.
        STRICT RULES FOR SENIOR/LEAD PROFILES:
        1. **No Basics**: If the candidate is Senior or Lead, DO NOT recommend introductory courses on Git, Clean Code, Testing, or Agile. Assume they master these.
        2. **Focus on Design & Scale**: Instead of 'Testing', recommend 'Testing Strategies for Microservices' or 'Chaos Engineering'. Instead of 'Clean Code', recommend 'Software Architecture Patterns' or 'Refactoring Legacy Systems at Scale'.
        3. **Business & Leadership**: For Lead roles, include courses on 'Technical Strategy', 'Engineering Management', or 'System Design Interview'.
        4. **Coursera/Udemy**: Prefer specialized professional certificates (e.g., Google, IBM, AWS) or deep-dive courses from reputable authors.
        5. **Context is King**: Best Egg is a Fintech platform being acquired by Barclays. Focus on Security, Scalability, and Financial Systems reliability.

        OUTPUT JSON ARRAY ONLY:
        [{ "skill": "string", "title": "string", "platform": "string", "url": "string", "reason": "Explain why this ADVANCED course is relevant for a %s role" }]
        """, seniority, seniority);

        String userPrompt = String.format("""
        Candidate Level: %s
        Years of Experience: %s
        Target Role: Lead Software Engineer (Fintech/Banking)
        Action: Search the web for actual advanced courses addressing these gaps and return their verified URLs.
        Missing Keywords from JD: %s
        """, seniority, yearsBySkill, missingSkills);

        return callLlmForJsonWithSearch(systemPrompt, userPrompt);
    }

    // ----------------------------
    // Algoritmos y Heurísticas
    // ----------------------------

    private List<String> naiveSkillFallback(String text) {
        Set<String> set = new LinkedHashSet<>();
        Pattern p = Pattern.compile("\\b(Java|Spring Boot|Spring|Solr|Elasticsearch|AWS|Docker|Kubernetes|React|Angular|PostgreSQL|MySQL|Node)\\b", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        while (m.find()) set.add(m.group().trim().toLowerCase());
        return new ArrayList<>(set);
    }

    private List<String> findMissingSkills(CandidateProfile profile, List<String> jdSkills) {
        Set<String> candidate = profile.skills() == null ? Set.of() :
                profile.skills().stream().map(this::normalizeSkill).collect(Collectors.toSet());
        List<String> missing = new ArrayList<>();
        for (String s : jdSkills) {
            if (!candidate.contains(normalizeSkill(s))) missing.add(s);
        }
        return missing;
    }

    private List<String> detectVersionMismatches(CandidateProfile profile, List<String> jdSkills) {
        List<String> mismatches = new ArrayList<>();
        Set<String> candidate = profile.skills() == null ? Set.of() :
                profile.skills().stream().map(this::normalizeSkill).collect(Collectors.toSet());

        Pattern versionPattern = Pattern.compile("(.+?)\\s+([0-9]+(?:\\.[0-9]+)*)");
        for (String s : jdSkills) {
            Matcher m = versionPattern.matcher(s.toLowerCase());
            if (m.find()) {
                String base = m.group(1).trim();
                double reqVersion = Double.parseDouble(m.group(2).split("\\.")[0]);

                candidate.stream().filter(cs -> cs.startsWith(base)).findFirst().ifPresent(cand -> {
                    Matcher mc = versionPattern.matcher(cand);
                    if (mc.find() && Double.parseDouble(mc.group(2).split("\\.")[0]) < reqVersion) {
                        mismatches.add(s);
                    }
                });
            }
        }
        return mismatches;
    }

    private String normalizeSkill(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("[^a-z0-9\\. ]", " ").replaceAll("\\s+", " ").trim();
    }

    private String estimateSeniority(CandidateProfile profile) {
        double totalYears = 0.0;
        if (profile.workExperience() != null) {
            for (Experience e : profile.workExperience()) {
                totalYears += parseExperienceYears(e);
            }
        }
        if (totalYears < 2) return "Junior";
        if (totalYears < 5) return "Mid";
        if (totalYears < 10) return "Senior";
        return "Lead";
    }

    private double parseExperienceYears(Experience e) {
        String dur = e.duration(); // Asumo que es un record y accedes así: e.duration()
        if (dur != null && !dur.isBlank()) {
            double y = parseYearsFromDurationString(dur);
            if (y >= 0) return y;
        }
        return 1.0; // Fallback heurístico
    }

    private double parseYearsFromDurationString(String s) {
        if (s == null) return -1;
        s = s.toLowerCase().trim();
        Matcher mYears = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*years?").matcher(s);
        if (mYears.find()) {
            try { return Double.parseDouble(mYears.group(1)); } catch (Exception ignored) {}
        }
        Matcher mRangeShort = Pattern.compile("(\\d{4})\\s*[-–to]+\\s*(\\d{4}|present|now|current)").matcher(s);
        if (mRangeShort.find()) {
            try {
                int a = Integer.parseInt(mRangeShort.group(1));
                String bStr = mRangeShort.group(2);
                int b = (bStr.equals("present") || bStr.equals("now") || bStr.equals("current")) ? LocalDate.now().getYear() : Integer.parseInt(bStr);
                return Math.max(0, b - a);
            } catch (Exception ignored) {}
        }
        return -1;
    }

    private double estimateYearsOfExperienceForSkill(CandidateProfile profile, String skill) {
        double years = 0.0;
        if (profile.workExperience() == null) return 0.0;
        String normalizedSkill = normalizeSkill(skill);
        for (Experience e : profile.workExperience()) {
            String text = (e.role() + " " + e.company() + " " + e.jobDescription()).toLowerCase();
            if (text.contains(normalizedSkill) || text.contains(normalizedSkill.split(" ")[0])) {
                years += parseExperienceYears(e);
            }
        }
        return years;
    }

    private String estimateReadinessText(CandidateProfile profile, String seniority, List<String> missingSkills, Map<String, Double> yearsBySkill) {
        if (missingSkills.isEmpty()) {
            return "The candidate appears well-prepared. Focus on System Design and behavioral interviews according to their level (" + seniority + ").";
        }
        StringJoiner sj = new StringJoiner(" ");
        sj.add("Key skill gaps were detected: " + String.join(", ", missingSkills) + ".");
        for (String ms : missingSkills) {
            Double y = yearsBySkill.getOrDefault(ms, 0.0);
            if (y > 0) {
                sj.add(String.format("The candidate has %.1f years of experience related to '%s', but additional focus may be required.", y, ms));
            }
        }
        sj.add("It is highly recommended to review the suggested courses to bridge these gaps before the technical interview.");
        return sj.toString();
    }

    // ----------------------------
    // Utilidades Internas
    // ----------------------------

    private <T> T parseSafe(String json, Class<T> clazz, T fallback) {
        try {
            return objectMapper.readValue(cleanRawJson(json), clazz);
        } catch (Exception e) {
            return fallback;
        }
    }

    private String cleanRawJson(String raw) {
        if (raw == null) return "";
        raw = raw.trim();
        int start = raw.indexOf('{');
        int arrStart = raw.indexOf('[');
        int s = (start == -1) ? arrStart : (arrStart == -1 ? start : Math.min(start, arrStart));
        if (s != -1) {
            int end = raw.lastIndexOf('}');
            int arrEnd = raw.lastIndexOf(']');
            int e = Math.max(end, arrEnd);
            if (e != -1 && e > s) {
                return raw.substring(s, e + 1);
            }
        }
        return raw;
    }

}
