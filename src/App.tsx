import React, { useState, useEffect, useCallback } from 'react';
import { AcademicYear, Section, Semester, Subject, StudyNote } from './types';
import { db } from './services/db';
import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { LandingPageView } from './components/LandingPageView';
import { HomeView } from './components/HomeView';
import { StudentInterface } from './components/StudentInterface';
import { AdminPanel } from './components/AdminPanel';
import { CurriculumView } from './components/CurriculumView';
import { FacultyView } from './components/FacultyView';
import { UploadNotesModal } from './components/UploadNotesModal';
import { NotePreviewModal } from './components/NotePreviewModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ToastProvider, useToast } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

function MainApp() {
  const { showToast } = useToast();

  // Core Database Data
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);

  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'academics' | 'curriculum' | 'faculty' | 'admin'>('landing');
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Role Access: Student by default (limited view & download only)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string | undefined>(undefined);
  const [previewNote, setPreviewNote] = useState<StudyNote | null>(null);
  const [previewSubject, setPreviewSubject] = useState<Subject | undefined>(undefined);

  // Load data from DB
  const loadData = useCallback(() => {
    setYears(db.getYears());
    setSections(db.getSections());
    setSemesters(db.getSemesters());
    setSubjects(db.getSubjects());
    setNotes(db.getNotes());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Academic Flow
  const handleSelectYearFromHome = (year: AcademicYear) => {
    setSelectedYear(year);
    setSelectedSection(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setCurrentView('academics');
  };

  const handleSelectSubjectDirectly = (subject: Subject) => {
    const year = years.find((y) => y.id === subject.yearId) || null;
    const sec = sections.find((s) => s.yearId === subject.yearId) || null;
    const sem = semesters.find((sm) => sm.number === subject.semester) || null;

    setSelectedYear(year);
    setSelectedSection(sec);
    setSelectedSemester(sem);
    setSelectedSubject(subject);
    setCurrentView('academics');
  };

  const handleSelectNoteFromSearch = (note: StudyNote, subject?: Subject) => {
    if (subject) {
      handleSelectSubjectDirectly(subject);
    }
    setPreviewNote(note);
    setPreviewSubject(subject);
  };

  const handleToggleAdmin = () => {
    if (!isAdmin) {
      setIsAdminAuthModalOpen(true);
    } else {
      setIsAdmin(false);
      if (currentView === 'admin') {
        setCurrentView('academics');
      }
      showToast('Switched to Student Mode. You now have view & download access.', 'info');
    }
  };

  const handleResetNavigation = () => {
    setSelectedSubject(null);
    setSelectedSemester(null);
    setSelectedSection(null);
    setSelectedYear(null);
  };

  const handleOpenUploadModal = (subjectId?: string) => {
    if (!isAdmin) {
      setIsAdminAuthModalOpen(true);
      showToast('Administrator authentication required to upload study materials.', 'error');
      return;
    }
    setUploadSubjectId(subjectId);
    setIsUploadModalOpen(true);
  };

  const handleOpenPreviewModal = (note: StudyNote, subject?: Subject) => {
    setPreviewNote(note);
    setPreviewSubject(subject || subjects.find((s) => s.id === note.subjectId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdmin) {
            setIsAdminAuthModalOpen(true);
            return;
          }
          setCurrentView(view as any);
          if (view === 'home' || view === 'landing') {
            handleResetNavigation();
          }
        }}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Breadcrumbs for navigation tracking */}
      {currentView === 'academics' && (
        <Breadcrumbs
          selectedYear={selectedYear}
          selectedSection={selectedSection}
          selectedSemester={selectedSemester}
          selectedSubject={selectedSubject}
          onNavigateHome={() => {
            setCurrentView('home');
            handleResetNavigation();
          }}
          onSelectYear={setSelectedYear}
          onSelectSection={setSelectedSection}
          onSelectSemester={setSelectedSemester}
          onSelectSubject={setSelectedSubject}
          onResetNavigation={handleResetNavigation}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'landing' && (
          <LandingPageView
            onGetStarted={() => {
              setCurrentView('home');
              handleResetNavigation();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreAcademics={() => {
              setCurrentView('academics');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'home' && (
          <HomeView
            years={years}
            sections={sections}
            subjects={subjects}
            onSelectYear={handleSelectYearFromHome}
            onNavigateAcademics={() => setCurrentView('academics')}
          />
        )}

        {currentView === 'academics' && (
          <StudentInterface
            years={years}
            sections={sections}
            semesters={semesters}
            subjects={subjects}
            notes={notes}
            selectedYear={selectedYear}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
            selectedSubject={selectedSubject}
            onSelectYear={setSelectedYear}
            onSelectSection={setSelectedSection}
            onSelectSemester={setSelectedSemester}
            onSelectSubject={setSelectedSubject}
            onOpenUploadModal={handleOpenUploadModal}
            onOpenPreviewModal={handleOpenPreviewModal}
            onDataChanged={loadData}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'curriculum' && (
          <CurriculumView
            years={years}
            subjects={subjects}
            notes={notes}
            onSelectSubject={handleSelectSubjectDirectly}
            onOpenUploadModal={handleOpenUploadModal}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'faculty' && <FacultyView subjects={subjects} />}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminPanel
              years={years}
              sections={sections}
              semesters={semesters}
              subjects={subjects}
              notes={notes}
              onRefreshData={loadData}
              onOpenUploadModal={handleOpenUploadModal}
              onOpenPreviewModal={handleOpenPreviewModal}
            />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-white">Administrator Access Required</h3>
              <p className="text-xs text-slate-400 mt-2 mb-4">
                Students do not have permission to view or manage administrative consoles. Please log in with admin credentials.
              </p>
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Authenticate as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Global Modals */}
      <UploadNotesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subjects={subjects}
        initialSubjectId={uploadSubjectId}
        onNoteUploaded={() => {
          loadData();
        }}
      />

      <NotePreviewModal
        note={previewNote}
        subject={previewSubject}
        isOpen={!!previewNote}
        onClose={() => {
          setPreviewNote(null);
          setPreviewSubject(undefined);
        }}
        onDownloaded={loadData}
        onDeleteNote={(noteId) => {
          if (!isAdmin) {
            showToast('Students cannot delete notes.', 'error');
            return;
          }
          try {
            db.deleteNote(noteId);
            showToast('Deleted successfully.', 'success');
            loadData();
          } catch (err) {
            console.error('Delete error:', err);
            showToast(err instanceof Error ? err.message : 'Failed to delete note.', 'error');
          }
        }}
        isAdmin={isAdmin}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        subjects={subjects}
        notes={notes}
        years={years}
        onSelectSubject={handleSelectSubjectDirectly}
        onSelectNote={handleSelectNoteFromSearch}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
        }}
      />
    </div>
  );
}
