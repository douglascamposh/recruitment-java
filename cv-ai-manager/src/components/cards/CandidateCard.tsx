import React from 'react';
import { Briefcase, MapPin } from 'lucide-react';
import { CandidateMatch } from '@/types';

interface CandidateCardProps {
  match: CandidateMatch;
  onClick: (id: string) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ match, onClick }) => {
  // Extraemos la experiencia más reciente para darle contexto rápido al reclutador
  const latestExp = match.profile.workExperience?.[0];
  const isHighMatch = match.similarityScore >= 0.8;

  return (
    <div 
      onClick={() => onClick(match.profile.id)}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      {/* Barra superior de acento para los top matches (> 80%) */}
      {isHighMatch && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="pr-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {match.profile.candidateName}
          </h3>
          {/* Rol actual destacado */}
          {latestExp ? (
            <p className="text-sm font-semibold text-gray-700 mt-1 flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" />
              <span className="line-clamp-1">{latestExp.role} en {latestExp.company}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-500 mt-1">Perfil Profesional</p>
          )}
        </div>
        
        {/* Score Badge Modernizado */}
        <div className="flex flex-col items-end shrink-0 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <span className="text-xl font-extrabold text-blue-700">
            {(match.similarityScore * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">Match</span>
        </div>
      </div>
      
      {/* Ubicación rápida */}
      {match.profile.location && (
        <p className="text-xs text-gray-500 flex items-center mb-3">
          <MapPin className="w-3 h-3 mr-1 shrink-0" /> 
          <span className="line-clamp-1">{match.profile.location}</span>
        </p>
      )}
      
      {/* Summary reducido para no abrumar visualmente */}
      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow italic">
        "{match.profile.summary}"
      </p>
      
      {/* Skills con mejor contraste */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-gray-100">
        {match.profile.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors text-[11px] font-medium px-2 py-1 rounded-md">
            {skill}
          </span>
        ))}
        {match.profile.skills.length > 4 && (
          <span className="bg-gray-50 text-gray-400 border border-transparent text-[11px] font-medium px-2 py-1 rounded-md">
            +{match.profile.skills.length - 4}
          </span>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;