'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  FileText, 
  Target, 
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuthGuard } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardHome() {
  const { user, loading } = useAuthGuard();
  const { authLogout } = useAuth();
  const router = useRouter();
  const progress = 25;

  const handleLogout = () => {
    authLogout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-md">
            <LayoutDashboard size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">CareerIN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Let&apos;s continue building your career roadmap.
            </p>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Current Status</p>
            <p className="text-slate-700 font-semibold">Onboarding in progress</p>
          </div>
        </header>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} />
              Recommended Step
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Unlock your career insights
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Upload your resume to let our AI analyze your skills, identify gaps, and structure your personalized placement path.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
                <UploadCloud size={20} />
                Upload Resume
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-lg font-medium transition-colors">
                Learn how it works
              </button>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Resume</p>
              <p className="font-bold text-slate-900">Pending</p>
            </div>
          </div>

           <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Goal</p>
              <p className="font-bold text-slate-900">Not Set</p>
            </div>
          </div>

           <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Skills</p>
              <p className="font-bold text-slate-900">0 Identified</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="relative h-10 w-10 flex items-center justify-center">

                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-blue-600" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <span className="absolute text-xs font-bold text-slate-900">{progress}%</span>
             </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Profile</p>
              <p className="font-bold text-slate-900">Incomplete</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group">
                <div className="mb-4 h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <User size={20} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Edit Profile Details</h4>
                <p className="text-sm text-slate-500">Update your education, contact info, and personal summaries.</p>
              </button>
              <button className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group">
                <div className="mb-4 h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Target size={20} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Set Career Goal</h4>
                <p className="text-sm text-slate-500">Tell us what role you are aiming for (e.g. Full Stack Dev).</p>
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-6 flex items-start gap-4">
              <div className="text-slate-500 mt-1">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Why do I need to upload a resume?</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  CareerIN uses your resume to extract your current skill set. Without it, we can't build your gap analysis or recommend a learning path.
                </p>
              </div>
            </div>
          </section>
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Next Steps</h3>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Upload your Resume</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Required to unlock dashboard.</p>
                    <Link href="/upload" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
                      Upload now &rarr;
                    </Link>
                  </div>
                </div>
                <div className="flex gap-4 opacity-60">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex items-center justify-center"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Confirm Parsed Skills</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Verify our AI analysis.</p>
                  </div>
                </div>

       
                <div className="flex gap-4 opacity-60">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex items-center justify-center"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">View Roadmap</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Get your study plan.</p>
                  </div>
                </div>

              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  Complete these to reach <span className="font-bold text-slate-900">100% profile strength</span>.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}