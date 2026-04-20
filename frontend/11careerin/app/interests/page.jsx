'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';
import { uploadResume } from '../services/api';
import toast from 'react-hot-toast';

export default function OnboardingWizard() {
  const { user, token, loading } = useAuthGuard();
  const { updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState(null); 
  const fileInputRef = useRef(null);

  // ── Step 1 Handlers ────────────────────────────────────────────────────────
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadResume(token, file);
      setExtractedData(response); 
      toast.success(`Resume completely analyzed!`);
      
      // Update global context silently with parsed skills and ATS Score
      updateUser({ 
        extractedSkills: response.skillsFound, 
        skillLevel: response.levelDetermined,
        resumeParsedData: response.parsedData,
        resumeAtsScore: response.atsScore,
        resumeFeedback: response.analysis
      });

      // Move instantly to Report Card Mode
      setStep(2);
    } catch (err) {
      toast.error('Failed to parse resume perfectly. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const proceedToDashboard = () => {
     router.push('/dashboard');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-10">
        
        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
        </div>

        {/* STEP 1: RESUME UPLOAD */}
        {step === 1 && (
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome, {user.name?.split(' ')[0]}!</h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Let's map out your career. Upload your resume and our AI will instantly extract your existing skills and determine your exact level.
            </p>

            {/* Drag & Drop Zone */}
            <div 
              onDragEnter={handleDrag} 
              onDragLeave={handleDrag} 
              onDragOver={handleDrag} 
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-3 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4
                ${dragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <div>
                <p className="text-xl font-semibold text-slate-700">
                  {file ? file.name : "Drag & Drop your Resume"}
                </p>
                <p className="text-slate-500 mt-2 text-sm">
                  {file ? "Click to change file" : "or click to browse (.pdf only)"}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleUploadResume}
                disabled={!file || isUploading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md flex items-center justify-center gap-3"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Analyzing AI...
                  </>
                ) : (
                  <>Analyze My Resume &rarr;</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI RESUME REPORT CARD */}
        {step === 2 && extractedData && (
          <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block mb-2 border border-emerald-200">✅ ANALYSIS COMPLETE</span>
              <h1 className="text-4xl font-bold text-slate-900">Your Resume Intelligence Report</h1>
              <p className="text-lg text-slate-600">We algorithmically graded your profile and utilized Groq AI to map your highest-potential future.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Algorithmic ATS Score */}
               <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Algorithmic ATS Grade</h3>
                  <div className={`text-6xl font-black mb-2 ${extractedData.atsScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {extractedData.atsScore}
                  </div>
                  <p className="text-slate-300 text-sm">out of 100 points</p>
               </div>

               {/* AI Strengths & Weaknesses */}
               <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <span className="text-emerald-500">🚀</span> Core Strengths
                     </h3>
                     <p className="text-slate-600 leading-relaxed text-sm">
                        {extractedData.analysis?.strengths || "Strong baseline profile with general technical competency."}
                     </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <span className="text-amber-500">🔻</span> Missing Skills / Weaknesses
                     </h3>
                     <p className="text-slate-600 leading-relaxed text-sm">
                        {extractedData.analysis?.weaknesses || "Consider broadening your technical stack to improve versatility."}
                     </p>
                  </div>
               </div>
            </div>

            {/* Recommended Future Paths */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
               <h3 className="text-xl font-bold text-slate-900 mb-6">AI Recommended Career Trajectories</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(extractedData.analysis?.recommendedCareers || []).map((career, i) => (
                     <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                        <span className="block text-2xl mb-2">🎯</span>
                        <span className="font-bold text-indigo-900 text-sm">{career}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={proceedToDashboard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-md hover:shadow-lg text-lg flex items-center gap-3"
              >
                Accept Insights & Proceed to Dashboard ➔
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
