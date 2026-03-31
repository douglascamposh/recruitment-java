import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { CandidateProfile } from '@/types';

interface CandidateDetailModalProps {
  candidateId: string;
  onClose: () => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidateId, onClose }) => {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const response = await api.get(`/api/v1/candidates/${candidateId}`);
        setCandidate(response.data);
      } catch (error) {
        toast.error('Error al cargar los detalles del candidato');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateDetails();
  }, [candidateId, onClose]);

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando perfil completo...</p>
      </div>
    </div>
  );

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col animate-fadeIn">
        
        {/* Header Fijo */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{candidate.candidateName}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {candidate.location}</span>
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {candidate.email}</span>
              <span className="flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-400" /> {candidate.phone}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Summary */}
          {candidate.summary && (
            <div className="mb-8 bg-blue-50 p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Resumen Profesional</h3>
              <p className="text-gray-700 leading-relaxed text-sm">{candidate.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna Izquierda: Experiencia y Educación (Más ancha) */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Experiencia */}
              {candidate.workExperience && candidate.workExperience.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Experiencia Laboral
                  </h3>
                  <div className="space-y-6">
                    {candidate.workExperience.map((exp, index) => (
                      <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                        <h4 className="text-lg font-bold text-gray-800">{exp.role}</h4>
                        <p className="text-blue-600 font-medium text-sm">{exp.company} <span className="text-gray-400 font-normal ml-2">| {exp.duration}</span></p>
                        <p className="mt-2 text-gray-600 text-sm leading-relaxed">{exp.jobDescription}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Educación */}
              {candidate.education && candidate.education.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" /> Educación
                  </h3>
                  <div className="space-y-4">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                        <p className="text-gray-600 text-sm">{edu.institution} • {edu.durationOrYear}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Columna Derecha: Skills, Idiomas, Certificaciones */}
            <div className="space-y-8">
              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Idiomas */}
              {candidate.languages && candidate.languages.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" /> Idiomas
                  </h3>
                  <ul className="space-y-2">
                    {candidate.languages.map((lang, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{lang.language}</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">{lang.proficiency}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Certificaciones */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                    <Award className="w-4 h-4 mr-2 text-blue-600" /> Certificaciones
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {candidate.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
