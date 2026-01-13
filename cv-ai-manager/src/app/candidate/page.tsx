"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save, Eye, PenTool, FileText } from 'lucide-react';
import FileUpload from '@/components/forms/FileUpload';
import EditableProfileForm from '@/components/forms/EditableProfileForm'; // Asumiendo que ya tienes este
import ResumePreview from '@/components/cv/ResumePreview'; // El componente nuevo
import SkeletonCard from '@/components/skeletons/SkeletonCard';
import api from '@/services/api';
import { CandidateProfile, ImprovementCandidateResponse } from '@/types';

const CandidatePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  
  // Estado para los resultados
  const [improvedCv, setImprovedCv] = useState<CandidateProfile | null>(null);
  const [improvedText, setImprovedText] = useState<string>('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'raw'>('preview');

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
      api.post<ImprovementCandidateResponse>('/api/v1/candidates/improve', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: 'Analizando y mejorando tu CV con IA...',
        success: (response) => {
          console.log('Respuesta de la API:', response);
          console.log('Respuesta de la API:', response.data);
          setImprovedCv(response.data.profile);
          setImprovedText(response.data.improvedText);
          setIsLoading(false);
          setActiveTab('preview'); // Automáticamente mostrar la vista bonita
          return '¡CV optimizado exitosamente!';
        },
        error: (err) => {
          setIsLoading(false);
          return err.response?.data?.message || 'Hubo un error al procesar el archivo.';
        },
      }
    );
  };

  const handleSaveCv = async () => {
    if (!improvedCv) {
      toast.error('No hay datos para guardar.');
      return;
    }

    toast.promise(api.post('/api/v1/candidates', improvedCv), {
      loading: 'Guardando en base de datos...',
      success: '¡Perfil guardado correctamente!',
      error: 'Error al guardar el perfil.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Optimizador de CV con IA</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sube tu CV actual y una descripción del trabajo deseado. Nuestra IA reescribirá y formateará tu perfil profesionalmente.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: INPUTS (4 columnas) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tarjeta de Subida */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</div>
                Sube tu CV (PDF/Word)
              </h2>
              <FileUpload onFileUpload={handleFileSelect} />
              {file && (
                <div className="mt-3 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center justify-between">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-xs opacity-70">Listo</span>
                </div>
              )}
            </div>

            {/* Tarjeta de Job Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</div>
                 Descripción del Puesto (Opcional)
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-shadow"
                placeholder="Pega aquí los requisitos del trabajo para alinear tus habilidades..."
              />
            </div>

            {/* Botón de Acción */}
            <button
              onClick={handleImproveCv}
              disabled={!file || isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Mejorar mi CV Ahora
                </>
              )}
            </button>
          </div>

          {/* COLUMNA DERECHA: RESULTADOS (8 columnas) */}
          <div className="lg:col-span-8">
            {!improvedCv && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Los resultados aparecerán aquí</p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                 <SkeletonCard />
                 <SkeletonCard />
              </div>
            )}

            {improvedCv && !isLoading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Tabs de Navegación */}
                <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        activeTab === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Eye className="w-4 h-4" /> Vista Previa
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        activeTab === 'edit' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PenTool className="w-4 h-4" /> Editar Datos
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        activeTab === 'raw' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> Texto Plano
                    </button>
                  </div>
                  
                  <button
                    onClick={handleSaveCv}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>

                {/* Contenido de las Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                  
                  {activeTab === 'preview' && (
                    <div className="p-4 bg-slate-100 overflow-x-auto">
                      <ResumePreview data={improvedCv} />
                    </div>
                  )}

                  {activeTab === 'edit' && (
                    <div className="p-6">
                       <h3 className="text-lg font-bold mb-4">Corregir Información</h3>
                       <EditableProfileForm profile={improvedCv} setProfile={setImprovedCv} />
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <div className="p-6 bg-slate-50">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
                        {improvedText || JSON.stringify(improvedCv, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;