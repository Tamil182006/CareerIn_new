import Link from 'next/link';
import { FileText, BarChart3, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100 selection:text-slate-900">
      
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
            CareerIN
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
      <section className="pt-40 pb-24 px-6 max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Turn your resume into a <br className="hidden md:block" />
          <span className="text-slate-700">career roadmap.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and get clear insights into your skills, gaps, and placement readiness. No fluff, just strategy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            Upload Resume
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Features</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Built for clarity, not hype.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-700">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Resume Analysis</h4>
              <p className="text-slate-500 leading-relaxed">
                Instantly understand your resume&apos;s strengths and identify critical missing keywords for your target role.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-700">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Skill Dashboard</h4>
              <p className="text-slate-500 leading-relaxed">
                Track your technical readiness against real industry standards and placement criteria.
              </p>
            </div>


            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 text-slate-700">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Career Guidance</h4>
              <p className="text-slate-500 leading-relaxed">
                Get a structured path on what to learn next. Stop guessing and start preparing efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
           <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">How It Works</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Three steps to career readiness.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto bg-slate-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-slate-200">1</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Upload Resume</h4>
              <p className="text-slate-500 text-sm">Upload your PDF resume. We value your privacy and security.</p>
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto bg-white border-2 border-slate-200 text-slate-900 rounded-full flex items-center justify-center text-lg font-bold mb-6">2</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">We Analyze</h4>
              <p className="text-slate-500 text-sm">Our system parses your skills and maps them against job roles.</p>
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto bg-white border-2 border-slate-200 text-slate-900 rounded-full flex items-center justify-center text-lg font-bold mb-6">3</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Get Roadmap</h4>
              <p className="text-slate-500 text-sm">Receive a personalized dashboard with actionable next steps.</p>
            </div>
            
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-slate-100 -z-0 transform scale-x-75"></div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Why CareerIN?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-slate-700 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Student First</h4>
                <p className="text-slate-500 text-sm mt-1">Built specifically for students, freshers, and job seekers.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-slate-700 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Placement Focused</h4>
                <p className="text-slate-500 text-sm mt-1">We focus on employability, not social networking features.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-slate-700 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Zero Fluff</h4>
                <p className="text-slate-500 text-sm mt-1">No buzzwords. Just data-driven insights for your career.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-slate-700 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Structure & Clarity</h4>
                <p className="text-slate-500 text-sm mt-1">We turn the chaos of job hunting into a linear path.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
          Start building clarity in your career today.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
          >
            Upload Resume
          </Link>
          <Link 
            href="/signup" 
            className="text-slate-500 hover:text-slate-900 font-medium text-sm sm:ml-4 mt-2 sm:mt-0"
          >
            Create an account first
          </Link>
        </div>
      </section>


      <footer className="border-t border-slate-100 py-12 bg-white text-center">
        <p className="text-slate-900 font-bold mb-4">CareerIN</p>
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} CareerIN. All rights reserved.
        </p>
      </footer>
    </div>
  );
}