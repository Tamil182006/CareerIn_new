'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '../lib/authGuard';
import { getRecommend, getCareers } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Briefcase, Filter } from 'lucide-react';

export default function CareerListPage() {
  const { user, token, loading: authLoading } = useAuthGuard();
  
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('recommended'); // 'recommended' or 'all'

  // Fetch careers when user/token are ready or when filter changes
  useEffect(() => {
    if (authLoading || !token) return;

    const fetchCareers = async () => {
      setLoading(true);
      try {
        let data;
        if (filter === 'recommended') {
          // Pass the user's interests array to get sorted matches
          data = await getRecommend(token, user?.interests || []);
        } else {
          // Fetch all careers without specific sorting
          data = await getCareers();
        }
        
        setCareers(data.careers || []);
      } catch (err) {
        toast.error('Failed to load careers. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [authLoading, token, filter, user?.interests]);

  // Utility to calculate percentage match between extracted skills and career demands
  const getMatchPercent = (careerSkills) => {
    if (!user?.extractedSkills || !user.extractedSkills.length || !careerSkills?.length) return 0;
    const userSkills = user.extractedSkills.map(s => s.toLowerCase());
    let matchCount = 0;
    careerSkills.forEach(skill => {
      const requiredSkill = skill.toLowerCase();
      // Simple substring matching to cast wider net
      if (userSkills.some(uSkill => uSkill.includes(requiredSkill) || requiredSkill.includes(uSkill))) {
        matchCount++;
      }
    });
    // Boost minimum score artificially if they have skills, capped at 100
    const rawPercent = Math.round((matchCount / careerSkills.length) * 100);
    return Math.min(rawPercent > 0 ? rawPercent + 15 : 0, 100);
  };

  // Filter the list further based on the local search query
  const filteredCareers = careers.filter(career => 
    career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    career.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Still checking user session
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation Flow */}
        <nav className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600 font-bold">Explore Paths</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Career Matches for You, {user.name?.split(' ')[0]} 🎯
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Based on your interests, we found these paths for you.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by role (e.g. Software, Manager)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all sm:text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('recommended')}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filter === 'recommended' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recommended🌟
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filter === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explore All
            </button>
          </div>
        </div>

        {/* Loading State or Career Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-64 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
                   <div className="h-6 w-16 bg-green-50 rounded-full"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-slate-100 rounded w-1/4 mb-6"></div>
                <div className="space-y-2 mt-auto">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                  <div className="flex gap-2">
                     <div className="h-6 bg-slate-200 rounded w-16"></div>
                     <div className="h-6 bg-slate-200 rounded w-20"></div>
                     <div className="h-6 bg-slate-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCareers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No careers found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or check out "Explore All".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <div key={career.slug} className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 border border-slate-200 transition-all duration-300 flex flex-col overflow-hidden group">
                
                {/* Card Top Block */}
                <div className="p-6 pb-4 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-sm">
                      {career.icon || '💼'}
                    </div>
                    {/* Dynamic Match Percent Badge */}
                    {user?.extractedSkills?.length > 0 && (
                      (() => {
                        const score = getMatchPercent(career.skills);
                        if (score > 60) {
                          return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">🔥 {score}% Match</span>;
                        } else if (score > 20) {
                          return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200">⭐ {score}% Match</span>;
                        }
                        return null;
                      })()
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 truncate" title={career.title}>
                    {career.title}
                  </h3>
                  
                  <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md mb-4">
                    {career.salary}
                  </div>
                  
                  {/* Skills Section */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {career.skills.length > 3 && (
                        <span className="text-slate-400 text-xs py-1">+{career.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
                  <Link 
                    href={`/careers/${career.slug}`}
                    className="flex justify-center items-center w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all"
                  >
                    View Roadmap <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
