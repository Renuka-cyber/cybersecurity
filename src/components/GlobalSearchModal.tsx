import React, { useState, useMemo } from 'react';
import { Subject, StudyNote, AcademicYear } from '../types';
import { Search, X, BookOpen, FileText, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  notes: StudyNote[];
  years: AcademicYear[];
  onSelectSubject: (subject: Subject) => void;
  onSelectNote: (note: StudyNote, subject?: Subject) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  subjects,
  notes,
  years,
  onSelectSubject,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');

  const filteredSubjects = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.facultyName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [query, subjects]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.fileName.toLowerCase().includes(q) ||
        n.unit.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        n.uploadedBy.toLowerCase().includes(q)
    );
  }, [query, notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 bg-slate-950">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects by name or code, or search study notes..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>Type keywords to search across all Academic Years, Semesters, Subjects & Notes.</p>
              {subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {subjects.slice(0, 5).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setQuery(sub.code)}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                    >
                      {sub.code} - {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : filteredSubjects.length === 0 && filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <p>No subjects or notes found matching &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by subject name or code.</p>
            </div>
          ) : (
            <>
              {/* Subjects Matches */}
              {filteredSubjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center justify-between">
                    <span>Subjects ({filteredSubjects.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {filteredSubjects.map((sub) => {
                      const year = years.find((y) => y.id === sub.yearId);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            onSelectSubject(sub);
                            onClose();
                          }}
                          className="group flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-800/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-mono text-cyan-400 font-semibold">{sub.code}</span>
                                <span>·</span>
                                <span>Semester {sub.semester}</span>
                                <span>·</span>
                                <span>{year?.name}</span>
                              </div>
                              <h5 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                                {sub.name}
                              </h5>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes Matches */}
              {filteredNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5">
                    Study Notes & Materials ({filteredNotes.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filteredNotes.map((note) => {
                      const sub = subjects.find((s) => s.id === note.subjectId);
                      return (
                        <div
                          key={note.id}
                          onClick={() => {
                            onSelectNote(note, sub);
                            onClose();
                          }}
                          className="group flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-800/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/60 text-blue-400 border border-blue-500/20">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-mono text-cyan-400 font-semibold">{sub?.code || 'NOTE'}</span>
                                <span>·</span>
                                <span>{note.unit}</span>
                                <span>·</span>
                                <span className="uppercase">{note.fileType}</span>
                                <span>·</span>
                                <span>{note.fileSize}</span>
                              </div>
                              <h5 className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                                {note.title}
                              </h5>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
