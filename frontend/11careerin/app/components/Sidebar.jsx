'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, authLogout } = useAuth();
  const pathname = usePathname();

  const isPublicPage = pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/interests';

  if (isPublicPage || !user) return null;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 sticky top-0 flex flex-col pt-8 pb-6 px-6">
      {/* Brand logo */}
      <div className="mb-12">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-slate-900 text-white font-bold h-10 w-10 flex items-center justify-center rounded-lg text-lg">
            C
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">CareerIN</span>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-2">
        <Link 
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            pathname === '/dashboard' 
              ? 'bg-slate-100 text-slate-900' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg">📊</span>
          Dashboard
        </Link>
        <Link 
          href="/careers"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            pathname.includes('/careers') 
              ? 'bg-slate-100 text-slate-900' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg">🧭</span>
          Explore Paths
        </Link>
        <Link 
          href="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
            pathname === '/profile' 
              ? 'bg-slate-100 text-slate-900' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="text-lg">📄</span>
          My Profile
        </Link>
      </nav>

      {/* User profile & logout pinned to bottom */}
      <div className="mt-auto border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate max-w-[100px]">{user?.skillLevel || 'Student'}</p>
            </div>
          </div>
          <button 
            onClick={authLogout} 
            title="Log Out"
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
