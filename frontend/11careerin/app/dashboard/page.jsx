'use client';

import { useAuthGuard } from '../lib/authGuard';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuthGuard();

  if (loading || !user) {
    return (
      <div className="pt-10 px-8 pb-12 max-w-6xl mx-auto space-y-10 animate-pulse">
        <div className="flex justify-between items-start">
           <div>
             <div className="h-8 w-64 bg-slate-200 rounded-lg mb-4"></div>
             <div className="h-4 w-48 bg-slate-100 rounded"></div>
           </div>
           <div className="h-8 w-32 bg-slate-200 rounded-full"></div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-48 w-full flex flex-col justify-center gap-4">
           <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
           <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
           <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[1,2,3,4].map(i => (
             <div key={i} className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm h-24"></div>
           ))}
        </div>
      </div>
    );
  }

  // Generate fake recommendations based on user interests / parsed skills
  const topSkill = user.extractedSkills?.[0] || user.interests?.[0] || 'Tech';

  return (
    <div className="pt-10 px-8 pb-12 max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-2">Let's continue building your career roadmap.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
          <p className="text-sm font-semibold text-slate-900 border border-slate-200 bg-white px-3 py-1 rounded-full shadow-sm">
            {user.skillLevel ? 'AI Mapped • Active' : 'Onboarding in progress'}
          </p>
        </div>
      </div>

      {/* Recommended Step / Primary Action */}
      {!user.extractedSkills?.length ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4 inline-block">✨ RECOMMENDED STEP</span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock your career insights</h2>
          <p className="text-slate-600 mb-6 max-w-2xl">Upload your resume to let our AI analyze your skills, identify gaps, and structure your personalized placement path.</p>
          <div className="flex gap-4">
            <Link href="/interests" className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              Upload Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mb-4 inline-block">✅ AI SYNCED</span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your profile is optimized</h2>
          <p className="text-slate-600 mb-6 max-w-2xl">We securely analyzed your resume. Select a career path to get a custom learning roadmap mapped directly around your existing skills.</p>
          <div className="flex gap-4">
            {user.goal ? (
               <Link 
                 href={`/careers/${user.goal.toLowerCase().replace(/\s+/g, '-')}`} 
                 className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-2"
               >
                 Continue Roadmap ➔
               </Link>
            ) : (
               <Link 
                 href="/careers" 
                 className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all"
               >
                 Explore Paths
               </Link>
            )}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ATS Score</p>
            <p className={`text-sm font-bold transition-colors ${user.resumeAtsScore >= 70 ? 'text-emerald-600' : user.resumeAtsScore > 0 ? 'text-amber-500' : 'text-slate-900 group-hover:text-indigo-600'}`}>
               {user.resumeAtsScore ? `${user.resumeAtsScore}/100` : 'Pending'}
            </p>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Goal</p>
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.goal || 'Not Set'}</p>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Skills</p>
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.extractedSkills?.length || 0} Identified</p>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex items-center justify-between group">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interview</p>
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.bestInterviewScore ? `${user.bestInterviewScore}/100` : 'Pending'}</p>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform">🎤</span>
        </div>
      </div>

    </div>
  );
}
