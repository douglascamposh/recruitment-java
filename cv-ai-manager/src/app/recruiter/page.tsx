// src/app/recruiter/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, UserCheck } from 'lucide-react';
import api from '@/services/api';
import { CandidateMatch, CandidateProfile } from '@/types';
import SkeletonCard from '@/components/skeletons/SkeletonCard';

const RecruiterPage = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [ingestedProfiles, setIngestedProfiles] = useState<CandidateProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    const fetchIngestedProfiles = async () => {
      try {
        const response = await api.get('/candidates');
        setIngestedProfiles(response.data);
      } catch (error) {
        toast.error('No se pudieron cargar los perfiles de los candidatos.');
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    fetchIngestedProfiles();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription.trim()) {
      toast.error('Por favor, introduce una descripción del puesto.');
      return;
    }
    setIsSearching(true);
    setMatches([]);

    toast.promise(
      api.post('/recruitment/match', { jobDescription }),
      {
        loading: 'Buscando los mejores candidatos...',
        success: (response) => {
          setMatches(response.data);
          setIsSearching(false);
          return response.data.length > 0
            ? `Se encontraron ${response.data.length} candidatos.`
            : 'No se encontraron candidatos para esta descripción.';
        },
        error: (err) => {
          setIsSearching(false);
          return err.response?.data?.message || 'Hubo un error en la búsqueda.';
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Módulo del Reclutador</h1>

      {/* Sección de Búsqueda */}
      <div className="p-6 bg-white rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Búsqueda Semántica</h2>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              className="w-full p-4 pr-12 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Pega aquí la descripción del puesto para encontrar los mejores candidatos..."
            />
            <button
              type="submit"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
              disabled={isSearching}
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>

      {/* Resultados de la Búsqueda */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Resultados de la Búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSearching && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          {matches.map((match) => (
            <div key={match.candidate.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">{match.candidate.name}</h3>
                <span className="text-lg font-semibold text-blue-600">{match.score}%</span>
              </div>
              <p className="text-gray-600 mt-2">Habilidades coincidentes:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {match.matchingSkills.map((skill) => (
                  <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Perfiles Ingeridos */}
      <div className="mt-12">
         <h2 className="text-2xl font-semibold mb-4 text-gray-700">Perfiles en el Sistema</h2>
         <div className="bg-white p-6 rounded-lg shadow-md">
           {isLoadingProfiles && <p>Cargando perfiles...</p>}
           {!isLoadingProfiles && ingestedProfiles.length === 0 && <p>No hay perfiles en el sistema.</p>}
           <ul className="space-y-4">
             {ingestedProfiles.map(profile => (
                <li key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                   <div className="flex flex-wrap gap-1 justify-end" style={{maxWidth: '50%'}}>
                     {profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                     ))}
                   </div>
                </li>
             ))}
           </ul>
         </div>
      </div>
    </div>
  );
};

export default RecruiterPage;
