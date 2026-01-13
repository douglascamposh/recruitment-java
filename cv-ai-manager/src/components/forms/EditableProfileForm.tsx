// src/components/forms/EditableProfileForm.tsx
"use client";

import React from 'react';
import { CandidateProfile, Experience, Education, Language } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EditableProfileFormProps {
  profile: CandidateProfile;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile | null>>;
}

const EditableProfileForm: React.FC<EditableProfileFormProps> = ({ profile, setProfile }) => {

  // Generic handler for top-level simple fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Handler for nested link fields
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, links: { ...prev.links, [name]: value } } : null);
  }

  // Generic handler for changes within an array of objects (Experience, Education, Language)
  const handleNestedChange = <T extends Experience | Education | Language>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    section: 'workExperience' | 'education' | 'languages'
  ) => {
    const { name, value } = e.target;
    if (!profile) return;

    const updatedSection = [...(profile[section] as T[])];
    updatedSection[index] = { ...updatedSection[index], [name]: value };

    setProfile({ ...profile, [section]: updatedSection });
  };

  // Generic handler to add a new item to an array of objects
  const handleAddItem = (section: 'workExperience' | 'education' | 'languages') => {
    if (!profile) return;
    let newItem;
    if (section === 'workExperience') {
      newItem = { role: '', company: '', duration: '', jobDescription: '' };
    } else if (section === 'education') {
      newItem = { degree: '', institution: '', durationOrYear: '' };
    } else { // languages
      newItem = { language: '', proficiency: '' };
    }

    setProfile({ ...profile, [section]: [...(profile[section] || []), newItem] });
  };

  // Generic handler to remove an item from an array of objects
  const handleRemoveItem = (index: number, section: 'workExperience' | 'education' | 'languages') => {
     if (!profile) return;
     const updatedSection = [...(profile[section] || [])];
     updatedSection.splice(index, 1);
     setProfile({ ...profile, [section]: updatedSection });
  };

  // Handlers for string arrays (skills, certifications)
  const handleAddStringItem = (e: React.KeyboardEvent<HTMLInputElement>, section: 'skills' | 'certifications') => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newItem = e.currentTarget.value.trim();
      if (!profile[section].includes(newItem)) {
        setProfile({ ...profile, [section]: [...profile[section], newItem] });
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveStringItem = (itemToRemove: string, section: 'skills' | 'certifications') => {
    setProfile({ ...profile, [section]: profile[section].filter(item => item !== itemToRemove) });
  };


  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* --- Información Básica --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="candidateName" value={profile.candidateName} onChange={handleInputChange} placeholder="Nombre del Candidato" className="w-full p-2 border rounded" />
        <input type="email" name="email" value={profile.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 border rounded" />
        <input type="text" name="phone" value={profile.phone || ''} onChange={handleInputChange} placeholder="Teléfono" className="w-full p-2 border rounded" />
        <input type="text" name="location" value={profile.location || ''} onChange={handleInputChange} placeholder="Ubicación" className="w-full p-2 border rounded" />
        <input type="text" name="nationality" value={profile.nationality || ''} onChange={handleInputChange} placeholder="Nacionalidad" className="w-full p-2 border rounded" />
        <input type="text" name="sex" value={profile.sex || ''} onChange={handleInputChange} placeholder="Sexo" className="w-full p-2 border rounded" />
      </div>
      <textarea name="summary" value={profile.summary || ''} onChange={handleInputChange} placeholder="Resumen Profesional" className="w-full p-2 border rounded" rows={4} />

      {/* --- Enlaces --- */}
       <h3 className="text-lg font-semibold border-b pb-2">Enlaces</h3>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="linkedIn" value={profile.links?.linkedIn || ''} onChange={handleLinkChange} placeholder="Perfil de LinkedIn" className="w-full p-2 border rounded" />
          <input type="text" name="github" value={profile.links?.github || ''} onChange={handleLinkChange} placeholder="Perfil de Github" className="w-full p-2 border rounded" />
          <input type="text" name="portfolio" value={profile.links?.portfolio || ''} onChange={handleLinkChange} placeholder="Portfolio" className="w-full p-2 border rounded" />
       </div>

      {/* --- Habilidades --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Habilidades</h3>
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile?.skills.map(skill => (
            <span key={skill} className="flex items-center bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {skill}
              <button onClick={() => handleRemoveStringItem(skill, 'skills')} className="ml-2 text-blue-600 hover:text-blue-800"><Trash2 size={14} /></button>
            </span>
          ))}
        </div>
        <input type="text" onKeyDown={e => handleAddStringItem(e, 'skills')} placeholder="Añade una habilidad y presiona Enter" className="w-full p-2 border rounded" />
      </div>

      {/* --- Experiencia Laboral --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Experiencia Laboral</h3>
      {profile.workExperience?.map((exp, index) => (
        <div key={index} className="p-4 border rounded mb-2 space-y-2 relative bg-gray-50">
           <button onClick={() => handleRemoveItem(index, 'workExperience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
           <input type="text" name="role" value={exp.role} onChange={e => handleNestedChange(e, index, 'workExperience')} placeholder="Cargo" className="w-full p-2 border rounded" />
           <input type="text" name="company" value={exp.company} onChange={e => handleNestedChange(e, index, 'workExperience')} placeholder="Empresa" className="w-full p-2 border rounded" />
           <input type="text" name="duration" value={exp.duration} onChange={e => handleNestedChange(e, index, 'workExperience')} placeholder="Duración (ej. 2020-2022)" className="w-full p-2 border rounded" />
           <textarea name="jobDescription" value={exp.jobDescription} onChange={e => handleNestedChange(e, index, 'workExperience')} placeholder="Descripción del puesto" className="w-full p-2 border rounded" />
        </div>
      ))}
      <button onClick={() => handleAddItem('workExperience')} className="flex items-center text-blue-600 hover:text-blue-800"><PlusCircle size={18} className="mr-1" /> Añadir Experiencia</button>

      {/* --- Educación --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Educación</h3>
      {profile.education?.map((edu, index) => (
        <div key={index} className="p-4 border rounded mb-2 space-y-2 relative bg-gray-50">
           <button onClick={() => handleRemoveItem(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
           <input type="text" name="degree" value={edu.degree} onChange={e => handleNestedChange(e, index, 'education')} placeholder="Título" className="w-full p-2 border rounded" />
           <input type="text" name="institution" value={edu.institution} onChange={e => handleNestedChange(e, index, 'education')} placeholder="Institución" className="w-full p-2 border rounded" />
           <input type="text" name="durationOrYear" value={edu.durationOrYear} onChange={e => handleNestedChange(e, index, 'education')} placeholder="Año o Duración" className="w-full p-2 border rounded" />
        </div>
      ))}
      <button onClick={() => handleAddItem('education')} className="flex items-center text-blue-600 hover:text-blue-800"><PlusCircle size={18} className="mr-1" /> Añadir Educación</button>

      {/* --- Idiomas --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Idiomas</h3>
      {profile.languages?.map((lang, index) => (
        <div key={index} className="p-4 border rounded mb-2 grid grid-cols-3 gap-4 relative bg-gray-50">
           <input type="text" name="language" value={lang.language} onChange={e => handleNestedChange(e, index, 'languages')} placeholder="Idioma" className="w-full p-2 border rounded col-span-1" />
           <input type="text" name="proficiency" value={lang.proficiency} onChange={e => handleNestedChange(e, index, 'languages')} placeholder="Nivel" className="w-full p-2 border rounded col-span-1" />
           <div className="col-span-1 flex justify-end items-center">
             <button onClick={() => handleRemoveItem(index, 'languages')} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
           </div>
        </div>
      ))}
      <button onClick={() => handleAddItem('languages')} className="flex items-center text-blue-600 hover:text-blue-800"><PlusCircle size={18} className="mr-1" /> Añadir Idioma</button>

      {/* --- Certificaciones --- */}
      <h3 className="text-lg font-semibold border-b pb-2">Certificaciones</h3>
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.certifications?.map(cert => (
            <span key={cert} className="flex items-center bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              {cert}
              <button onClick={() => handleRemoveStringItem(cert, 'certifications')} className="ml-2 text-green-600 hover:text-green-800"><Trash2 size={14} /></button>
            </span>
          ))}
        </div>
        <input type="text" onKeyDown={e => handleAddStringItem(e, 'certifications')} placeholder="Añade una certificación y presiona Enter" className="w-full p-2 border rounded" />
      </div>

    </div>
  );
};

export default EditableProfileForm;
