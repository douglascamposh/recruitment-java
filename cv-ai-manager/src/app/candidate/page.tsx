"use client";

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { 
  Save, Eye, PenTool, FileText, Download, Briefcase, 
  Building2, Target, Lightbulb, HelpCircle, BookOpen, AlertCircle, CheckCircle2 
} from 'lucide-react';

import FileUpload from '@/components/forms/FileUpload';
import EditableProfileForm from '@/components/forms/EditableProfileForm'; 
import ResumePreview from '@/components/cv/ResumePreview'; 
import SkeletonCard from '@/components/skeletons/SkeletonCard';

import api from '@/services/api';
import { CandidateProfile } from '@/types'; 
import RateLimitModal from '@/components/modals/RateLimitModal';

// --- LOCAL TYPE DEFINITIONS TO AVOID TS ERRORS ---
interface CourseRecommendation {
  skill: string;
  title: string;
  platform: string;
  url: string;
  reason: string;
}

interface InterviewPrepData {
  seniorityLevel: string;
  interviewReadiness: string;
  companyInsights: string;
  potentialQuestions: string[];
  recommendedCourses: CourseRecommendation[];
  companyInfoFound: boolean;
}

interface ImprovementCandidateResponse {
  profile: CandidateProfile;
  improvedText: string;
  interviewPrep: InterviewPrepData;
}

