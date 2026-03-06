import React from 'react';
import { MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { CandidateProfile } from '@/types';

interface CandidateListItemProps {
  profile: CandidateProfile;
  onClick: (id: string) => void;
}

const CandidateListItem: React.FC<CandidateListItemProps> = ({ profile, onClick }) => {
  // Extraemos la experiencia más reciente
  const latestExp = profile.workExperience?.[0];
  
  // Función UX para generar iniciales (ej. "Douglas Campos" -> "DC")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <li 
      onClick={() => onClick(profile.id)}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-blue-50/50 cursor-pointer transition-colors group border-b border-gray-100 last:border-0"
    >
      {/* Sección Izquierda: Avatar, Nombre, Cargo y Ubicación */}
      <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
        {/* Avatar Moderno */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0 mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors shadow-sm border border-blue-200/50">
          {getInitials(profile.candidateName)}
        </div>
        
        <div>
          <p className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">
            {profile.candidateName}
          </p>
          
          {/* Cargo actual (Dato crucial para el reclutador) */}
          {latestExp ? (
            <p className="text-sm font-medium text-blue-600 flex items-center mt-0.5">
              <Briefcase className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span className="line-clamp-1">{latestExp.role}</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-500 mt-0.5">Perfil Profesional</p>
          )}
          
          {/* Ubicación */}
          {profile.location && (
            <p className="text-xs text-gray-500 flex items-center mt-1">
               <MapPin className="w-3 h-3 mr-1 shrink-0" /> 
               <span className="line-clamp-1">{profile.location}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Sección Derecha: Skills y Flecha de Acción */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-1/2">
         <div className="flex flex-wrap gap-1.5 mr-4 justify-start sm:justify-end">
           {profile.skills?.slice(0, 3).map(skill => (
              <span key={skill} className="bg-white border border-gray-200 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-sm group-hover:border-blue-200 transition-colors">
                {skill}
              </span>
           ))}
           {profile.skills && profile.skills.length > 3 && (
             <span className="text-[11px] text-gray-400 font-medium py-1 px-1">
               +{profile.skills.length - 3}
             </span>
           )}
         </div>
         
         {/* Flecha indicadora de clic (UX affordance) */}
         <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </li>
  );
};

export default CandidateListItem;
