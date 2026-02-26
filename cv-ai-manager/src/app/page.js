import Link from "next/link";
import { ArrowRight, FileText, Target, Building2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <main className="flex flex-col items-center justify-center pt-20 pb-16 px-6 sm:pt-32 sm:pb-24">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Elevate your career with Artificial Intelligence
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Land your dream job with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              precision and confidence.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            Upload your resume, paste the job description, and tell us the target company. Our AI will rewrite your CV to match exactly what recruiters are looking for and generate a personalized interview prep guide.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <Link 
              href="/candidate"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
              Optimize My CV Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="max-w-7xl mx-auto mt-24 grid md:grid-cols-3 gap-8 px-4 animate-in fade-in duration-1000 delay-700">
          
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">1. Smart CV Rewrite</h3>
            <p className="text-slate-600 leading-relaxed">
              Stop sending generic resumes. Our AI analyzes your experience and rewrites your summary and bullet points using powerful, action-oriented language that stands out.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">2. Tailored to the Role</h3>
            <p className="text-slate-600 leading-relaxed">
              Paste the Job Description. We map your skills against the requirements, ensuring your CV gets past Applicant Tracking Systems (ATS) and catches the recruiter's eye.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">3. Interview Strategy</h3>
            <p className="text-slate-600 leading-relaxed">
              Tell us the target company. We search the web for company culture insights, potential interview questions, and recommend strategic courses to close your skill gaps.
            </p>
          </div>

        </div>

        

      </main>
    </div>
  );
}