import React from "react";
import { Shield, BrainCircuit, Activity, BookOpen, AlertTriangle, Users, Award, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-premium-dark flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md bg-slate-950/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              VanguardProctor
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">Architecture</a>
            <a href="#docs" className="hover:text-indigo-400 transition-colors">API Reference</a>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-16 justify-center">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 w-fit">
              <BrainCircuit className="w-4 h-4" />
              Intelligent Performance Evaluation
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Secure Exams. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                Uncompromising Integrity.
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              VanguardProctor utilizes multi-modal AI tracking, keyboard/tab locking, and semantic evaluation to conduct high-fidelity online testing with fully automated analysis.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/docs"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 duration-200"
              >
                Explore API Docs
                <BookOpen className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 font-medium rounded-xl border border-white/10 transition-all hover:-translate-y-0.5 duration-200"
              >
                Features List
              </a>
            </div>
          </div>

          {/* Right Hero Interactive Mock */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-3xl" />
            <div className="relative border border-white/10 rounded-2xl bg-slate-900/60 backdrop-blur-md p-6 flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="font-semibold text-white text-sm">Proctor Console</span>
                <span className="text-xs text-slate-400">Live Session Stats</span>
              </div>

              {/* Grid Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="text-slate-400 text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    API Health
                  </div>
                  <div className="text-lg font-bold text-white">99.9%</div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="text-slate-400 text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    Active Exams
                  </div>
                  <div className="text-lg font-bold text-white">0</div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="text-slate-400 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Violations
                  </div>
                  <div className="text-lg font-bold text-white">0.0%</div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <div className="text-slate-400 text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Grading Queue
                  </div>
                  <div className="text-lg font-bold text-white">Idle</div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200/80 leading-relaxed">
                  <strong>Ready for Deployment:</strong> Project structure is initialized successfully with Docker, FastAPI Backend, and Next.js Frontend.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="py-8 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-white">Built-in Structural Layouts</h2>
            <p className="text-slate-400 text-sm">
              We have structured the template directories to fit production requirements cleanly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white">Repository Pattern</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Clean separation between data access layer and service layer, allowing mock databases during unit tests.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white">Pydantic & SQLAlchemy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Async database connection engines using SQLAlchemy 2.0 and strict serialization models powered by Pydantic v2.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white">Docker Orchestration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Docker Compose automatically configures internal networking for PostgreSQL, Backend API, and Next.js Client.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VanguardProctor. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
