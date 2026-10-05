import { StudyNote } from '../types';

export function downloadStudyNote(note: StudyNote): void {
  let blob: Blob;

  if (note.fileData && note.fileData.startsWith('data:')) {
    // It's a real base64 / data URL uploaded by the user
    try {
      const parts = note.fileData.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
    } catch {
      // Fallback
      blob = new Blob([note.fileData], { type: 'application/octet-stream' });
    }
  } else if (note.fileData) {
    // Text / markdown content
    blob = new Blob([note.fileData], { type: 'text/plain;charset=utf-8' });
  } else {
    // Generate authentic academic handout content
    const content = `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
CYBER SECURITY SPECIALIZATION
================================================================
Document: ${note.title}
File Name: ${note.fileName}
Unit / Section: ${note.unit}
Uploaded By: ${note.uploadedBy}
Upload Date: ${note.uploadDate}
================================================================

SYLLABUS & LECTURE OVERVIEW:
${note.description || 'Comprehensive course notes and reference materials.'}

KEY LEARNING OBJECTIVES:
1. Understand foundational principles and architecture.
2. Threat identification and defensive hardening techniques.
3. Practical laboratory application and security verification.
4. Compliance with industry standards (NIST, ISO 27001, MITRE ATT&CK).

COURSE POLICIES:
This document is prepared for academic study by students of the CSE Cyber Security Department.
Unauthorized distribution outside the institution is prohibited.
================================================================
Generated via CSE Cyber Security Academic Repository
`;
    blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = note.fileName || `${note.title}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
