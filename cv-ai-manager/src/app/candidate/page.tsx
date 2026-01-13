// src/app/candidate/page.tsx
"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save } from 'lucide-react';
import FileUpload from '@/components/forms/FileUpload';
import EditableProfileForm from '@/components/forms/EditableProfileForm';
import SkeletonCard from '@/components/skeletons/SkeletonCard';
import api from '@/services/api';
import { CandidateProfile, ImprovementCandidateResponse } from '@/types';

const CandidatePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [improvedCv, setImprovedCv] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleImproveCv = async () => {
    if (!file) {
      toast.error('Por favor, selecciona un archivo primero.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    setIsLoading(true);
    setImprovedCv(null);

    toast.promise(
      api.post<ImprovementCandidateResponse>('/candidates/improve', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: 'Mejorando tu CV...',
        success: (response) => {
          setImprovedCv(response.data.profile);
          setIsLoading(false);
          return '¡CV mejorado con éxito!';
        },
        error: (err) => {
          setIsLoading(false);
          return err.response?.data?.message || 'Hubo un error al mejorar el CV.';
        },
      }
    );
  };

  const handleSaveCv = async () => {
    if (!improvedCv) {
      toast.error('No hay un CV mejorado para guardar.');
      return;
    }

    toast.promise(api.post('/candidates', improvedCv), {
      loading: 'Guardando tu perfil...',
      success: '¡Perfil guardado con éxito!',
      error: (err) => err.response?.data?.message || 'Hubo un error al guardar el perfil.',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Módulo del Candidato</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna de Carga y Mejora */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">1. Carga tu CV</h2>
            <FileUpload onFileUpload={handleFileSelect} />
            {file && <p className="text-sm text-gray-600 mt-2">Archivo seleccionado: {file.name}</p>}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">2. Mejora (Opcional)</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Pega aquí la descripción del puesto para una mejora más precisa..."
            />
          </div>
          <button
            onClick={handleImproveCv}
            disabled={!file || isLoading}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Mejorar CV
          </button>
        </div>

        {/* Columna de Resultados */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Resultados</h2>
          {isLoading && <SkeletonCard />}
          {improvedCv && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Edita tu Perfil Mejorado</h3>
              <EditableProfileForm profile={improvedCv} setProfile={setImprovedCv} />
              <button
                onClick={handleSaveCv}
                className="mt-6 w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                Guardar Perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;
