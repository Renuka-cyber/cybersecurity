import { AcademicYear, Section, Semester, Subject, StudyNote, FacultyMember, DepartmentHighlight } from '../types';

const STORAGE_KEYS = {
  YEARS: 'cse_cyber_years_manual_v3',
  SECTIONS: 'cse_cyber_sections_manual_v3',
  SEMESTERS: 'cse_cyber_semesters_manual_v3',
  SUBJECTS: 'cse_cyber_subjects_manual_v3',
  NOTES: 'cse_cyber_notes_manual_v3',
};

// Permanent 4 Academic Years
export const INITIAL_YEARS: AcademicYear[] = [
  {
    id: 'year-1',
    name: '1st Year',
    yearNumber: 1,
    description: 'Foundations of Computer Science & Cybersecurity Fundamentals (Semesters 1 & 2).',
    semesters: [1, 2],
  },
  {
    id: 'year-2',
    name: '2nd Year',
    yearNumber: 2,
    description: 'Core Computing, Network Protocols & Applied Cryptography (Semesters 3 & 4).',
    semesters: [3, 4],
  },
  {
    id: 'year-3',
    name: '3rd Year',
    yearNumber: 3,
    description: 'Offensive Security, Digital Forensics & Cloud Defense (Semesters 5 & 6).',
    semesters: [5, 6],
  },
  {
    id: 'year-4',
    name: '4th Year',
    yearNumber: 4,
    description: 'Advanced Threat Hunting, SOC Operations & Capstone Project (Semesters 7 & 8).',
    semesters: [7, 8],
  },
];

// Permanent 8 Semesters across the 4 years
export const INITIAL_SEMESTERS: Semester[] = [
  { number: 1, yearId: 'year-1', title: 'Semester 1', academicTerm: 'Odd Semester' },
  { number: 2, yearId: 'year-1', title: 'Semester 2', academicTerm: 'Even Semester' },
  { number: 3, yearId: 'year-2', title: 'Semester 3', academicTerm: 'Odd Semester' },
  { number: 4, yearId: 'year-2', title: 'Semester 4', academicTerm: 'Even Semester' },
  { number: 5, yearId: 'year-3', title: 'Semester 5', academicTerm: 'Odd Semester' },
  { number: 6, yearId: 'year-3', title: 'Semester 6', academicTerm: 'Even Semester' },
  { number: 7, yearId: 'year-4', title: 'Semester 7', academicTerm: 'Odd Semester' },
  { number: 8, yearId: 'year-4', title: 'Semester 8', academicTerm: 'Even Semester' },
];

// Completely empty initial arrays - no pre-filled fake data!
export const INITIAL_SECTIONS: Section[] = [];
export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_NOTES: StudyNote[] = [];

export const DEPARTMENT_HIGHLIGHTS: DepartmentHighlight[] = [
  {
    id: 'hl-1',
    title: 'Live Cyber Range & Simulation Laboratory',
    category: 'Infrastructure',
    description: 'Dedicated isolated virtualization facility for red-team, blue-team and threat modeling scenarios.',
    metric: 'Cyber Range',
  },
  {
    id: 'hl-2',
    title: 'Digital Forensics & Malware Defense Center',
    category: 'Research',
    description: 'Specialized lab equipped for memory forensics, reverse engineering, and threat intelligence analysis.',
    metric: 'Forensics Lab',
  },
  {
    id: 'hl-3',
    title: 'Industry Aligned Defense Curriculum',
    category: 'Academics',
    description: 'Specialized curriculum aligned with global cybersecurity frameworks (NIST, MITRE ATT&CK).',
    metric: 'Tier-1 Standards',
  },
  {
    id: 'hl-4',
    title: 'Capture The Flag (CTF) Technical Wing',
    category: 'Student Hub',
    description: 'Student-led competitive hacking and vulnerability assessment club.',
    metric: 'Active CTF Wing',
  },
];

export const FACULTY_DIRECTORY: FacultyMember[] = [];

class DepartmentDB {
  getYears(): AcademicYear[] {
    const data = localStorage.getItem(STORAGE_KEYS.YEARS);
    if (!data) {
      this.saveYears(INITIAL_YEARS);
      return INITIAL_YEARS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_YEARS;
    }
  }

  saveYears(years: AcademicYear[]) {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
  }

