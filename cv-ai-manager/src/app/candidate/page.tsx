"use client";

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print'; // Librería de impresión
import { Upload, Save, Eye, PenTool, FileText, Download, Briefcase } from 'lucide-react';

// Componentes
import FileUpload from '@/components/forms/FileUpload';
import EditableProfileForm from '@/components/forms/EditableProfileForm'; 
import ResumePreview from '@/components/cv/ResumePreview'; 
import SkeletonCard from '@/components/skeletons/SkeletonCard';

// API y Tipos
import api from '@/services/api';
import { CandidateProfile,ImprovementCandidateResponse } from '@/types';

const CandidatePage = () => {
  // --- ESTADOS DE DATOS ---
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [improvedCv, setImprovedCv] = useState<CandidateProfile | null>(null);
  const [improvedText, setImprovedText] = useState<string>('');

  // --- ESTADOS DE UI ---
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'raw'>('preview');
  
  // Simulación de Auth (Cambia esto por tu hook real, ej: const { user } = useAuth())
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // --- REF PARA IMPRESIÓN ---
  const componentRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    toast.success(`Archivo seleccionado: ${selectedFile.name}`);
  };

  // 1. Enviar a Mejorar CV
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
          // Navegamos correctamente el JSON anidado
          const dataWrapper = response.data;
          
          if (dataWrapper && dataWrapper.profile) {
            setImprovedCv(dataWrapper.profile);
            setImprovedText(dataWrapper.improvedText);
            setIsLoading(false);
            setActiveTab('preview'); // Forzar vista bonita al terminar
            return '¡CV optimizado exitosamente!';
          } else {
            throw new Error("La respuesta del servidor no tiene el formato esperado.");
          }
        },
        error: (err) => {
          setIsLoading(false);
          console.error(err);
          return err.response?.data?.message || 'Error al procesar el archivo.';
        },
      }
    );
  };

  // 2. Guardar en Base de Datos (Solo si está logueado)
  const handleSaveCv = async () => {
    if (!improvedCv) {
       toast.error('No hay datos para guardar.');
       return;
    }

    toast.promise(api.post('/api/v1/candidates', { 
        originalProfile: null, 
        improvedProfile: improvedCv 
    }), {
      loading: 'Guardando en base de datos...',
      success: '¡Perfil guardado correctamente!',
      error: 'Error al guardar el perfil.',
    });
  };

  // 3. Exportar a PDF (Imprimir solo el componente)
  const handleExportPdf = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: `CV_Mejorado_${improvedCv?.candidateName || 'Candidato'}`,
    onAfterPrint: () => toast.success('Documento generado'),
    onPrintError: () => toast.error('Error al generar el documento'),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Optimizador de CV con IA
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sube tu CV actual y una descripción del trabajo deseado. Nuestra tecnología reescribirá y formateará tu perfil profesionalmente.
          </p>
          
          {/* Toggle temporal para probar la UI de Auth */}
          <div className="flex justify-center mt-4">
            <label className="flex items-center cursor-pointer text-xs text-slate-400 gap-2">
              <input 
                type="checkbox" 
                checked={isLoggedIn} 
                onChange={(e) => setIsLoggedIn(e.target.checked)}
                className="rounded border-gray-300"
              />
              Simular usuario logueado
            </label>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* === COLUMNA IZQUIERDA: INPUTS === */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            
            {/* 1. Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Sube tu CV (PDF/Word)
              </h2>
              <FileUpload onFileUpload={handleFileSelect} />
              
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <span className="truncate font-medium flex-1 mr-2">{file.name}</span>
                  <span className="text-xs font-bold uppercase tracking-wide bg-white px-2 py-1 rounded">Listo</span>
                </div>
              )}
            </div>

            {/* 2. Job Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                 Descripción del Puesto
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                (Opcional) Pega aquí los requisitos para que la IA adapte tus habilidades.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-shadow"
                placeholder="Ej: Buscamos un desarrollador Java con experiencia en microservicios..."
              />
            </div>

            {/* 3. Action Button */}
            <button
              onClick={handleImproveCv}
              disabled={!file || isLoading}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform
                ${!file || isLoading 
                  ? 'bg-slate-300 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:-translate-y-1 active:scale-95'}
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  <span>Mejorar mi CV Ahora</span>
                </>
              )}
            </button>
          </div>

          {/* === COLUMNA DERECHA: RESULTADOS === */}
          <div className="lg:col-span-8">
            
            {/* Estado Vacío */}
            {!improvedCv && !isLoading && (
              <div className="h-[600px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400">
                <FileText className="w-20 h-20 mb-6 opacity-20" />
                <p className="text-lg font-medium">Los resultados aparecerán aquí</p>
                <p className="text-sm opacity-70">Sube un archivo para ver la magia</p>
              </div>
            )}

            {/* Estado de Carga */}
            {isLoading && (
              <div className="space-y-4">
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
              </div>
            )}

            {/* Estado de Éxito (Resultados) */}
            {improvedCv && !isLoading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* TOOLBAR SUPERIOR */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 sticky top-6 z-10">
                  
                  {/* Selector de Vistas */}
                  <div className="flex p-1 bg-slate-100 rounded-lg w-full md:w-auto">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Vista Previa</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'edit' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <PenTool className="w-4 h-4" /> <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'raw' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> <span className="hidden sm:inline">JSON</span>
                    </button>
                  </div>
                  
                  {/* Botón de Acción Principal (Dinámico) */}
                  {isLoggedIn ? (
                    <button
                      onClick={handleSaveCv}
                      className="w-full md:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Guardar Perfil
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExportPdf()}
                      className="w-full md:w-auto px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                  )}
                </div>

                {/* AREA DE CONTENIDO */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px]">
                  
                  {/* 1. VISTA PREVIA (Para impresión) */}
                  <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                    <div className="p-4 md:p-8 bg-slate-100 overflow-x-auto">
                      {/* Pasamos la ref aquí para que react-to-print la encuentre */}
                      <ResumePreview ref={componentRef} data={improvedCv} />
                    </div>
                  </div>

                  {/* 2. VISTA DE EDICIÓN */}
                  {activeTab === 'edit' && (
                    <div className="p-6 md:p-8 animate-in fade-in duration-300">
                       <div className="mb-6 pb-4 border-b border-slate-100">
                          <h3 className="text-xl font-bold text-slate-800">Editor de Perfil</h3>
                          <p className="text-sm text-slate-500">Corrige cualquier alucinación de la IA antes de exportar.</p>
                       </div>
                       {/* Asegúrate de que este componente soporte editar arrays complejos */}
                       <EditableProfileForm profile={improvedCv} setProfile={setImprovedCv} />
                    </div>
                  )}

                  {/* 3. VISTA RAW (Texto/JSON) */}
                  {activeTab === 'raw' && (
                    <div className="p-0 animate-in fade-in duration-300">
                      <div className="bg-slate-900 text-slate-300 p-4 overflow-x-auto text-xs font-mono h-[800px]">
                        <pre>{improvedText || JSON.stringify(improvedCv, null, 2)}</pre>
                      </div>
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