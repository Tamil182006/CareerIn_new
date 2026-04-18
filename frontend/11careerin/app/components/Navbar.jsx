'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, authLogout } = useAuth();
  const pathname = usePathname();

  // Hidden on public pages or the setup wizard
  const isPublicPage = pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/interests';

  // Only render Navbar if user is logged in AND it's not a public/onboarding page
  if (isPublicPage || !user) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold h-8 w-8 rounded flex items-center justify-center shadow-inner">
                C
              </div>
              <span className="font-bold text-xl text-white tracking-tight">CareerIN</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-all ${pathname === '/dashboard' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/careers" 
              className={`text-sm font-medium transition-all ${pathname.includes('/careers') ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
            >
              Explore Paths
            </Link>
            <Link 
              href="/profile" 
              className={`text-sm font-medium transition-all ${pathname === '/profile' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
            >
               My Profile
            </Link>
            
            <span className="w-px h-4 bg-slate-700"></span>

            <button 
              onClick={authLogout}
              className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
