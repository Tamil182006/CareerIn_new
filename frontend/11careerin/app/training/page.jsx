'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '../lib/authGuard';

import { generateTrainingMaterials, generateTrainingExam } from '../services/api';

export default function TrainingHubPage() {
  const { user, token, loading: authLoading } = useAuthGuard();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockResults, setMockResults] = useState(null);

  // Phase 4 Assessment States
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [examData, setExamData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [examScore, setExamScore] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic || !token) return;
    setIsGenerating(true);
    
    try {
      // Phase 2: Live Groq Connection (Scraper is Mocked on Backend)
      const payload = {
        topic,
        level: user?.skillLevel || 'Beginner',
        goal: user?.goal || 'Professional'
      };
      const response = await generateTrainingMaterials(token, payload);
      setMockResults(response.results);
    } catch (err) {
       console.error("Failed to generate materials", err);
       alert("Error pinging Groq AI.");
    } finally {
       setIsGenerating(false);
    }
  };

  const handleGenerateExam = async () => {
    if(!token || !topic) return;
    setIsExamLoading(true);
    setExamData(null);
    setExamScore(null);
    setUserAnswers({});
    try {
      const payload = { topic, level: user?.skillLevel || 'Beginner' };
      const response = await generateTrainingExam(token, payload);
      setExamData(response.exam);
    } catch(err) {
      alert("Failed to generate exam module.");
    } finally {
      setIsExamLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (examScore !== null) return; // Lock inputs once graded
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitExam = () => {
    if (!examData) return;
    if (Object.keys(userAnswers).length !== examData.length) {
      return alert("Please answer all 5 questions strictly before submitting for grading.");
    }
    let correctCount = 0;
    examData.forEach((question, index) => {
       if (userAnswers[index] === question.correctAnswerIndex) correctCount++;
    });
    setExamScore((correctCount / examData.length) * 100);
  };

  if (authLoading || !user) {
     return (
       <div className="min-h-screen bg-slate-50 py-12 px-8 max-w-4xl mx-auto space-y-8 animate-pulse">
         <div className="h-4 w-48 bg-slate-200 rounded mb-8"></div>
         <div className="h-40 w-full bg-slate-200 rounded-2xl"></div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 font-bold">Training Hub</span>
        </nav>

        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Skill Assessor</h1>
          <p className="text-slate-500 font-medium">
            Select a core concept missing from your {user.goal ? <span className="text-indigo-600 border-b border-indigo-200">{user.goal}</span> : 'current'} profile. Groq AI will instantly generate a curriculum and scrape the best live resources for you.
          </p>
        </div>

        {/* Search / Generation Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Focus Topic</label>
               <input 
                 type="text" 
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 placeholder="e.g. Python Pandas, Cloud Architecture, Next.js Routing..."
                 className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
               />
            </div>
            <button 
              type="submit"
              disabled={!topic || isGenerating}
              className="bg-slate-900 text-white font-semibold py-3 px-8 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all w-full md:w-auto shrink-0"
            >
              {isGenerating ? 'Scanning Web...' : 'Fetch Materials'}
            </button>
          </form>
        </div>

        {/* Skeleton AI Generating State */}
        {isGenerating && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Compiling Curriculum...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white h-64 border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 animate-pulse">
                  <div className="h-4 w-24 bg-slate-200 rounded-full shrink-0 mb-4"></div>
                  <div className="space-y-3 w-full">
                    <div className="h-6 bg-slate-200 rounded w-full"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                    
                    <div className="h-3 bg-slate-100 rounded w-full mt-4"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Phase 1 Results */}
        {!isGenerating && mockResults && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between pl-2">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Live Web Resources</h3>
               <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-100">Groq Assisted RAG</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResults.map((result, i) => (
                  <div key={i} className="bg-white flex flex-col rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all overflow-hidden group">
                     <div className="p-6 flex-1">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                           Resource 0{i+1}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{result.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed mt-4">{result.preview}</p>
                     </div>
                     <div className="bg-slate-50 border-t border-slate-100 p-4">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center w-full bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold py-2 px-4 rounded-xl transition-all gap-2 text-sm shadow-sm group-hover:shadow group-hover:text-indigo-600">
                          Read External Source <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                     </div>
                  </div>
                ))}
             </div>

             {/* Next Step - Assessment Teaser / Native UI */}
             {!examData && !isExamLoading && (
                <div className="mt-8 bg-indigo-900 text-white p-8 rounded-2xl shadow-md border border-indigo-700 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                   <div className="z-10">
                      <h3 className="text-xl font-bold mb-1">Ready to test your knowledge?</h3>
                      <p className="text-indigo-200 text-sm">After reviewing the resources, our AI will generate a 5-question technical exam exactly around {topic}.</p>
                   </div>
                   <button onClick={handleGenerateExam} className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl shadow-inner flex items-center gap-2 shrink-0 z-10 transition-colors">
                      Generate Assessment 🎯
                   </button>
                   <div className="text-white/10 text-9xl absolute right-12 top-[-20px] pointer-events-none">?</div>
                </div>
             )}

             {/* Exam Generating Wait State */}
             {isExamLoading && (
                <div className="mt-8 p-12 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-pulse">
                   <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                   <p className="text-slate-500 font-bold uppercase tracking-wide text-sm">AI Formulating Technical Exam...</p>
                </div>
             )}

             {/* Active Exam Block */}
             {examData && (
                <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                   <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                     <div>
                       <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full mb-3 inline-block">LIVE ASSESSMENT</span>
                       <h2 className="text-2xl font-bold text-slate-900">Knowledge Check: {topic}</h2>
                     </div>
                     {examScore !== null && (
                        <div className={`px-5 py-2.5 rounded-xl font-bold text-lg shadow-sm ${examScore >= 80 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          Score: {examScore}%
                        </div>
                     )}
                   </div>

                   <div className="space-y-8">
                      {examData.map((q, qIdx) => (
                         <div key={qIdx} className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-lg leading-relaxed"><span className="text-slate-400 mr-2">{qIdx + 1}.</span> {q.question}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                               {q.options.map((opt, oIdx) => {
                                  const isSelected = userAnswers[qIdx] === oIdx;
                                  const isCorrect = q.correctAnswerIndex === oIdx;
                                  let btnClass = "bg-slate-50 border border-slate-200 hover:border-indigo-400 text-slate-700 cursor-pointer";
                                  
                                  if (examScore === null) {
                                     if (isSelected) btnClass = "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-inner font-semibold";
                                  } else {
                                     if (isCorrect) btnClass = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm cursor-default";
                                     else if (isSelected && !isCorrect) btnClass = "bg-red-50 border-red-400 text-red-900 line-through opacity-70 cursor-default";
                                     else btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-default";
                                  }

                                  return (
                                    <button 
                                      key={oIdx}
                                      onClick={() => handleSelectAnswer(qIdx, oIdx)}
                                      disabled={examScore !== null}
                                      className={`text-left p-4 rounded-xl transition-all ${btnClass}`}
                                    >
                                      {opt}
                                    </button>
                                  )
                               })}
                            </div>
                            
                            {/* AI Explanation strictly unlocked post-grading */}
                            {examScore !== null && (
                               <div className="pl-6 pt-2 animate-in fade-in duration-700">
                                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-200 shadow-inner">
                                    <span className="font-bold text-indigo-600 mr-1">AI Explanation:</span> {q.explanation}
                                  </div>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                   
                   {examScore === null ? (
                      <button onClick={handleSubmitExam} className="mt-10 bg-indigo-600 hover:bg-indigo-700 text-white w-full py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                         Submit Exam for AI Grading
                      </button>
                   ) : (
                      <button onClick={() => { setExamData(null); setExamScore(null); setUserAnswers({}); }} className="mt-10 bg-slate-900 hover:bg-slate-800 text-white w-full py-4 rounded-xl font-bold text-lg shadow-md transition-colors">
                         Finish & Select Next Topic ➔
                      </button>
                   )}
                </div>
             )}
           </div>
        )}

      </div>
    </div>
  );
}
