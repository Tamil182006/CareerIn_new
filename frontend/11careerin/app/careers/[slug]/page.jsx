'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthGuard } from '../../lib/authGuard';
import { getCareerById, generateRoadmap } from '../../services/api';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!career) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 p-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/careers" className="text-slate-500 hover:text-slate-900 font-medium transition-colors flex items-center gap-1">
          ← Back to Careers
        </Link>
        <span className="font-bold text-lg tracking-tight">CareerIN</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Your Personalized Roadmap</h2>
            <div className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>{user?.skillLevel || 'Beginner'} Level</span>
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
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Step {stepData.step || (index + 1)}
                        </div>
                        {stepData.duration && (
                          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            ⏱ {stepData.duration}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {stepData.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-4">
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
