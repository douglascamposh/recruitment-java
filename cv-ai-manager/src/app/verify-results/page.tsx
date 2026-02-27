// src/app/verify-results/page.tsx
"use client";

import React, { useState } from 'react';
import EditableProfileForm from '@/components/forms/EditableProfileForm';
import { CandidateProfile } from '@/types';

// Mock data similar to what the API would return
const mockProfile: CandidateProfile = {
    candidateName: "Douglas Adams",
    email: "douglas@example.com",
    summary: "Desarrollador Full Stack con gran experiencia...",
    skills: ["Java", "Spring Boot", "Next.js"],
    workExperience: [{ role: "Senior Developer", company: "Tech Inc.", duration: "2020-Present", jobDescription: "Liderando proyectos..." }],
    education: [{ degree: "Ingeniería de Software", institution: "Tech University", durationOrYear: "2016" }],
    languages: [{ language: "Inglés", proficiency: "Nativo" }],
    certifications: [],
    links: { linkedIn: "..." }
};

const mockImprovedText = `
**Douglas Adams**
douglas@example.com | +123456789 | Madrid, España

**Resumen Profesional**
Desarrollador Full Stack con gran experiencia en la creación de aplicaciones web robustas y escalables. Apasionado por la tecnología y el código limpio.

**Habilidades Técnicas**
- **Lenguajes:** Java, TypeScript, JavaScript
- **Frameworks:** Spring Boot, Next.js, React
- **Bases de Datos:** PostgreSQL, MongoDB
`;

const ResultsVerificationPage = () => {
    const [profile, setProfile] = useState<CandidateProfile | null>(mockProfile);
    const [improvedText] = useState<string>(mockImprovedText);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Página de Verificación de Resultados</h1>
            <div className="space-y-6">
              {/* Vista del Texto Mejorado */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Texto del CV Mejorado</h3>
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md text-sm">
                  {improvedText}
                </pre>
              </div>

              {/* Formulario de Edición */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Edita tu Perfil Mejorado</h3>
                <EditableProfileForm profile={profile!} setProfile={setProfile} />
              </div>
            </div>
        </div>
    );
};

export default ResultsVerificationPage;
