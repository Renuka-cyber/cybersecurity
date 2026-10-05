import React from 'react';
import { AcademicYear, Section, Subject } from '../types';
import { DEPARTMENT_HIGHLIGHTS } from '../services/db';
import {
  Shield,
  GraduationCap,
  Layers,
  ArrowRight,
  MapPin,
  Clock,
  Mail,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface HomeViewProps {
  years: AcademicYear[];
  sections: Section[];
  subjects: Subject[];
  onSelectYear: (year: AcademicYear) => void;
  onNavigateAcademics: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  years,
  sections,
  subjects,
  onSelectYear,
  onNavigateAcademics,
}) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-12 lg:p-16">
        <div className="absolute inset-0 cyber-grid-bg opacity-70 pointer-events-none" />
        
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Shield className="h-4 w-4" />
            <span>School of Computing & Cyber Defense</span>
            <span>·</span>
            <span>Academic Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white [text-wrap:balance] leading-[1.15]">
            CSE Cyber Security
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Department Portal
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Department dashboard for Computer Science & Engineering (Cyber Security).
            Navigate through academic years, explore class sections, and access semester course curricula.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateAcademics}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 active:scale-95 transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Enter Department Portal</span>
            </button>
          </div>

          {/* Quantitative Proof Metrics */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">4</span>
              <span className="block text-xs text-slate-400 mt-0.5">Academic Years</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums">8</span>
              <span className="block text-xs text-slate-400 mt-0.5">Semesters</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">{sections.length}</span>
              <span className="block text-xs text-slate-400 mt-0.5">Sections Created</span>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">{subjects.length}</span>
              <span className="block text-xs text-slate-400 mt-0.5">Subjects Added</span>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Years Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Layers className="h-4 w-4" />
              <span>Department Structure</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Academic Years
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an academic year to manage sections and view semester subjects.
            </p>
          </div>

          <button
            onClick={onNavigateAcademics}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 self-start sm:self-auto transition-colors"
          >
            <span>Open Department Flow</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {years.map((year) => {
            const yearSections = sections.filter((s) => s.yearId === year.id);
            const yearSubjects = subjects.filter((sub) => sub.yearId === year.id);

            return (
              <div
                key={year.id}
                onClick={() => onSelectYear(year)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-cyan-400">YEAR 0{year.yearNumber}</span>
                    <span className="text-xs text-slate-500">Semesters {year.semesters.join(' & ')}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {year.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {year.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Sections</span>
                    <span className="font-medium text-slate-200">
                      {yearSections.length > 0
                        ? yearSections.map((s) => s.code || s.name).join(', ')
                        : 'None (+ Add)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Subjects</span>
                    <span className="font-mono text-cyan-400 font-semibold">{yearSubjects.length}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter {year.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Department Highlights */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>Infrastructure & Laboratories</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Department Facilities & Labs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cyber defense learning environments and research centers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEPARTMENT_HIGHLIGHTS.map((hl) => (
            <div
              key={hl.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                  {hl.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                  {hl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {hl.description}
                </p>
              </div>

              {hl.metric && (
                <div className="mt-5 border-t border-slate-800/80 pt-3">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {hl.metric}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Department Info */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              Department Location
            </h4>
            <p className="leading-relaxed">
              Cyber Security Engineering Wing<br />
              College of Engineering & Technology
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Department Hours
            </h4>
            <p className="leading-relaxed">
              Monday – Friday: 08:30 AM – 05:00 PM<br />
              Cyber Range Lab: Open for Scheduled Practical Sessions
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              Department Contact
            </h4>
            <p className="leading-relaxed">
              Email: <span className="font-mono text-cyan-400">cybersec.dept@cse.college.edu</span><br />
              Academic Portal Mini Project
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-8 pb-12 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">CSE Cyber Security Department Portal</span>
          </div>
          <p>© 2026 Department of Computer Science & Engineering. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