const CandidatePage = () => {
  // --- DATA STATES ---
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState(''); 
  
  const [improvedCv, setImprovedCv] = useState<CandidateProfile | null>(null);
  const [improvedText, setImprovedText] = useState<string>('');
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepData | null>(null); 

  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'prep' | 'raw'>('preview');
  
  // Auth Simulation
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // --- PRINT REF ---
  const componentRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false); // For rate limit

  // --- HANDLERS ---

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  // 1. Submit to Improve CV
  const handleImproveCv = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    if (companyName) formData.append('company', companyName); 

    setIsLoading(true);
    setImprovedCv(null);
    setInterviewPrep(null);

    toast.promise(
      api.post<ImprovementCandidateResponse>('/api/v1/cvs/improve', formData),
      {
        loading: 'Analyzing profile, searching for courses, and improving CV...',
        success: (response) => {
          const dataWrapper = response.data;
          
          if (dataWrapper && dataWrapper.profile) {
            setImprovedCv(dataWrapper.profile);
            setImprovedText(dataWrapper.improvedText);
            if (dataWrapper.interviewPrep) {
               setInterviewPrep(dataWrapper.interviewPrep); 
            }
            setIsLoading(false);
            setActiveTab('preview');
            return 'CV optimized and preparation ready!';
          } else {
            throw new Error("The server response does not have the expected format.");
          }
        },
        error: (err) => {
          setIsLoading(false);
          console.error(err);
          return err.response?.data?.message || 'Error processing the file.';
        },
      }
    );
  };

  // 2. Save to Database
  const handleSaveCv = async () => {
    if (!improvedCv) {
       toast.error('No data to save.');
       return;
    }

    toast.promise(api.post('/api/v1/candidates', { 
        profile: improvedCv,
        improvedText: improvedText,
    }), {
      loading: 'Saving to database...',
      success: 'Profile saved successfully!',
      error: 'Error saving the profile.',
    });
  };

  // 3. Export to PDF
  const handleExportPdf = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: `Improved_CV_${improvedCv?.candidateName || 'Candidate'}`,
    onAfterPrint: () => toast.success('Document generated'),
    onPrintError: () => toast.error('Error generating the document'),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <RateLimitModal
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        onLogin={() => {
          setIsLoggedIn(true); 
          setShowLimitModal(false);
          toast.success('Logged in successfully! You can now continue.');
        }}
      />
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            AI CV Optimizer & Interview Prep
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your CV, tell us the target company and role. Our AI will rewrite your profile and prepare you to ace the interview.
          </p>
          
          {/* <div className="flex justify-center mt-4">
            <label className="flex items-center cursor-pointer text-xs text-slate-400 gap-2">
              <input 
                type="checkbox" 
                checked={isLoggedIn} 
                onChange={(e) => setIsLoggedIn(e.target.checked)}
                className="rounded border-gray-300"
              />
              Simulate logged-in user
            </label>
          </div> */}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* === LEFT COLUMN: INPUTS === */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            
            {/* 1. Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Upload your CV
              </h2>
              <FileUpload onFileUpload={handleFileSelect} />
              
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg flex items-center justify-between">
                  <span className="truncate font-medium flex-1 mr-2">{file.name}</span>
                  <span className="text-xs font-bold uppercase tracking-wide bg-white px-2 py-1 rounded">Ready</span>
                </div>
              )}
            </div>

            {/* 2. Company */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                 Target Company (Optional)
              </h2>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow"
                placeholder="e.g., Barclays, Amazon, Best Egg..."
              />
            </div>

            {/* 3. Job Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                 Job Description (Optional)
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none transition-shadow"
                placeholder="Paste the requirements here to adapt your CV and find courses..."
              />
            </div>

            {/* 4. Action Button */}
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>Generate Strategy</span>
                </>
              )}
            </button>
          </div>

          {/* === RIGHT COLUMN: RESULTS === */}
          <div className="lg:col-span-8">
            
            {/* Empty State */}
            {!improvedCv && !isLoading && (
              <div className="h-[600px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-slate-400">
                <FileText className="w-20 h-20 mb-6 opacity-20" />
                <p className="text-lg font-medium">Upload your CV to start</p>
                <p className="text-sm opacity-70 text-center mt-2 max-w-sm">Artificial intelligence will extract your data, rewrite your profile, and create a personalized interview plan.</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
              </div>
            )}

            {/* Success State (Results) */}
            {improvedCv && !isLoading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* TOP TOOLBAR */}
                <div className="flex flex-col xl:flex-row items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-200 gap-4 sticky top-6 z-10">
                  
                  {/* View Selector */}
                  <div className="flex p-1 bg-slate-100 rounded-lg w-full xl:w-auto overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                        activeTab === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Eye className="w-4 h-4" /> <span>Preview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                        activeTab === 'edit' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <PenTool className="w-4 h-4" /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('prep')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                        activeTab === 'prep' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-indigo-600" /> <span className="text-indigo-900">Interview & Courses</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                        activeTab === 'raw' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> <span>JSON</span>
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full xl:w-auto">
                    {isLoggedIn && (
                        <button
                          onClick={handleSaveCv}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                    )}
                    <button
                      onClick={() => handleExportPdf()}
                      className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px]">
                  
                  {/* 1. PREVIEW VIEW (Printable) */}
                  <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                    <div className="p-4 md:p-8 bg-slate-100 overflow-x-auto">
                      <ResumePreview ref={componentRef} data={improvedCv} />
                    </div>
                  </div>

                  {/* 2. EDIT VIEW */}
                  {activeTab === 'edit' && (
                    <div className="p-6 md:p-8 animate-in fade-in duration-300">
                       <div className="mb-6 pb-4 border-b border-slate-100">
                          <h3 className="text-xl font-bold text-slate-800">Profile Editor</h3>
                          <p className="text-sm text-slate-500">Correct any information before saving.</p>
                       </div>
                       <EditableProfileForm profile={improvedCv} setProfile={setImprovedCv} />
                    </div>
                  )}

                  {/* 3. INTERVIEW PREPARATION VIEW */}
                  {activeTab === 'prep' && interviewPrep && (
                    <div className="p-6 md:p-8 animate-in fade-in duration-300 bg-slate-50">
                      
                      {/* Analysis Header */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
                        <div>
                           <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                              <Target className="w-6 h-6 text-indigo-600" /> Action Plan
                           </h3>
                           <p className="text-slate-500 mt-1">Analysis based on your CV and job requirements.</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 font-semibold flex items-center gap-2">
                              Estimated Seniority: <span className="bg-white px-2 py-0.5 rounded text-indigo-900 shadow-sm">{interviewPrep.seniorityLevel}</span>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         
                         {/* Company Insights */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <Building2 className="w-5 h-5 text-blue-600" /> Company Information
                            </h4>
                            {!interviewPrep.companyInfoFound && (
                               <div className="mb-3 flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
                                  <AlertCircle className="w-5 h-5 shrink-0" />
                                  <p>No specific recent data found online for this company. Showing general industry advice.</p>
                               </div>
                            )}
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                               {interviewPrep.companyInsights}
                            </p>
                         </div>

                         {/* Readiness & Gaps */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <Lightbulb className="w-5 h-5 text-amber-500" /> Skill Diagnosis
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                               {interviewPrep.interviewReadiness}
                            </p>
                         </div>

                         {/* Interview Questions */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 xl:col-span-2">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                               <HelpCircle className="w-5 h-5 text-purple-600" /> Potential Interview Questions
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                               {interviewPrep.potentialQuestions.map((q, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                                     <div className="w-6 h-6 shrink-0 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                        {idx + 1}
                                     </div>
                                     <p className="text-sm text-slate-700 font-medium">{q}</p>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Recommended Courses */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 xl:col-span-2">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                               <BookOpen className="w-5 h-5 text-green-600" /> Recommended Strategic Courses
                            </h4>
                            
                            {interviewPrep.recommendedCourses.length === 0 ? (
                               <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-md text-sm border border-green-200">
                                  <CheckCircle2 className="w-5 h-5" />
                                  Your profile covers all critical requirements detected. You are ready!
                               </div>
                            ) : (
                               <div className="grid md:grid-cols-2 gap-6">
                                  {interviewPrep.recommendedCourses.map((course, idx) => (
                                     <div key={idx} className="flex flex-col p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-300 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                           <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded">
                                              Gap: {course.skill}
                                           </span>
                                           <span className="text-xs font-medium text-slate-500">{course.platform}</span>
                                        </div>
                                        <h5 className="font-bold text-slate-800 text-base mb-2 group-hover:text-green-700 transition-colors">
                                           {course.title}
                                        </h5>
                                        <p className="text-sm text-slate-600 mb-4 flex-grow italic">
                                           "{course.reason}"
                                        </p>
                                        {course.url && course.url !== 'null' && (
                                           <a 
                                              href={course.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="mt-auto inline-flex items-center justify-center w-full py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-green-700 transition-all"
                                           >
                                              View Course
                                           </a>
                                        )}
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>

                      </div>
                    </div>
                  )}

                  {/* 4. RAW VIEW (JSON) */}
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