import React, { useState } from 'react';
import { AcademicYear, Section, Semester, Subject, StudyNote, NoteType } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  FileText,
  BookOpen,
  Layers,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Eye,
} from 'lucide-react';
import { downloadStudyNote } from '../utils/fileDownloader';

interface AdminPanelProps {
  years: AcademicYear[];
  sections: Section[];
  semesters: Semester[];
  subjects: Subject[];
  notes: StudyNote[];
  onRefreshData: () => void;
  onOpenUploadModal: (subjectId?: string) => void;
  onOpenPreviewModal: (note: StudyNote, subject?: Subject) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  years,
  sections,
  semesters,
  subjects,
  notes,
  onRefreshData,
  onOpenUploadModal,
  onOpenPreviewModal,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'subjects' | 'notes'>('overview');

  // Section modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionYearId, setSectionYearId] = useState<AcademicYear['id']>('year-1');
  const [sectionName, setSectionName] = useState('');
  const [sectionCode, setSectionCode] = useState('');
  const [sectionAdvisor, setSectionAdvisor] = useState('');
  const [sectionRoom, setSectionRoom] = useState('');
  const [sectionStrength, setSectionStrength] = useState<number>(60);

  // Subject modal state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectSemester, setSubjectSemester] = useState<number>(1);
  const [subjectCredits, setSubjectCredits] = useState<number>(4);
  const [subjectFaculty, setSubjectFaculty] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectUnits, setSubjectUnits] = useState('');

  // Delete confirmations
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    type: 'Section' | 'Subject' | 'Note';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'Section') {
        db.deleteSection(deleteTarget.id);
      } else if (deleteTarget.type === 'Subject') {
        db.deleteSubject(deleteTarget.id);
      } else if (deleteTarget.type === 'Note') {
        db.deleteNote(deleteTarget.id);
      }
      showToast('Deleted successfully.', 'success');
      onRefreshData();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error in admin panel:', err);
      showToast(err instanceof Error ? err.message : 'Deletion failed. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  // Filter for notes tab
  const [noteSubjectFilter, setNoteSubjectFilter] = useState<string>('all');

  // Total downloads metric
  const totalDownloads = notes.reduce((acc, n) => acc + (n.downloadCount || 0), 0);

  // Section operations
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionYearId('year-1');
    setSectionName('');
    setSectionCode('');
    setSectionAdvisor('');
    setSectionRoom('');
    setSectionStrength(60);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: Section) => {
    setEditingSection(sec);
    setSectionYearId(sec.yearId);
    setSectionName(sec.name);
    setSectionCode(sec.code);
    setSectionAdvisor(sec.classAdvisor || '');
    setSectionRoom(sec.roomNumber || '');
    setSectionStrength(sec.studentCount || 60);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || !sectionCode.trim()) {
      showToast('Section name and code are required.', 'error');
      return;
    }

    if (editingSection) {
      db.updateSection({
        ...editingSection,
        yearId: sectionYearId,
        name: sectionName.trim(),
        code: sectionCode.trim().toUpperCase(),
        classAdvisor: sectionAdvisor.trim(),
        roomNumber: sectionRoom.trim(),
        studentCount: Number(sectionStrength) || 60,
      });
      showToast(`Section "${sectionName}" updated successfully.`, 'success');
    } else {
      db.addSection({
        yearId: sectionYearId,
        name: sectionName.trim(),
        code: sectionCode.trim().toUpperCase(),
        classAdvisor: sectionAdvisor.trim(),
        roomNumber: sectionRoom.trim(),
        studentCount: Number(sectionStrength) || 60,
      });
      showToast(`New section "${sectionName}" added.`, 'success');
    }

    setIsSectionModalOpen(false);
    onRefreshData();
  };

  // Subject operations
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectCode('');
    setSubjectName('');
    setSubjectSemester(1);
    setSubjectCredits(4);
    setSubjectFaculty('');
    setSubjectDescription('');
    setSubjectUnits('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectCode(sub.code);
    setSubjectName(sub.name);
    setSubjectSemester(sub.semester);
    setSubjectCredits(sub.credits);
    setSubjectFaculty(sub.facultyName);
    setSubjectDescription(sub.description);
    setSubjectUnits(sub.syllabusUnits ? sub.syllabusUnits.join('\n') : '');
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) {
      showToast('Subject code and name are required.', 'error');
      return;
    }

    // Determine year from semester: Sem 1,2 = Year 1, Sem 3,4 = Year 2, Sem 5,6 = Year 3, Sem 7,8 = Year 4
    const yearNumber = Math.ceil(subjectSemester / 2);
    const calculatedYearId: AcademicYear['id'] = `year-${yearNumber}` as AcademicYear['id'];

    const unitsArray = subjectUnits
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (editingSubject) {
      db.updateSubject({
        ...editingSubject,
        code: subjectCode.trim().toUpperCase(),
        name: subjectName.trim(),
        semester: Number(subjectSemester),
        yearId: calculatedYearId,
        credits: Number(subjectCredits),
        facultyName: subjectFaculty.trim() || 'TBA',
        description: subjectDescription.trim(),
        syllabusUnits: unitsArray,
      });
      showToast(`Subject "${subjectCode}: ${subjectName}" updated.`, 'success');
    } else {
      db.addSubject({
        code: subjectCode.trim().toUpperCase(),
        name: subjectName.trim(),
        semester: Number(subjectSemester),
        yearId: calculatedYearId,
        credits: Number(subjectCredits),
        facultyName: subjectFaculty.trim() || 'TBA',
        description: subjectDescription.trim(),
        syllabusUnits: unitsArray,
      });
      showToast(`Subject "${subjectCode}" added successfully.`, 'success');
    }

    setIsSubjectModalOpen(false);
    onRefreshData();
  };

  const handleClearAllData = () => {
    if (window.confirm('Clear all manually added sections, subjects and uploaded notes to start completely fresh?')) {
      db.clearAllData();
      showToast('All department sections, subjects and notes have been cleared.', 'info');
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span>Authorized Administrative Console</span>
                <span>·</span>
                <span>CSE Cyber Security</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Department Management Dashboard
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage academic years, configure class sections, assign semester subjects, and publish verified study materials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenUploadModal()}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Notes</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:border-rose-900 transition-colors"
              title="Clear all manual sections, subjects, and notes"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 flex items-center gap-1 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'Department Overview' },
            { id: 'sections', label: `Sections Manager (${sections.length})` },
            { id: 'subjects', label: `Subjects Manager (${subjects.length})` },
            { id: 'notes', label: `Uploaded Notes (${notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Academic Years</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{years.length}</p>
              <span className="text-[11px] text-slate-400">1st to 4th Year</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Class Sections</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{sections.length}</p>
              <span className="text-[11px] text-slate-400">A & B batches</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Semesters</span>
              <p className="text-2xl font-bold font-mono text-white mt-1">{semesters.length}</p>
              <span className="text-[11px] text-slate-400">8 Semesters</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Subjects</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{subjects.length}</p>
              <span className="text-[11px] text-slate-400">Cyber curriculum</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Uploaded Notes</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{notes.length}</p>
              <span className="text-[11px] text-slate-400">PDF, DOC, PPT</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Downloads</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{totalDownloads}</p>
              <span className="text-[11px] text-slate-400">Student reads</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Manage Academic Sections
              </h3>
              <p className="text-xs text-slate-400">
                Configure sections A, B, C for 1st through 4th year, designate faculty advisors and room numbers.
              </p>
              <button
                onClick={handleOpenAddSection}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/60 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Class Section</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Manage Subject Curriculum
              </h3>
              <p className="text-xs text-slate-400">
                Assign subjects to specific semesters, configure course codes, credits, and syllabus units.
              </p>
              <button
                onClick={handleOpenAddSubject}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/60 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Subject</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                Study Notes Repository
              </h3>
              <p className="text-xs text-slate-400">
                Upload course handbooks, question banks, and lab exercises directly mapped to subject codes.
              </p>
              <button
                onClick={() => onOpenUploadModal()}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 transition-colors"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Material</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTIONS MANAGER */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Class Sections Directory</h3>
              <p className="text-xs text-slate-400">
                Add, edit, or remove sections across all 4 academic years.
              </p>
            </div>
            <button
              onClick={handleOpenAddSection}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Section</span>
            </button>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
              <Layers className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white">No sections added yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Create your first class section (e.g., Section A) for any academic year.</p>
              <button
                onClick={handleOpenAddSection}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Section</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Academic Year</th>
                      <th className="px-4 py-3">Section Name</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Class Advisor</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3 text-right">Students</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {sections.map((sec) => {
                      const year = years.find((y) => y.id === sec.yearId);
                      return (
                        <tr key={sec.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-200">{year?.name || sec.yearId}</td>
                          <td className="px-4 py-3 font-bold text-white">{sec.name}</td>
                          <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{sec.code}</td>
                          <td className="px-4 py-3 text-slate-300">{sec.classAdvisor || '—'}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{sec.roomNumber || '—'}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{sec.studentCount || 60}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditSection(sec)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                                title="Edit Section"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    isOpen: true,
                                    type: 'Section',
                                    id: sec.id,
                                    name: sec.name,
                                  });
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                                title="Delete Section"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBJECTS MANAGER */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Subjects Curriculum Management</h3>
              <p className="text-xs text-slate-400">
                Add, edit, or delete subjects and assign them to specific semesters.
              </p>
            </div>
            <button
              onClick={handleOpenAddSubject}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Subject</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white">No subjects added yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Add your first academic subject and assign it to a semester.</p>
              <button
                onClick={handleOpenAddSubject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Subject</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Subject Name</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Academic Year</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Faculty In-Charge</th>
                      <th className="px-4 py-3 text-center">Notes Count</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {subjects.map((sub) => {
                      const year = years.find((y) => y.id === sub.yearId);
                      const subNotesCount = notes.filter((n) => n.subjectId === sub.id).length;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-cyan-400">{sub.code}</td>
                          <td className="px-4 py-3 font-semibold text-white">
                            <div>{sub.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal line-clamp-1">{sub.description}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-200">Sem {sub.semester}</td>
                          <td className="px-4 py-3 text-slate-400">{year?.name || sub.yearId}</td>
                          <td className="px-4 py-3 font-mono tabular-nums">{sub.credits}</td>
                          <td className="px-4 py-3 text-slate-300">{sub.facultyName}</td>
                          <td className="px-4 py-3 text-center font-mono tabular-nums text-cyan-400 font-semibold">
                            {subNotesCount}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenUploadModal(sub.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                                title="Upload notes to this subject"
                              >
                                <UploadCloud className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditSubject(sub)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                                title="Edit Subject"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    isOpen: true,
                                    type: 'Subject',
                                    id: sub.id,
                                    name: `${sub.code}: ${sub.name}`,
                                  });
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                                title="Delete Subject"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NOTES MANAGER */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Study Notes & Materials Repository</h3>
              <p className="text-xs text-slate-400">
                Audit uploaded study materials, download counts, and publication status.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={noteSubjectFilter}
                onChange={(e) => setNoteSubjectFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onOpenUploadModal()}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shrink-0"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Material</span>
              </button>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white">No notes uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Upload study notes (PDF, DOC, PPT, Images) for subjects in the curriculum.</p>
              <button
                onClick={() => onOpenUploadModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all"
              >
                <UploadCloud className="h-4 w-4" />
                <span>+ Upload Notes</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Title & File</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Uploaded By</th>
                      <th className="px-4 py-3 text-right">Downloads</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {notes
                      .filter((n) => noteSubjectFilter === 'all' || n.subjectId === noteSubjectFilter)
                      .map((note) => {
                        const sub = subjects.find((s) => s.id === note.subjectId);
                        return (
                          <tr key={note.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                              {sub?.code || 'GEN'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white line-clamp-1">{note.title}</div>
                              <div className="font-mono text-[11px] text-slate-500 truncate" title={note.fileName}>{note.fileName}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">{note.unit}</td>
                            <td className="px-4 py-3 uppercase font-mono text-[10px] text-cyan-400">{note.fileType}</td>
                            <td className="px-4 py-3 text-slate-400">{note.fileSize}</td>
                            <td className="px-4 py-3 text-slate-400">{note.uploadDate}</td>
                            <td className="px-4 py-3 text-slate-300">{note.uploadedBy}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-400">
                              {note.downloadCount || 0}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onOpenPreviewModal(note, sub)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                                  title="Preview Note"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    downloadStudyNote(note);
                                    db.incrementDownload(note.id);
                                    onRefreshData();
                                  }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget({
                                      isOpen: true,
                                      type: 'Note',
                                      id: note.id,
                                      name: note.fileName,
                                    });
                                  }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                                  title="Delete Note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION EDIT/ADD MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSection ? 'Edit Class Section' : 'Add Class Section'}
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
                  Academic Year
                </label>
                <select
                  value={sectionYearId}
                  onChange={(e) => setSectionYearId(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} (Year {y.yearNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Section Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g. Section C"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Code Letter <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={sectionCode}
                    onChange={(e) => setSectionCode(e.target.value)}
                    placeholder="e.g. C"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Class Advisor / Faculty In-Charge
                </label>
                <input
                  type="text"
                  value={sectionAdvisor}
                  onChange={(e) => setSectionAdvisor(e.target.value)}
                  placeholder="e.g. Dr. Priya Sundaram"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={sectionRoom}
                    onChange={(e) => setSectionRoom(e.target.value)}
                    placeholder="e.g. CY-203"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    value={sectionStrength}
                    onChange={(e) => setSectionStrength(Number(e.target.value))}
                    min={1}
                    max={120}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
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
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT EDIT/ADD MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? 'Edit Subject Details' : 'Add Subject to Curriculum'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Subject Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS501"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Target Semester <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={subjectSemester}
                    onChange={(e) => setSubjectSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} ({sem <= 2 ? '1st Year' : sem <= 4 ? '2nd Year' : sem <= 6 ? '3rd Year' : '4th Year'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Subject Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Cryptography & Network Security"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjectCredits}
                    onChange={(e) => setSubjectCredits(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Faculty In-Charge / Name
                  </label>
                  <input
                    type="text"
                    value={subjectFaculty}
                    onChange={(e) => setSubjectFaculty(e.target.value)}
                    placeholder="e.g. Dr. A. Kumar / Prof. Faculty Name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description / Objectives
                </label>
                <textarea
                  rows={2}
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  placeholder="Course summary and scope..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Syllabus Units (One per line)
                </label>
                <textarea
                  rows={3}
                  value={subjectUnits}
                  onChange={(e) => setSubjectUnits(e.target.value)}
                  placeholder="Unit 1: Block Ciphers&#10;Unit 2: Public Key Crypto&#10;Unit 3: Authentication"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono"
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
                  className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
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
