'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';
import { updateInterests, uploadResume } from '../services/api';
import toast from 'react-hot-toast';

const INTERESTS = [
  { id: 'coding', icon: '💻', label: 'Coding & Software' },
  { id: 'design', icon: '🎨', label: 'UI/UX & Design' },
  { id: 'data', icon: '📊', label: 'Data & AI' },
  { id: 'mobile', icon: '📱', label: 'App Development' },
  { id: 'marketing', icon: '📣', label: 'Digital Marketing' },
  { id: 'business', icon: '🚀', label: 'Business & Management' },
  { id: 'gaming', icon: '🎮', label: 'Game Development' },
  { id: 'security', icon: '🔐', label: 'Cybersecurity' },
  { id: 'finance', icon: '💼', label: 'Finance & Analytics' },
  { id: 'cloud', icon: '☁️', label: 'Cloud & DevOps' }
];

export default function OnboardingWizard() {
  const { user, token, loading } = useAuthGuard();
  const { updateUser } = useAuth();
  const router = useRouter();

  // Wizard Steps
  const [step, setStep] = useState(1);
  
  // Step 1 State (Resume)
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState(null); // { levelDetermined, skillsFound }
  const fileInputRef = useRef(null);

  // Step 2 State (Interests)
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setExtractedData(response); // { levelDetermined: "Intermediate", skillsFound: [...] }
      toast.success(`Resume parsed! You were mapped as an ${response.levelDetermined}.`);
      
      // Update global context silently with parsed skills
      updateUser({ 
        extractedSkills: response.skillsFound, 
        skillLevel: response.levelDetermined 
      });

      // Move to Step 2
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse resume. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const skipToInterests = () => {
    // If they skip, default them to Beginner manually
    setExtractedData({ levelDetermined: 'beginner', skillsFound: [] });
    setStep(2);
  };

  // ── Step 2 Handlers ────────────────────────────────────────────────────────

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();

    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest to explore.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send interests + the AI determined skill level to the backend
      const skillLevel = extractedData?.levelDetermined || 'beginner';
      await updateInterests(token, selectedInterests, skillLevel);
      
      updateUser({ interests: selectedInterests, skillLevel });

      toast.success('Onboarding complete!');
      setTimeout(() => router.push('/careers'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save interests.');
    } finally {
      setIsSubmitting(false);
    }
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
              <button 
                onClick={skipToInterests}
                disabled={isUploading}
                className="text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4"
              >
                Skip this for now
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INTERESTS */}
        {step === 2 && (
          <form onSubmit={handleCompleteOnboarding} className="animate-fade-in max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">What do you want to explore?</h1>
              <p className="text-lg text-slate-600">
                {extractedData?.skillsFound?.length > 0 
                  ? `We found ${extractedData.skillsFound.length} skills! Now, select the areas you actually want to pursue.`
                  : `Select all the areas you want to explore.`}
              </p>
            </div>

            <section className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Select Interests</h2>
                  <p className="text-sm text-slate-500 mt-1">Pick at least one field.</p>
                </div>
                <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {selectedInterests.length} selected
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-3xl mb-2">{interest.icon}</span>
                      <span className={`text-sm font-medium text-center ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}>
                        {interest.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-between items-center pt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedInterests.length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md flex items-center gap-2"
              >
                {isSubmitting ? 'Saving Profile...' : 'Complete Setup 🚀'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
