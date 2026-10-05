import React from 'react';
import {
  Shield,
  Lock,
  Terminal,
  ArrowRight,
  ChevronRight,
  Layers,
  BookOpen,
  Cpu,
  Server,
  Globe,
  Sparkles,
  GraduationCap,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onExploreAcademics?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onExploreAcademics,
}) => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-12 lg:p-20">
        <div className="absolute inset-0 cyber-grid-bg opacity-75 pointer-events-none" />

        {/* Dynamic Glow Accents */}
        <div className="absolute -top-24 right-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5" />
              <span>Department of Computer Science & Engineering</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">Cyber Security</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Department of Computer Science & Engineering
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                (Cyber Security)
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Welcome to the official academic gateway of the CSE Cyber Security Department. 
              Dedicated to cultivating elite cybersecurity engineers and researchers through a structured 
              curriculum in applied cryptography, network defense, threat intelligence, and digital forensics.
            </p>

            {/* Hierarchy Badge */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Structured Academic Architecture
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-200">
                <span className="rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 text-cyan-300">1. Academic Year</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="rounded-lg bg-slate-800/80 px-2.5 py-1">2. Section</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="rounded-lg bg-slate-800/80 px-2.5 py-1">3. Semester</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="rounded-lg bg-slate-800/80 px-2.5 py-1">4. Subject</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">5. Study Notes</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-2.5 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:bg-cyan-400 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-700 hover:text-white hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
              >
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                <span>Explore Dashboard</span>
              </button>
            </div>

            {/* Academic Proof Points */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white">4</span>
                <span className="block text-xs text-slate-400 mt-0.5">Academic Years</span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400">8</span>
                <span className="block text-xs text-slate-400 mt-0.5">Semesters Scheme</span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white">Tier-1</span>
                <span className="block text-xs text-slate-400 mt-0.5">NIST & MITRE Model</span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">Isolated</span>
                <span className="block text-xs text-slate-400 mt-0.5">Live Cyber Range</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cyber Security Themed Visual / Terminal */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl p-5 space-y-4 backdrop-blur-md">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">cse-cyber-security@dept</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PORTAL SECURE
                </div>
              </div>

              {/* Security Shield Visual Badge */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">Defense-in-Depth Academics</h4>
                  <p className="text-xs text-slate-400">Strict Role-Based Access: Student & Faculty Admin</p>
                </div>
              </div>

              {/* Domain Pillars Mini Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Cryptography</span>
                  </div>
                  <p className="text-[11px] text-slate-400">PKI, AES, RSA & Hash Algorithms</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Cyber Defense</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Network Protocols & Firewalls</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Forensics</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Memory & Threat Analysis</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Server className="h-3.5 w-3.5" />
                    <span>SOC Operations</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Incident Response & SIEM</p>
                </div>
              </div>

              {/* Command Prompt Line */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-3 font-mono text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-cyan-400 font-bold">$</span>
                  <span className="text-slate-300">init_department_portal --view=home</span>
                </div>
                <button
                  onClick={onGetStarted}
                  className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                >
                  RUN &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Department Pillars Overview */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>Academic Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Specialized Computing & Cyber Security Curriculum
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Our degree program combines core computer science engineering rigor with intensive, practical defense capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">4-Year Degree Pathway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Progressive course matrix across 8 academic terms starting from basic programming to advanced defensive threat intelligence.
            </p>
            <div className="pt-2 text-xs font-medium text-cyan-400 flex items-center gap-1">
              <span>Year 1 through Year 4</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Structured Study Resources</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lecture handbooks, syllabus modules, and verified course materials mapped directly to subject course codes and semesters.
            </p>
            <div className="pt-2 text-xs font-medium text-cyan-400 flex items-center gap-1">
              <span>PDF, DOCX, PPTX & Media</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Protected Access & Hierarchy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict access controls ensure students have focused read & download privileges while authorized faculty manage academic data.
            </p>
            <div className="pt-2 text-xs font-medium text-cyan-400 flex items-center gap-1">
              <span>Zero-Trust Academic Governance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/40 p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to explore department academics?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enter the department portal to select your academic year, browse class sections, view semester subjects, and download study notes.
          </p>
          <div className="pt-3">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:bg-cyan-400 active:scale-95 transition-all"
            >
              <span>Explore Department Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Department Footer */}
      <footer className="border-t border-slate-800 pt-8 pb-12 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">
              Department of Computer Science & Engineering (Cyber Security)
            </span>
          </div>
          <p>© 2026 Renuka-Varunya</p>
        </div>
      </footer>
    </div>
  );
};
