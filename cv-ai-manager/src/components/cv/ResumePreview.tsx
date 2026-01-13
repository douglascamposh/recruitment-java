import React from 'react';
import { 
  Mail, Phone, MapPin, Linkedin, Github, Globe, 
  Briefcase, GraduationCap, Award, Globe2, Sparkles 
} from 'lucide-react';
import { CandidateProfile } from '@/types';

interface ResumePreviewProps {
  data: CandidateProfile;
}

const ResumePreview = ({ data }: ResumePreviewProps) => {
  // Helpers para renderizar iconos
  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : 'C';

  return (
    <div className="bg-white w-full max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden print:shadow-none print:w-full">
      {/* HEADER HERO */}
      <div className="bg-slate-900 text-white p-8 md:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-slate-800">
            {getInitial(data.candidateName)}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.candidateName}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-slate-300 text-sm">
              {data.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {data.phone}
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {data.location}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Social Links (Right Side of Header) */}
        <div className="mt-6 md:mt-0 flex gap-3">
            {data.links?.linkedIn && (
              <a href={data.links.linkedIn} target="_blank" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {data.links?.github && (
              <a href={data.links.github} target="_blank" className="p-2 bg-slate-800 rounded-full hover:bg-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
             {data.links?.portfolio && (
              <a href={data.links.portfolio} target="_blank" className="p-2 bg-slate-800 rounded-full hover:bg-purple-600 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid md:grid-cols-3 min-h-[800px]">
        
        {/* SIDEBAR (Left Column) */}
        <div className="bg-slate-50 p-8 border-r border-slate-200 space-y-8">
          
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm mb-4 border-b pb-2 border-slate-200">
                <Sparkles className="w-4 h-4 text-blue-600" /> Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm mb-4 border-b pb-2 border-slate-200">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Educación
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <p className="font-bold text-slate-800 text-sm">{edu.degree}</p>
                    <p className="text-slate-600 text-xs">{edu.institution}</p>
                    <p className="text-slate-400 text-xs mt-1">{edu.durationOrYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div>
               <h3 className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm mb-4 border-b pb-2 border-slate-200">
                <Globe2 className="w-4 h-4 text-blue-600" /> Idiomas
              </h3>
              <ul className="space-y-2">
                {data.languages.map((lang, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{lang.language}</span>
                    <span className="text-slate-500 text-xs">{lang.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

           {/* Certifications */}
           {data.certifications && data.certifications.length > 0 && (
            <div>
               <h3 className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm mb-4 border-b pb-2 border-slate-200">
                <Award className="w-4 h-4 text-blue-600" /> Certificaciones
              </h3>
              <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                {data.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* MAIN AREA (Right Column) */}
        <div className="md:col-span-2 p-8 space-y-8 bg-white">
          
          {/* Summary */}
          {data.summary && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Perfil Profesional</h3>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
                <Briefcase className="w-5 h-5 text-blue-600" /> Experiencia Laboral
              </h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {data.workExperience.map((exp, index) => (
                  <div key={index} className="relative pl-6">
                    {/* Timeline dot */}
                    <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-50"></span>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                      <h4 className="font-bold text-slate-800">{exp.role}</h4>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{exp.duration}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</p>
                    <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                      {exp.jobDescription}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
