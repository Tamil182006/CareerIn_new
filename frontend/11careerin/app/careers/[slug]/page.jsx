'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthGuard } from '../../lib/authGuard';
import { getCareerById, generateRoadmap, getProgress, toggleProgress } from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CareerDetailPage() {
  const { user, token, loading: authLoading } = useAuthGuard();
  const params = useParams();
  const router = useRouter();

  const [career, setCareer] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [aiReasoning, setAiReasoning] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Fetch progress right away
  useEffect(() => {
    if (!token || !params.slug) return;
    const fetchProgress = async () => {
      try {
        const data = await getProgress(token, params.slug);
        setCompletedSteps(data.completedSteps || []);
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    };
    fetchProgress();
  }, [token, params.slug]);

  const handleToggleStep = async (stepIndex) => {
    // Optimistic UI update
    const isCompleted = completedSteps.includes(stepIndex);
    if (isCompleted) {
      setCompletedSteps(prev => prev.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps(prev => [...prev, stepIndex]);
    }
    
    // Background API sync
    try {
      await toggleProgress(token, params.slug, stepIndex);
    } catch (err) {
      toast.error('Failed to save progress. Disconnected.');
      // Revert on fail
      if (isCompleted) {
         setCompletedSteps(prev => [...prev, stepIndex]);
      } else {
         setCompletedSteps(prev => prev.filter(i => i !== stepIndex));
      }
    }
  };

  // 1. Fetch base career details instantly
  useEffect(() => {
    if (!params.slug) return;

    const fetchBaseData = async () => {
      try {
        const { career } = await getCareerById(params.slug);
        setCareer(career);
      } catch (err) {
        toast.error("Career not found");
        router.push('/careers');
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, [params.slug, router]);

  // 2. Trigger Gemini AI Roadmap Generation once user is confirmed
  useEffect(() => {
    if (!token || !user || !params.slug) return;

    const fetchAIRoadmap = async () => {
      setGeneratingAI(true);
      try {
        const data = await generateRoadmap(token, params.slug, user.skillLevel || 'beginner');
        // If the backend falls back because no API key is present, it tells us.
        if (data.fallback) {
          console.log("Using static database roadmap (No Gemini/Groq Key configured yet)");
        }
        setRoadmap(data.roadmap || []);
        setAiReasoning(data.aiReasoning || "");
      } catch (error) {
        console.error("AI Generation failed, falling back to static data if available", error);
        // Fallback to static career roadmap from phase 1 if Gemini fails
        if (career?.roadmap) {
          setRoadmap(career.roadmap);
        }
      } finally {
        setGeneratingAI(false);
      }
    };

    fetchAIRoadmap();
  }, [token, user, params.slug, career]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 pt-10 px-8 max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded mb-8"></div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-48 w-full flex items-start gap-4">
           <div className="h-16 w-16 bg-slate-200 rounded-2xl shrink-0"></div>
           <div className="w-full space-y-4">
             <div className="h-8 w-1/2 bg-slate-200 rounded"></div>
             <div className="h-4 w-full bg-slate-200 rounded"></div>
             <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  if (!career) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumb Navigation Flow */}
        <nav className="text-sm font-semibold text-slate-400 mb-8 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <Link href="/careers" className="hover:text-slate-900 transition-colors">Explore Paths</Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 font-bold">{career.title}</span>
        </nav>

        {/* Career Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-start gap-4 flex-col sm:flex-row mb-6">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0">
              {career.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{career.title}</h1>
              <p className="text-slate-600 leading-relaxed text-lg">
                {career.description}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Average Salary</p>
              <p className="font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded inline-block">
                {career.salary}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Key Skills Required</p>
              <div className="flex flex-wrap gap-2">
                {career.skills.map((skill, i) => (
                  <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Timeline Section */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold">Your Personalized Roadmap</h2>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{user?.skillLevel || 'Beginner'} Level</span>
              </div>
              {roadmap.length > 0 && (
                <div className="w-48">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((completedSteps.length / roadmap.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(completedSteps.length / roadmap.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {generatingAI ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
              {/* Pulse Animation mimicking AI thinking */}
              <div className="relative flex justify-center items-center h-16 w-16 mb-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-10 w-10 bg-indigo-600 justify-center items-center text-white text-xl">🤖</div>
              </div>
              <p className="text-lg font-medium text-slate-800">Agent Groq is writing your custom timeline...</p>
              <p className="text-sm text-slate-400">Reviewing your resume and scaling the curriculum for an {user?.skillLevel || 'beginner'}...</p>
            </div>
          ) : (
            <div>
              {/* The AI Reasoning Block */}
              {aiReasoning && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm mb-12 transform transition-all duration-500 ease-out hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl animate-bounce">🧠</div>
                    <div>
                      <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Why this roadmap?</h3>
                      <p className="text-indigo-800 leading-relaxed font-medium">{aiReasoning}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-10">
                {roadmap.map((stepData, index) => (
                  <div key={index} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1 bg-slate-900 h-4 w-4 rounded-full ring-4 ring-white" />

                     {/* Content Box */}
                    <div className={`bg-white p-6 rounded-xl border ${completedSteps.includes(index) ? 'border-green-200 bg-green-50/10' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Step {stepData.step || (index + 1)}
                        </div>
                        <div className="flex items-center gap-3">
                          {stepData.duration && (
                            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              ⏱ {stepData.duration}
                            </div>
                          )}
                          <button 
                            onClick={() => handleToggleStep(index)}
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                              completedSteps.includes(index) 
                                ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                                : 'bg-slate-50 border-slate-300 text-transparent hover:border-green-400'
                            }`}
                            title={completedSteps.includes(index) ? "Mark as incomplete" : "Mark as completed"}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                        </div>
                      </div>

                      <h3 className={`text-xl font-bold mb-2 transition-colors ${completedSteps.includes(index) ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {stepData.title}
                      </h3>
                      <p className={`leading-relaxed text-sm md:text-base mb-4 transition-colors ${completedSteps.includes(index) ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stepData.desc}
                      </p>

                      {stepData.advancedTip && (
                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
                          <strong>Pro Tip:</strong> {stepData.advancedTip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
