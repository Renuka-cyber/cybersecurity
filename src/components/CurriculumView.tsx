import React, { useState } from 'react';
import { Subject, AcademicYear, StudyNote } from '../types';
import { BookOpen, FileText, CheckCircle2, ChevronDown, ChevronUp, UploadCloud, Search } from 'lucide-react';

interface CurriculumViewProps {
  years: AcademicYear[];
  subjects: Subject[];
  notes: StudyNote[];
  onSelectSubject: (subject: Subject) => void;
  onOpenUploadModal: (subjectId?: string) => void;
  isAdmin?: boolean;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  years,
  subjects,
  notes,
  onSelectSubject,
  onOpenUploadModal,
  isAdmin = false,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(0); // 0 = all
  const [search, setSearch] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const filteredSubjects = subjects.filter((s) => {
    const matchSem = selectedSemester === 0 || s.semester === selectedSemester;
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.facultyName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    return matchSem && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <BookOpen className="h-4 w-4" />
              <span>Academic Curriculum</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              B.Tech CSE (Cyber Security) Degree Curriculum
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Standardized 4-year scheme comprising 8 semesters of core computing, cryptography, and defense specializations.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => onOpenUploadModal()}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shrink-0 shadow-md shadow-cyan-500/20"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Notes</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-slate-800">
          {/* Semester pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setSelectedSemester(0)}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                selectedSemester === 0
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Semesters
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  selectedSemester === sem
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or title..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No subjects added yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? 'No courses matched your search query.'
              : 'No subjects have been configured for this semester yet. Use the department navigation or admin console to add subjects manually.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((sub) => {
          const subNotes = notes.filter((n) => n.subjectId === sub.id);
          const isExpanded = expandedSubjectId === sub.id;

          return (
            <div
              key={sub.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <span className="text-slate-400">Semester {sub.semester}</span>
                  </div>
                  <span className="font-mono text-slate-400">{sub.credits} Credits</span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sub.description}
                </p>

                <div className="mt-3 text-xs text-slate-500">
                  <span>Instructor: <strong className="text-slate-300 font-normal">{sub.facultyName}</strong></span>
                </div>

                {/* Syllabus expandable */}
                {sub.syllabusUnits && sub.syllabusUnits.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <span>Syllabus Units ({sub.syllabusUnits.length} Modules)</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-150">
                        {sub.syllabusUnits.map((unit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                            <span className="font-mono text-[10px] text-cyan-400">Unit 0{idx + 1}</span>
                            <span>{unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  {subNotes.length} Notes Available
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => onOpenUploadModal(sub.id)}
                      className="rounded-lg border border-slate-800 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                    >
                      Upload
                    </button>
                  )}
                  <button
                    onClick={() => onSelectSubject(sub)}
                    className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                  >
                    View Notes
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
