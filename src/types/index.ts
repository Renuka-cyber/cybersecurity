export type AcademicYearId = 'year-1' | 'year-2' | 'year-3' | 'year-4';

export interface AcademicYear {
  id: AcademicYearId;
  name: string;
  yearNumber: number;
  description: string;
  semesters: number[]; // e.g. [1, 2] or [3, 4]
}

export interface Section {
  id: string;
  yearId: AcademicYearId;
  name: string; // e.g. "Section A", "Section B"
  code: string; // e.g. "A", "B"
  studentCount?: number;
  classAdvisor?: string;
  roomNumber?: string;
}

export interface Semester {
  number: number; // 1 to 8
  yearId: AcademicYearId;
  title: string; // "Semester 1", "Semester 2", etc.
  academicTerm: string; // "Odd Semester" / "Even Semester"
}

export type NoteType = 'pdf' | 'docx' | 'pptx' | 'image' | 'txt' | 'lab';

export interface StudyNote {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  unit: string; // e.g. "Unit 1", "Notes", "Lab Manual", etc.
  fileName: string;
  fileType: NoteType;
  fileSize: string; // e.g. "2.4 MB"
  uploadDate: string; // Formatted date
  uploadedBy: string; // Faculty / Uploader name
  fileData?: string; // Base64 / Data URL / Sample text content for download
  downloadCount: number;
  sectionSpecific?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g., "CS301"
  name: string; // e.g., "Cryptography & Network Security"
  semester: number; // 1 to 8
  yearId: AcademicYearId;
  credits: number;
  facultyName: string;
  description: string;
  syllabusUnits?: string[];
  totalNotesCount?: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  specialization: string;
  email: string;
  office: string;
}

export interface DepartmentHighlight {
  id: string;
  title: string;
  category: string;
  description: string;
  metric?: string;
}
