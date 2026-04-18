'use client';

import { useAuthGuard } from '../lib/authGuard';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuthGuard();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { resumeParsedData, extractedSkills, skillLevel } = user;
  
  // Clean fallback for when there is no parsed data yet
  if (!resumeParsedData || Object.keys(resumeParsedData).length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Resume Found</h2>
          <p className="text-slate-600 mb-8">
            You haven't uploaded a resume yet. Let our AI extract your skills to build a tailored profile!
          </p>
          <Link href="/interests" className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Upload Resume Now
          </Link>
        </div>
      </div>
    );
  }

  const basicInfo = resumeParsedData.basic_info || resumeParsedData.personal_info || {};
  const experience = resumeParsedData.experience || resumeParsedData.sections?.experience || [];
  const education = resumeParsedData.education || resumeParsedData.sections?.education || [];
  const projects = resumeParsedData.projects || resumeParsedData.sections?.projects || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Profile Card */}
        <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <span className="bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-full uppercase tracking-widest text-xs border border-indigo-200">
               {skillLevel}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl text-white font-bold shadow-inner">
               {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{basicInfo.name || user.name}</h1>
              <p className="text-slate-500 font-medium text-lg mt-1">{basicInfo.email || user.email}</p>
              {basicInfo.phone && <p className="text-slate-400 text-sm mt-1">📞 {basicInfo.phone}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Skills) */}
          <div className="space-y-8">
            {/* Skills Card */}
            <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">AI Extracted Skills</h3>
              {extractedSkills && extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No specific technical skills extracted natively.</p>
              )}
            </div>

            <Link href="/interests" className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 p-4 border border-dashed border-slate-300 shadow-sm rounded-xl text-slate-600 font-medium transition-colors">
               <span>Update Resume PDF</span>
               <span className="text-xl">➔</span>
            </Link>
          </div>

          {/* Right Column (Experience & Ed) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Experience */}
            {experience.length > 0 && (
              <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  💼 Experience
                </h3>
                <div className="space-y-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-100 pl-4">
                      <h4 className="text-lg font-bold text-slate-800">{exp.role || exp.title || "Role"}</h4>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-indigo-600 font-semibold">{exp.company || "Company"}</span>
                         {exp.dates && <span className="text-slate-400 text-sm">• {exp.dates}</span>}
                      </div>
                      {exp.description && <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  🎓 Education
                </h3>
                <div className="grid gap-4">
                  {education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-800">{edu.degree || edu.title || "Degree"}</h4>
                      <p className="text-indigo-600 text-sm font-medium">{edu.institution || edu.school || "Institution"}</p>
                      {edu.dates && <p className="text-slate-400 text-xs mt-1">{edu.dates}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  🚀 Projects
                </h3>
                <div className="grid gap-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="border border-slate-100 p-4 rounded-xl">
                      <h4 className="font-bold text-slate-800 mb-1">{proj.title || "Project Name"}</h4>
                      {proj.description && <p className="text-slate-600 text-sm">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