  getSections(): Section[] {
    const data = localStorage.getItem(STORAGE_KEYS.SECTIONS);
    if (data === null) {
      this.saveSections(INITIAL_SECTIONS);
      return INITIAL_SECTIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SECTIONS;
    }
  }

  saveSections(sections: Section[]) {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  }

  addSection(section: Omit<Section, 'id'>): Section {
    const sections = this.getSections();
    const newSection: Section = {
      ...section,
      id: `sec-${Date.now()}`,
    };
    sections.push(newSection);
    this.saveSections(sections);
    return newSection;
  }

  updateSection(updatedSection: Section): boolean {
    const sections = this.getSections();
    const index = sections.findIndex((s) => s.id === updatedSection.id);
    if (index !== -1) {
      sections[index] = updatedSection;
      this.saveSections(sections);
      return true;
    }
    return false;
  }

  deleteSection(sectionId: string): boolean {
    try {
      const sections = this.getSections();
      const filtered = sections.filter((s) => s.id !== sectionId);
      this.saveSections(filtered);
      // Remove any notes specifically tagged with this section
      const notes = this.getNotes().filter((n) => n.sectionSpecific !== sectionId);
      this.saveNotes(notes);
      return true;
    } catch (err) {
      console.error('Failed to delete section from database:', err);
      throw new Error(err instanceof Error ? err.message : 'Database error while deleting section');
    }
  }

  getSemesters(): Semester[] {
    const data = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    if (!data) {
      this.saveSemesters(INITIAL_SEMESTERS);
      return INITIAL_SEMESTERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SEMESTERS;
    }
  }

  saveSemesters(semesters: Semester[]) {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  }

  getSubjects(): Subject[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (data === null) {
      this.saveSubjects(INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SUBJECTS;
    }
  }

  saveSubjects(subjects: Subject[]) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  addSubject(subject: Omit<Subject, 'id'>): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
    };
    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  updateSubject(updatedSubject: Subject): boolean {
    const subjects = this.getSubjects();
    const index = subjects.findIndex((s) => s.id === updatedSubject.id);
    if (index !== -1) {
      subjects[index] = updatedSubject;
      this.saveSubjects(subjects);
      return true;
    }
    return false;
  }

  deleteSubject(subjectId: string): boolean {
    try {
      const subjects = this.getSubjects();
      const filtered = subjects.filter((s) => s.id !== subjectId);
      this.saveSubjects(filtered);
      // Also permanently delete all associated notes for this subject
      const notes = this.getNotes().filter((n) => n.subjectId !== subjectId);
      this.saveNotes(notes);
      return true;
    } catch (err) {
      console.error('Failed to delete subject from database:', err);
      throw new Error(err instanceof Error ? err.message : 'Database error while deleting subject');
    }
  }

  getNotes(): StudyNote[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (data === null) {
      this.saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTES;
    }
  }

  saveNotes(notes: StudyNote[]) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  addNote(note: Omit<StudyNote, 'id' | 'downloadCount' | 'uploadDate'>): StudyNote {
    const notes = this.getNotes();
    const newNote: StudyNote = {
      ...note,
      id: `note-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  updateNote(updatedNote: StudyNote): boolean {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === updatedNote.id);
    if (index !== -1) {
      notes[index] = updatedNote;
      this.saveNotes(notes);
      return true;
    }
    return false;
  }

  deleteNote(noteId: string): boolean {
    try {
      const notes = this.getNotes();
      const filtered = notes.filter((n) => n.id !== noteId);
      this.saveNotes(filtered);
      return true;
    } catch (err) {
      console.error('Failed to delete note from database:', err);
      throw new Error(err instanceof Error ? err.message : 'Database error while deleting note');
    }
  }

  incrementDownload(noteId: string): void {
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      note.downloadCount = (note.downloadCount || 0) + 1;
      this.saveNotes(notes);
    }
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.YEARS);
    localStorage.removeItem(STORAGE_KEYS.SECTIONS);
    localStorage.removeItem(STORAGE_KEYS.SEMESTERS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    this.saveYears(INITIAL_YEARS);
    this.saveSections(INITIAL_SECTIONS);
    this.saveSemesters(INITIAL_SEMESTERS);
    this.saveSubjects(INITIAL_SUBJECTS);
    this.saveNotes(INITIAL_NOTES);
  }
}

export const db = new DepartmentDB();
