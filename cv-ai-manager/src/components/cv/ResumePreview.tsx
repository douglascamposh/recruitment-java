import React, { forwardRef } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, // Usado para Portfolio
  Briefcase, 
  GraduationCap, 
  Globe2, // Usado para Idiomas
  Layers, 
  Award // Usado para Certificaciones
} from 'lucide-react';
import { CandidateProfile } from '@/types';

interface ResumePreviewProps {
  data: CandidateProfile | null;
}

// Usamos forwardRef para que la librería 'react-to-print' pueda acceder al DOM de este componente
const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref} 
      className="bg-white w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-xl rounded-sm text-slate-800 font-sans mb-10 print:shadow-none print:mb-0 print:w-full print:max-w-none"
    >
      
      {/* HEADER / HERO SECTION */}
      <header className="bg-slate-900 text-white p-10 print:bg-slate-900 print:text-white print-color-adjust-exact">
        <div className="flex justify-between items-start">
          
          {/* Información Principal */}
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 leading-tight">
              {data.candidateName}
            </h1>
            {/* Puedes hacer este título dinámico si viene en el JSON, por ahora lo dejamos fijo o basado en el rol más reciente */}
            <div className="text-blue-400 font-medium text-lg mb-6">
              {data.workExperience?.[0]?.role || 'Professional Candidate'}
            </div>
            
            <div className="flex flex-col md:flex-row flex-wrap gap-4 text-sm text-slate-300">
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" /> {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" /> {data.phone}
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" /> {data.location}
                </div>
              )}
            </div>
          </div>

          {/* Iconos Sociales (Se ocultan al imprimir porque no se pueden cliquear en papel) */}
          <div className="flex gap-3 print:hidden">
             {data.links?.linkedIn && (
               <a 
                 href={data.links.linkedIn} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors border border-slate-700"
                 title="LinkedIn"
               >
                 <Linkedin className="w-5 h-5 text-white" />
               </a>
             )}
             {data.links?.github && (
               <a 
                 href={data.links.github} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-slate-800 rounded-lg hover:bg-gray-600 transition-colors border border-slate-700"
                 title="GitHub"
               >
                 <Github className="w-5 h-5 text-white" />
               </a>
             )}
             {data.links?.portfolio && (
               <a 
                 href={data.links.portfolio} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors border border-slate-700"
                 title="Portfolio / Website"
               >
                 <Globe className="w-5 h-5 text-white" />
               </a>
             )}
          </div>
        </div>
      </header>

      {/* GRID LAYOUT (2 Columnas) */}
      <div className="grid grid-cols-12 min-h-[800px]">
        
        {/* === COLUMNA IZQUIERDA (Sidebar) === */}
        <aside className="col-span-12 md:col-span-4 bg-slate-50 p-8 border-r border-slate-200 print:bg-slate-50 print:col-span-4 print:border-r">
          
          {/* Habilidades */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8 break-inside-avoid">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-2 mb-4">
                <Layers className="w-4 h-4 text-blue-600" /> Habilidades 
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded shadow-sm print:border-gray-300 print:bg-white">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educación */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8 break-inside-avoid">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-2 mb-4">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Educación
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i} className="break-inside-avoid">
                    <div className="font-bold text-sm text-slate-800 leading-snug">{edu.degree}</div>
                    <div className="text-xs text-slate-600 italic mt-0.5">{edu.institution}</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">{edu.durationOrYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8 break-inside-avoid">
               <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-2 mb-4">
                <Globe2 className="w-4 h-4 text-blue-600" /> Idiomas
              </h3>
              <ul className="space-y-2">
                {data.languages.map((lang, i) => (
                  <li key={i} className="flex justify-between text-sm break-inside-avoid items-center">
                    <span className="font-medium text-slate-700">{lang.language}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {lang.proficiency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certificaciones (Si existen) */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-8 break-inside-avoid">
               <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs border-b-2 border-slate-200 pb-2 mb-4">
                <Award className="w-4 h-4 text-blue-600" /> Certificaciones
              </h3>
              <ul className="space-y-2 list-disc list-outside ml-3 text-xs text-slate-600 marker:text-blue-500">
                {data.certifications.map((cert, i) => (
                  <li key={i} className="pl-1 break-inside-avoid">
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </aside>

        {/* === COLUMNA DERECHA (Main Content) === */}
        <main className="col-span-12 md:col-span-8 p-8 print:col-span-8 bg-white">
          
          {/* Resumen Profesional */}
          {data.summary && (
            <div className="mb-10 break-inside-avoid">
              <h3 className="font-bold text-lg text-slate-800 mb-3 border-l-4 border-blue-600 pl-3">
                Perfil Profesional
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experiencia Laboral */}
          {data.workExperience && data.workExperience.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800 border-b border-slate-200 pb-2 mb-6">
                <Briefcase className="w-5 h-5 text-blue-600" /> Experiencia Laboral
              </h3>
              
              {/* Línea de tiempo container */}
              <div className="space-y-8 relative border-l-2 border-slate-100 ml-3 pl-8 py-2">
                {data.workExperience.map((exp, i) => (
                  <div key={i} className="relative break-inside-avoid mb-6">
                    
                    {/* Punto de la línea de tiempo */}
                    <span className="absolute -left-[41px] top-1.5 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-sm print:bg-blue-600 print:shadow-none print:border-gray-100"></span>
                    
                    {/* Header del trabajo */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                      <h4 className="font-bold text-slate-900 text-lg">{exp.role}</h4>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full self-start print:bg-gray-100 print:text-black border border-blue-100 print:border-gray-200 whitespace-nowrap mt-1 sm:mt-0">
                        {exp.duration}
                      </span>
                    </div>
                    
                    <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      {exp.company}
                    </div>
                    
                    {/* Descripción */}
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                      {exp.jobDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ESTILOS CSS INYECTADOS SOLO PARA IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            /* Asegura que los colores de fondo (gris del sidebar, azul del header) se impriman */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Clases de utilidad críticas para evitar que un trabajo se corte a la mitad */
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
});

// Necesario para que React DevTools muestre el nombre correcto con forwardRef
ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;