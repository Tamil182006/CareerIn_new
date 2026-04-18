'use client';

import { useAuthGuard } from '../lib/authGuard';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuthGuard();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
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
            <Link href="/interests" className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
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
            <Link href="/careers" className="bg-slate-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              Explore Paths
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resume</p>
            <p className="text-sm font-bold text-slate-900">{user.extractedSkills?.length ? 'Parsed' : 'Pending'}</p>
          </div>
          <span className="text-2xl">📄</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Goal</p>
            <p className="text-sm font-bold text-slate-900">{user.goal || 'Not Set'}</p>
          </div>
          <span className="text-2xl">🎯</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Skills</p>
            <p className="text-sm font-bold text-slate-900">{user.extractedSkills?.length || 0} Identified</p>
          </div>
          <span className="text-2xl">✨</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profile</p>
            <p className="text-sm font-bold text-slate-900">{user.extractedSkills?.length ? 'Complete' : 'Incomplete'}</p>
          </div>
          <span className="text-2xl">👤</span>
        </div>
      </div>

    </div>
  );
}
