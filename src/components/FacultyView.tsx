import React from 'react';
import { Subject } from '../types';
import { Mail, MapPin, Terminal, Cpu, Server, User, BookOpen } from 'lucide-react';

interface FacultyViewProps {
  subjects: Subject[];
}

export const FacultyView: React.FC<FacultyViewProps> = ({ subjects }) => {
  // Aggregate faculty from subjects added by user
  const facultyMap = new Map<string, { name: string; subjects: Subject[] }>();

  subjects.forEach((sub) => {
    if (sub.facultyName && sub.facultyName.trim()) {
      const name = sub.facultyName.trim();
      const existing = facultyMap.get(name);
      if (existing) {
        existing.subjects.push(sub);
      } else {
        facultyMap.set(name, { name, subjects: [sub] });
      }
    }
  });

  const facultyList = Array.from(facultyMap.values());

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Terminal className="h-4 w-4" />
          <span>Faculty & Research Infrastructure</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Faculty Directory & Advanced Cybersecurity Laboratories
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          The Department of Computer Science & Engineering (Cyber Security) comprises dedicated academicians, 
          security researchers, and course coordinators instructing the curriculum.
        </p>
      </div>

      {/* Faculty Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Faculty In-Charge</h2>
        
        {facultyList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
            <User className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-bold text-white">No faculty members listed yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Faculty members are populated when you manually add subjects with their assigned faculty in-charge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map((faculty, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 font-bold text-base">
                      {faculty.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{faculty.name}</h3>
                      <p className="text-xs text-slate-400">Course Faculty</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                      <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Assigned Subject(s)
                      </span>
                      <div className="space-y-1">
                        {faculty.subjects.map((s) => (
                          <div key={s.id} className="flex items-center gap-2 text-slate-200">
                            <span className="font-mono text-cyan-400 font-bold">{s.code}</span>
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Department Faculty</span>
                  <span className="text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Department Laboratories */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Specialized Cyber Security Laboratories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <Server className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Live Cyber Range & SOC Simulation Facility</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with high-performance workstations connected to an isolated virtualization cluster. 
              Students execute simulated cyber defense drills, deploy intrusion detection systems, 
              and analyze live security telemetry.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-cyan-300 font-mono">
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">High-End Workstations</span>
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Isolated Sandbox</span>
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">SOC Operations</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <Cpu className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Digital Forensics & Malware Analysis Center</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Specialized hardware write-blockers, forensic disk imaging, and memory inspection environment.
              Includes air-gapped sandboxes for reverse engineering and vulnerability research.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-cyan-300 font-mono">
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Forensics Hardware</span>
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Memory Forensics</span>
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Malware Sandboxes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
