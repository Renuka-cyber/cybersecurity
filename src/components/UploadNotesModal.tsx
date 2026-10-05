import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyNote, NoteType } from '../types';
import { db } from '../services/db';
import { formatFileSize } from '../utils/fileDownloader';
import { X, UploadCloud, File, AlertCircle, Image } from 'lucide-react';
import { useToast } from './Toast';

interface UploadNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
  onNoteUploaded: (newNote: StudyNote) => void;
}

export const UploadNotesModal: React.FC<UploadNotesModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  onNoteUploaded,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('Unit 1');
  const [description, setDescription] = useState('');
  const [uploadedBy, setUploadedBy] = useState('Faculty In-Charge');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataString, setFileDataString] = useState<string>('');
  const [detectedType, setDetectedType] = useState<NoteType>('pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    } else if (subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [initialSubjectId, subjects, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg('');

    // If title is empty, prefill with file base name
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setTitle(cleanName);
    }

    // Detect format
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setDetectedType('pdf');
    else if (ext === 'doc' || ext === 'docx') setDetectedType('docx');
    else if (ext === 'ppt' || ext === 'pptx') setDetectedType('pptx');
    else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext || '')) setDetectedType('image');
    else if (ext === 'txt') setDetectedType('txt');
    else setDetectedType('pdf');

    // Read file
    const reader = new FileReader();
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (event) => {
        setFileDataString(event.target?.result as string || '');
      };
      reader.readAsText(file);
    } else {
      // Base64 data URL
      reader.onload = (event) => {
        setFileDataString(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSubjectId) {
      setErrorMsg('Please select a subject first. If no subjects exist, add a subject first.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a note title.');
      return;
    }

    if (!selectedFile && !description.trim()) {
      setErrorMsg('Please select a study material file (PDF, DOC/DOCX, PPT/PPTX, Image) or provide study notes text.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fileName = selectedFile 
        ? selectedFile.name 
        : `${title.replace(/\s+/g, '_')}.${detectedType === 'image' ? 'png' : detectedType}`;

      const fileSize = selectedFile 
        ? formatFileSize(selectedFile.size) 
        : '1.2 MB';

      const newNote = db.addNote({
        subjectId: selectedSubjectId,
        title: title.trim(),
        description: description.trim() || `Course study material for ${unit}.`,
        unit,
        fileName,
        fileType: detectedType,
        fileSize,
        uploadedBy: uploadedBy.trim() || 'Department Faculty',
        fileData: fileDataString || description.trim(),
      });

      const currentSub = subjects.find(s => s.id === selectedSubjectId);
      showToast(`Notes successfully uploaded to ${currentSub?.code || 'Subject'}!`, 'success');
      onNoteUploaded(newNote);
      onClose();

      // Reset
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setFileDataString('');
    } catch {
      setErrorMsg('Failed to save notes. Storage error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">+ Upload Notes</h3>
              <p className="text-xs text-slate-400">Upload PDF, DOC/DOCX, PPT/PPTX or Images for this subject</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Subject selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Subject <span className="text-rose-400">*</span>
            </label>
            {subjects.length === 0 ? (
              <p className="text-xs text-amber-400 py-1">No subjects available. Please add a subject first.</p>
            ) : (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name} (Semester {sub.semester})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Note Title / Topic <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 1 Lecture Notes & Architecture Diagrams"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Unit & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Unit / Category
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 1, Lab Manual, Notes"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Material Format
              </label>
              <select
                value={detectedType}
                onChange={(e) => setDetectedType(e.target.value as NoteType)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="docx">Word Document (.doc, .docx)</option>
                <option value="pptx">PowerPoint Presentation (.ppt, .pptx)</option>
                <option value="image">Image (.jpg, .png, .webp)</option>
                <option value="txt">Text / Markdown (.txt)</option>
                <option value="lab">Lab Exercise File</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select File (PDF, DOC/DOCX, PPT/PPTX, Image)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950/40 p-5 text-center transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-100 text-sm line-clamp-1">{selectedFile.name}</p>
                    <p className="text-xs text-cyan-400 font-mono">{formatFileSize(selectedFile.size)} · Click to change file</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800 transition-colors">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    Drag and drop file here, or <span className="text-cyan-400 font-semibold underline underline-offset-2">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Supports PDF, DOC/DOCX, PPT/PPTX, JPG, PNG, WEBP, TXT</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Notes Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or outline of these study notes..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Uploaded By */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Uploaded By
            </label>
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="e.g. Faculty Name"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || subjects.length === 0}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 disabled:opacity-50 transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{isSubmitting ? 'Uploading...' : 'Save Notes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
