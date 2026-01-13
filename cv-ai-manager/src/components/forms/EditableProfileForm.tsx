// src/components/forms/EditableProfileForm.tsx
"use client";

import React from 'react';
import { CandidateProfile } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface EditableProfileFormProps {
  profile: CandidateProfile;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile | null>>;
}

const EditableProfileForm: React.FC<EditableProfileFormProps> = ({ profile, setProfile }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, section: 'experience' | 'education') => {
    const { name, value } = e.target;
    if (!profile) return;

    const updatedSection = [...(profile[section] || [])];
    updatedSection[index] = { ...updatedSection[index], [name]: value };

    setProfile({ ...profile, [section]: updatedSection });
  };

  const handleAddItem = (section: 'experience' | 'education') => {
    if (!profile) return;
    const newItem = section === 'experience'
      ? { title: '', company: '', startDate: '', description: '' }
      : { institution: '', degree: '', startDate: '' };

    setProfile({ ...profile, [section]: [...(profile[section] || []), newItem] });
  };

  const handleRemoveItem = (index: number, section: 'experience' | 'education') => {
     if (!profile) return;
     const updatedSection = [...(profile[section] || [])];
     updatedSection.splice(index, 1);
     setProfile({ ...profile, [section]: updatedSection });
  };

  // Handlers for skills
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newSkill = e.currentTarget.value.trim();
      if (!profile.skills.includes(newSkill)) {
        setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      }
      e.currentTarget.value = '';
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(skill => skill !== skillToRemove) });
  };


  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <input type="text" name="name" value={profile.name} onChange={handleInputChange} placeholder="Nombre" className="w-full p-2 border rounded" />
        <input type="email" name="email" value={profile.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 border rounded" />
        <textarea name="summary" value={profile.summary || ''} onChange={handleInputChange} placeholder="Resumen" className="w-full p-2 border rounded" />
      </div>

      {/* Skills */}
      <div>
        <h4 className="font-semibold mb-2">Habilidades</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.skills.map(skill => (
            <span key={skill} className="flex items-center bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800"><Trash2 size={14} /></button>
            </span>
          ))}
        </div>
        <input type="text" onKeyDown={handleAddSkill} placeholder="Añade una habilidad y presiona Enter" className="w-full p-2 border rounded" />
      </div>

      {/* Experience */}
      <div>
        <h4 className="font-semibold mb-2">Experiencia</h4>
        {profile.experience?.map((exp, index) => (
          <div key={index} className="p-4 border rounded mb-2 space-y-2 relative">
             <button onClick={() => handleRemoveItem(index, 'experience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
             <input type="text" name="title" value={exp.title} onChange={e => handleNestedChange(e, index, 'experience')} placeholder="Cargo" className="w-full p-2 border rounded" />
             <input type="text" name="company" value={exp.company} onChange={e => handleNestedChange(e, index, 'experience')} placeholder="Empresa" className="w-full p-2 border rounded" />
             <textarea name="description" value={exp.description} onChange={e => handleNestedChange(e, index, 'experience')} placeholder="Descripción" className="w-full p-2 border rounded" />
          </div>
        ))}
        <button onClick={() => handleAddItem('experience')} className="flex items-center text-blue-600 hover:text-blue-800"><PlusCircle size={18} className="mr-1" /> Añadir Experiencia</button>
      </div>

      {/* Education */}
      <div>
        <h4 className="font-semibold mb-2">Educación</h4>
        {profile.education?.map((edu, index) => (
          <div key={index} className="p-4 border rounded mb-2 space-y-2 relative">
             <button onClick={() => handleRemoveItem(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
             <input type="text" name="degree" value={edu.degree} onChange={e => handleNestedChange(e, index, 'education')} placeholder="Título" className="w-full p-2 border rounded" />
             <input type="text" name="institution" value={edu.institution} onChange={e => handleNestedChange(e, index, 'education')} placeholder="Institución" className="w-full p-2 border rounded" />
          </div>
        ))}
        <button onClick={() => handleAddItem('education')} className="flex items-center text-blue-600 hover:text-blue-800"><PlusCircle size={18} className="mr-1" /> Añadir Educación</button>
      </div>
    </div>
  );
};

export default EditableProfileForm;
