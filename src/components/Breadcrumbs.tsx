import React from 'react';
import { AcademicYear, Section, Semester, Subject } from '../types';
import { ChevronRight, Home, Shield, RotateCcw } from 'lucide-react';

interface BreadcrumbsProps {
  selectedYear: AcademicYear | null;
  selectedSection: Section | null;
  selectedSemester: Semester | null;
  selectedSubject: Subject | null;
  onNavigateHome: () => void;
  onSelectYear: (year: AcademicYear | null) => void;
  onSelectSection: (section: Section | null) => void;
  onSelectSemester: (semester: Semester | null) => void;
  onSelectSubject: (subject: Subject | null) => void;
  onResetNavigation: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  selectedYear,
  selectedSection,
  selectedSemester,
  selectedSubject,
  onNavigateHome,
  onSelectYear,
  onSelectSection,
  onSelectSemester,
  onSelectSubject,
  onResetNavigation,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5 sm:px-6 text-xs">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-slate-400">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          title="Go to Department Home"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>

        <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

        <button
          onClick={() => {
            onSelectSubject(null);
            onSelectSemester(null);
            onSelectSection(null);
            onSelectYear(null);
          }}
          className={`hover:text-cyan-400 transition-colors ${
            !selectedYear ? 'font-semibold text-cyan-400' : ''
          }`}
        >
          Department
        </button>

        {selectedYear && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => {
                onSelectSubject(null);
                onSelectSemester(null);
                onSelectSection(null);
              }}
              className={`hover:text-cyan-400 transition-colors ${
                !selectedSection ? 'font-semibold text-cyan-400' : ''
              }`}
            >
              {selectedYear.name}
            </button>
          </>
        )}

        {selectedSection && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => {
                onSelectSubject(null);
                onSelectSemester(null);
              }}
              className={`hover:text-cyan-400 transition-colors ${
                !selectedSemester ? 'font-semibold text-cyan-400' : ''
              }`}
            >
              {selectedSection.name}
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => onSelectSubject(null)}
              className={`hover:text-cyan-400 transition-colors ${
                !selectedSubject ? 'font-semibold text-cyan-400' : ''
              }`}
            >
              {selectedSemester.title}
            </button>
          </>
        )}

        {selectedSubject && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="font-semibold text-cyan-400 font-mono">
              {selectedSubject.code}: {selectedSubject.name}
            </span>
          </>
        )}
      </nav>

      {(selectedYear || selectedSection || selectedSemester || selectedSubject) && (
        <button
          onClick={onResetNavigation}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
          title="Reset flow to 1st step"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Flow</span>
        </button>
      )}
    </div>
  );
};
