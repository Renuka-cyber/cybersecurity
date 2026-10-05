import React, { useState, useMemo } from 'react';
import { AcademicYear, Section, Semester, Subject, StudyNote, NoteType } from '../types';
import { db } from '../services/db';
import { downloadStudyNote } from '../utils/fileDownloader';
import { useToast } from './Toast';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Calendar,
  Layers,
  BookOpen,
  FileText,
  Download,
  Eye,
  UploadCloud,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  File,
  Image,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface StudentInterfaceProps {
  years: AcademicYear[];
  sections: Section[];
  semesters: Semester[];
  subjects: Subject[];
  notes: StudyNote[];
  selectedYear: AcademicYear | null;
  selectedSection: Section | null;
  selectedSemester: Semester | null;
  selectedSubject: Subject | null;
  onSelectYear: (year: AcademicYear | null) => void;
  onSelectSection: (section: Section | null) => void;
  onSelectSemester: (semester: Semester | null) => void;
  onSelectSubject: (subject: Subject | null) => void;
  onOpenUploadModal: (subjectId?: string) => void;
  onOpenPreviewModal: (note: StudyNote, subject?: Subject) => void;
  onDataChanged: () => void;
  isAdmin?: boolean;
}

export const StudentInterface: React.FC<StudentInterfaceProps> = ({
  years,
  sections,
  semesters,
  subjects,
  notes,
  selectedYear,
  selectedSection,
  selectedSemester,
  selectedSubject,
  onSelectYear,
  onSelectSection,
  onSelectSemester,
  onSelectSubject,
  onOpenUploadModal,
  onOpenPreviewModal,
  onDataChanged,
  isAdmin = false,
}) => {
  const { showToast } = useToast();
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');

  // 1. Manual Section Modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionNameInput, setSectionNameInput] = useState('');
  const [sectionCodeInput, setSectionCodeInput] = useState('');
  const [sectionAdvisorInput, setSectionAdvisorInput] = useState('');
  const [sectionRoomInput, setSectionRoomInput] = useState('');

  // 2. Manual Subject Modal state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectNameInput, setSubjectNameInput] = useState('');
  const [subjectCodeInput, setSubjectCodeInput] = useState('');
  const [subjectCreditsInput, setSubjectCreditsInput] = useState<number>(4);
  const [subjectFacultyInput, setSubjectFacultyInput] = useState('');
  const [subjectDescriptionInput, setSubjectDescriptionInput] = useState('');

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    type: 'Section' | 'Subject' | 'Note';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter sections for the selected year
  const availableSections = useMemo(() => {
    if (!selectedYear) return [];
    return sections.filter((s) => s.yearId === selectedYear.id);
  }, [sections, selectedYear]);

  // Filter semesters for the selected year
  const availableSemesters = useMemo(() => {
    if (!selectedYear) return [];
    return semesters.filter((sem) => sem.yearId === selectedYear.id);
  }, [semesters, selectedYear]);

  // Filter subjects for the selected semester
  const availableSubjects = useMemo(() => {
    if (!selectedSemester) return [];
    return subjects.filter((sub) => sub.semester === selectedSemester.number);
  }, [subjects, selectedSemester]);

  // Filter notes for the selected subject
  const currentSubjectNotes = useMemo(() => {
    if (!selectedSubject) return [];
    return notes.filter((n) => n.subjectId === selectedSubject.id);
  }, [notes, selectedSubject]);

  const displayedNotes = useMemo(() => {
    return currentSubjectNotes.filter((note) => {
      const q = noteSearchQuery.toLowerCase();
      return (
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.fileName.toLowerCase().includes(q) ||
        note.uploadedBy.toLowerCase().includes(q) ||
        (note.description && note.description.toLowerCase().includes(q))
      );
    });
  }, [currentSubjectNotes, noteSearchQuery]);

  // Handle Download
  const handleDownload = (note: StudyNote) => {
    db.incrementDownload(note.id);
    downloadStudyNote(note);
    showToast(`Downloading "${note.fileName}"`, 'info');
    onDataChanged();
  };

  // Delete handlers using confirmation modal
  const handleDeleteNoteClick = (note: StudyNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      showToast('Students cannot delete notes. Admin authorization required.', 'error');
      return;
    }
    setDeleteTarget({
      isOpen: true,
      type: 'Note',
      id: note.id,
      name: note.fileName,
    });
  };

  const handleDeleteSectionClick = (sec: Section, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      showToast('Students cannot delete sections. Admin authorization required.', 'error');
      return;
    }
    setDeleteTarget({
      isOpen: true,
      type: 'Section',
      id: sec.id,
      name: sec.name,
    });
  };

  const handleDeleteSubjectClick = (sub: Subject, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      showToast('Students cannot delete subjects. Admin authorization required.', 'error');
      return;
    }
    setDeleteTarget({
      isOpen: true,
      type: 'Subject',
      id: sub.id,
      name: `${sub.code}: ${sub.name}`,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || !isAdmin) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'Section') {
        db.deleteSection(deleteTarget.id);
        if (selectedSection?.id === deleteTarget.id) {
          onSelectSection(null);
        }
      } else if (deleteTarget.type === 'Subject') {
        db.deleteSubject(deleteTarget.id);
        if (selectedSubject?.id === deleteTarget.id) {
          onSelectSubject(null);
        }
      } else if (deleteTarget.type === 'Note') {
        db.deleteNote(deleteTarget.id);
      }
      showToast('Deleted successfully.', 'success');
      onDataChanged();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error in StudentInterface:', err);
      showToast(err instanceof Error ? err.message : 'Deletion failed. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  // SECTION ACTIONS
  const handleOpenAddSection = () => {
    if (!isAdmin) {
      showToast('Students cannot add sections. Admin authorization required.', 'error');
      return;
    }
    setEditingSection(null);
    setSectionNameInput('');
    setSectionCodeInput('');
    setSectionAdvisorInput('');
    setSectionRoomInput('');
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: Section, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingSection(sec);
    setSectionNameInput(sec.name);
    setSectionCodeInput(sec.code);
    setSectionAdvisorInput(sec.classAdvisor || '');
    setSectionRoomInput(sec.roomNumber || '');
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedYear) return;

    const trimmedName = sectionNameInput.trim();
    if (!trimmedName) {
      showToast('Section name is required (e.g. Section A or A).', 'error');
      return;
    }

    const trimmedCode = sectionCodeInput.trim().toUpperCase() || trimmedName.replace(/Section\s*/i, '').trim().toUpperCase() || 'A';

    if (editingSection) {
      db.updateSection({
        ...editingSection,
        name: trimmedName,
        code: trimmedCode,
        classAdvisor: sectionAdvisorInput.trim(),
        roomNumber: sectionRoomInput.trim(),
      });
      showToast(`Section "${trimmedName}" updated.`, 'success');
    } else {
      db.addSection({
        yearId: selectedYear.id,
        name: trimmedName,
        code: trimmedCode,
        classAdvisor: sectionAdvisorInput.trim(),
        roomNumber: sectionRoomInput.trim(),
        studentCount: 60,
      });
      showToast(`Section "${trimmedName}" added to ${selectedYear.name}.`, 'success');
    }

    setIsSectionModalOpen(false);
    onDataChanged();
  };

  // SUBJECT ACTIONS
  const handleOpenAddSubject = () => {
    if (!isAdmin) {
      showToast('Students cannot add subjects. Admin authorization required.', 'error');
      return;
    }
    setEditingSubject(null);
    setSubjectNameInput('');
    setSubjectCodeInput('');
    setSubjectCreditsInput(4);
    setSubjectFacultyInput('');
    setSubjectDescriptionInput('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    setEditingSubject(sub);
    setSubjectNameInput(sub.name);
    setSubjectCodeInput(sub.code);
    setSubjectCreditsInput(sub.credits);
    setSubjectFacultyInput(sub.facultyName || '');
    setSubjectDescriptionInput(sub.description);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedYear || !selectedSemester) return;

    if (!subjectNameInput.trim() || !subjectCodeInput.trim()) {
      showToast('Subject Name and Subject Code are required.', 'error');
      return;
    }

    const assignedFaculty = subjectFacultyInput.trim() || 'TBA';

    if (editingSubject) {
      const updatedSubject: Subject = {
        ...editingSubject,
        name: subjectNameInput.trim(),
        code: subjectCodeInput.trim().toUpperCase(),
        credits: Number(subjectCreditsInput) || 4,
        facultyName: assignedFaculty,
        description: subjectDescriptionInput.trim(),
      };
      db.updateSubject(updatedSubject);
      showToast(`Subject "${subjectCodeInput.toUpperCase()}" updated with Faculty: ${assignedFaculty}.`, 'success');
      if (selectedSubject?.id === updatedSubject.id) {
        onSelectSubject(updatedSubject);
      }
    } else {
      const newSubject = db.addSubject({
        name: subjectNameInput.trim(),
        code: subjectCodeInput.trim().toUpperCase(),
        semester: selectedSemester.number,
        yearId: selectedYear.id,
        credits: Number(subjectCreditsInput) || 4,
        facultyName: assignedFaculty,
        description: subjectDescriptionInput.trim(),
      });
      showToast(`Subject "${subjectCodeInput.toUpperCase()}" added with Faculty: ${assignedFaculty}.`, 'success');
    }

    setIsSubjectModalOpen(false);
    onDataChanged();
  };

  const getFormatBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      case 'docx':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
      case 'pptx':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'image':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      default:
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Navigator Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <GraduationCap className="h-4 w-4" />
              <span>Academic Portal Flow</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {selectedSubject
                ? `${selectedSubject.code}: ${selectedSubject.name}`
                : selectedSemester
                ? `${selectedSemester.title} (${selectedYear?.name})`
                : selectedSection
                ? `${selectedYear?.name} (${selectedSection.name})`
                : selectedYear
                ? `${selectedYear.name} · Sections`
                : 'Select Academic Year'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && selectedSubject && (
              <button
                onClick={() => onOpenUploadModal(selectedSubject.id)}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ Upload Notes</span>
              </button>
            )}
          </div>
        </div>

        {/* Guided Step Navigator Pills */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Step 1: Year */}
          <div
            onClick={() => {
              onSelectSubject(null);
              onSelectSemester(null);
              onSelectSection(null);
              onSelectYear(null);
            }}
            className={`flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all ${
              selectedYear
                ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                : 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">1</span>
            <div className="truncate">
              <span className="block text-[10px] uppercase text-slate-500">Year</span>
              <span className="font-semibold text-slate-200 truncate">{selectedYear ? selectedYear.name : 'Select Year'}</span>
            </div>
          </div>

          {/* Step 2: Section */}
          <div
            onClick={() => {
              if (selectedYear) {
                onSelectSubject(null);
                onSelectSemester(null);
                onSelectSection(null);
              }
            }}
            className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
              !selectedYear ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/30' :
              selectedSection
                ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 cursor-pointer'
                : 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300 cursor-pointer'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">2</span>
            <div className="truncate">
              <span className="block text-[10px] uppercase text-slate-500">Section</span>
              <span className="font-semibold text-slate-200 truncate">{selectedSection ? selectedSection.name : 'Select Section'}</span>
            </div>
          </div>

          {/* Step 3: Semester */}
          <div
            onClick={() => {
              if (selectedSection) {
                onSelectSubject(null);
                onSelectSemester(null);
              }
            }}
            className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
              !selectedSection ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/30' :
              selectedSemester
                ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 cursor-pointer'
                : 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300 cursor-pointer'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">3</span>
            <div className="truncate">
              <span className="block text-[10px] uppercase text-slate-500">Semester</span>
              <span className="font-semibold text-slate-200 truncate">{selectedSemester ? selectedSemester.title : 'Select Semester'}</span>
            </div>
          </div>

          {/* Step 4: Subject */}
          <div
            onClick={() => {
              if (selectedSubject) {
                onSelectSubject(null);
              }
            }}
            className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
              !selectedSemester ? 'opacity-40 cursor-not-allowed border-slate-900 bg-slate-950/30' :
              selectedSubject
                ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 cursor-pointer'
                : 'border-slate-800 bg-slate-950/60 text-slate-400'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">4</span>
            <div className="truncate">
              <span className="block text-[10px] uppercase text-slate-500">Subject</span>
              <span className="font-semibold text-slate-200 truncate">{selectedSubject ? selectedSubject.code : 'Select Subject'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: YEAR SELECTION */}
      {!selectedYear && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Select Academic Year</h2>
            <span className="text-xs text-slate-500">4 Academic Years</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <span className="text-xs text-slate-500">Sem {year.semesters.join(' & ')}</span>
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
                          : 'None added yet'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Subjects</span>
                      <span className="font-mono text-cyan-400 font-semibold">{yearSubjects.length}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Select {year.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: SECTION SELECTION & MANUAL ADD SECTION */}
      {selectedYear && !selectedSection && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <button
                onClick={() => onSelectYear(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Years
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                Class Sections for {selectedYear.name}
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddSection}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Section</span>
              </button>
            )}
          </div>

          {availableSections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
              <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No sections added yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isAdmin
                  ? `No sections have been created for ${selectedYear.name}. Click "+ Add Section" to manually create Section A, B, C, etc.`
                  : `No class sections have been scheduled for ${selectedYear.name} yet. Class sections will be configured by department administrators.`}
              </p>
              {isAdmin && (
                <div className="mt-4">
                  <button
                    onClick={handleOpenAddSection}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Section</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => onSelectSection(section)}
                  className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
                      {section.code || section.name[0]}
                    </div>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEditSection(section, e)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                          title="Edit Section"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSectionClick(section, e)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="Delete Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {section.name}
                  </h3>

                  {(section.classAdvisor || section.roomNumber) && (
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      {section.classAdvisor && (
                        <div>
                          <span>Advisor: </span>
                          <span className="text-slate-200">{section.classAdvisor}</span>
                        </div>
                      )}
                      {section.roomNumber && (
                        <div>
                          <span>Room: </span>
                          <span className="text-slate-200 font-mono">{section.roomNumber}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs font-semibold text-cyan-400">
                    <span>Select {section.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}

              {/* Add section inline card for Admin */}
              {isAdmin && (
                <div
                  onClick={handleOpenAddSection}
                  className="group rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-300 group-hover:text-cyan-300">
                    + Add Section
                  </span>
                  <span className="text-[11px] text-slate-500">Section A, B, C...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: SEMESTER SELECTION */}
      {selectedYear && selectedSection && !selectedSemester && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => onSelectSection(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sections
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                Select Semester ({selectedYear.name} · {selectedSection.name})
              </h2>
            </div>
            <span className="text-xs text-slate-500">2 Semesters Per Year</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableSemesters.map((sem) => {
              const semSubjects = subjects.filter((s) => s.semester === sem.number);
              return (
                <div
                  key={sem.number}
                  onClick={() => onSelectSemester(sem)}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-cyan-400">SEM 0{sem.number}</span>
                    <span className="text-xs text-slate-500">{sem.academicTerm}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sem.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Access subjects and course study notes for {sem.title}.
                  </p>

                  <div className="mt-5 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{semSubjects.length} Subjects Added</span>
                    <span className="flex items-center gap-1 font-semibold text-cyan-400">
                      Open Semester <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: SUBJECT SELECTION INSIDE SEMESTER & MANUAL ADD SUBJECT */}
      {selectedYear && selectedSection && selectedSemester && !selectedSubject && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <button
                onClick={() => onSelectSemester(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Semesters
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                Subjects in {selectedSemester.title}
              </h2>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddSubject}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Subject</span>
              </button>
            )}
          </div>

          {availableSubjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No subjects added yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isAdmin
                  ? `No subjects have been created for ${selectedSemester.title}. Click "+ Add Subject" to manually add your courses.`
                  : `No subjects have been scheduled for ${selectedSemester.title} yet. Course curriculum will appear once configured by department faculty.`}
              </p>
              {isAdmin && (
                <div className="mt-4">
                  <button
                    onClick={handleOpenAddSubject}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add Subject</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSubjects.map((sub) => {
                const subNotes = notes.filter((n) => n.subjectId === sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSubject(sub)}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                          {sub.code}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{sub.credits} Credits</span>
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={(e) => handleOpenEditSubject(sub, e)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
                                title="Edit Subject"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteSubjectClick(sub, e)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                                title="Delete Subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}

                      {sub.facultyName && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <span>Faculty In-Charge: <strong className="text-slate-200 font-normal">{sub.facultyName}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        {subNotes.length} Notes Available
                      </span>
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        {isAdmin ? 'View / Upload Notes' : 'View & Download Notes'} <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: SUBJECT DETAILS PAGE & NOTES REPOSITORY */}
      {selectedSubject && (
        <div className="space-y-6">
          {/* Subject Detail Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <button
                  onClick={() => onSelectSubject(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Subject List
                </button>

                <div className="flex items-center gap-3 pt-1">
                  <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                    {selectedSubject.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    Semester {selectedSubject.semester} · {selectedSubject.credits} Credits
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {selectedSubject.name}
                </h2>
                {selectedSubject.description && (
                  <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                    {selectedSubject.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                  <span>Faculty In-Charge: <strong className="text-slate-200 font-semibold">{selectedSubject.facultyName || 'TBA'}</strong></span>
                  <span>·</span>
                  <span>Academic Year: <strong className="text-slate-200 font-normal">{selectedYear?.name}</strong></span>
                  <span>·</span>
                  <span>Section: <strong className="text-slate-200 font-normal">{selectedSection?.name}</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => handleOpenEditSubject(selectedSubject)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-900 transition-all shadow-sm"
                      title="Edit Subject Name, Code or Faculty Name"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Subject / Change Faculty</span>
                    </button>

                    <button
                      onClick={() => onOpenUploadModal(selectedSubject.id)}
                      className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Upload Notes</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                    Student Mode: View & Download Only
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Search toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Subject Notes & Study Materials ({currentSubjectNotes.length})</span>
            </h3>

            {currentSubjectNotes.length > 0 && (
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  placeholder="Search uploaded notes..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes List / Empty State */}
          <div className="space-y-3">
            {currentSubjectNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">No notes uploaded yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {isAdmin
                    ? `No study materials have been uploaded for ${selectedSubject.code}: ${selectedSubject.name}. Support for PDF, DOC/DOCX, PPT/PPTX and images.`
                    : `No study materials have been uploaded for ${selectedSubject.code}: ${selectedSubject.name} yet. Course faculty will publish notes here.`}
                </p>
                {isAdmin ? (
                  <div className="mt-4">
                    <button
                      onClick={() => onOpenUploadModal(selectedSubject.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-cyan-400 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Upload Notes</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-500 bg-slate-950/60 border border-slate-800/60 px-3 py-1 rounded-full">
                      Materials will appear automatically once uploaded by faculty
                    </span>
                  </div>
                )}
              </div>
            ) : displayedNotes.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
                No notes match &ldquo;{noteSearchQuery}&rdquo;. Try another search keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {displayedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 shrink-0 group-hover:border-cyan-500/30 transition-colors">
                        {note.fileType === 'image' ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getFormatBadgeColor(note.fileType)}`}>
                            {note.fileType}
                          </span>
                          <span className="font-semibold text-cyan-400">{note.unit}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{note.fileSize}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500">Uploaded {note.uploadDate}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {note.title}
                        </h4>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate max-w-md">
                          <span className="text-slate-500">File:</span>
                          <span className="truncate">{note.fileName}</span>
                        </div>

                        {note.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                            {note.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onOpenPreviewModal(note, selectedSubject)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                        title="View Note"
                      >
                        <Eye className="h-3.5 w-3.5 text-cyan-400" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDownload(note)}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
                        title="Download Note File"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteNoteClick(note, e)}
                          className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ADD/EDIT SECTION */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSection ? 'Edit Section' : `+ Add Section to ${selectedYear?.name}`}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Section Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sectionNameInput}
                  onChange={(e) => setSectionNameInput(e.target.value)}
                  placeholder="e.g. Section A (or just A, B, C)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Section Code
                </label>
                <input
                  type="text"
                  value={sectionCodeInput}
                  onChange={(e) => setSectionCodeInput(e.target.value)}
                  placeholder="e.g. A, B, C (Optional, defaults to letter)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Class Advisor / Faculty (Optional)
                </label>
                <input
                  type="text"
                  value={sectionAdvisorInput}
                  onChange={(e) => setSectionAdvisorInput(e.target.value)}
                  placeholder="e.g. Faculty Name"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Room Number (Optional)
                </label>
                <input
                  type="text"
                  value={sectionRoomInput}
                  onChange={(e) => setSectionRoomInput(e.target.value)}
                  placeholder="e.g. CY-Lab 101"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  {editingSection ? 'Update Section' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ADD/EDIT SUBJECT */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? 'Edit Subject' : `+ Add Subject to ${selectedSemester?.title}`}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Subject Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectCodeInput}
                    onChange={(e) => setSubjectCodeInput(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 font-mono uppercase focus:border-cyan-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjectCreditsInput}
                    onChange={(e) => setSubjectCreditsInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Subject Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectNameInput}
                  onChange={(e) => setSubjectNameInput(e.target.value)}
                  placeholder="e.g. Cryptography & Network Security"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={subjectFacultyInput}
                  onChange={(e) => setSubjectFacultyInput(e.target.value)}
                  placeholder="e.g. Prof. / Dr. Faculty Name"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={subjectDescriptionInput}
                  onChange={(e) => setSubjectDescriptionInput(e.target.value)}
                  placeholder="Brief course objectives and syllabus description..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget?.isOpen}
        itemType={deleteTarget?.type || ''}
        itemName={deleteTarget?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
