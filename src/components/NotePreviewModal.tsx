import React, { useState } from 'react';
import { StudyNote, Subject } from '../types';
import { downloadStudyNote } from '../utils/fileDownloader';
import { X, Download, FileText, Calendar, User, HardDrive, ShieldCheck, Image, Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface NotePreviewModalProps {
  note: StudyNote | null;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
  onDownloaded?: () => void;
  onDeleteNote?: (noteId: string) => void;
  isAdmin?: boolean;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  note,
  subject,
  isOpen,
  onClose,
  onDownloaded,
  onDeleteNote,
  isAdmin = false,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !note) return null;

  const handleDownload = () => {
    downloadStudyNote(note);
    if (onDownloaded) onDownloaded();
  };

  const isImage = note.fileType === 'image' || 
    (note.fileData && (note.fileData.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(note.fileName)));

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteNote) {
        onDeleteNote(note.id);
      }
      setIsConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              {isImage ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-cyan-400 font-semibold">{subject?.code || 'STUDY MATERIAL'}</span>
                <span>·</span>
                <span>{note.unit}</span>
                <span>·</span>
                <span className="uppercase">{note.fileType}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">{note.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata info strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800/80 bg-slate-950/30 px-6 py-3 text-xs">
          <div>
            <span className="block text-slate-500">File Name</span>
            <span className="font-mono text-slate-300 truncate block" title={note.fileName}>{note.fileName}</span>
          </div>
          <div>
            <span className="block text-slate-500">Size</span>
            <span className="text-slate-300">{note.fileSize}</span>
          </div>
          <div>
            <span className="block text-slate-500">Upload Date</span>
            <span className="text-slate-300">{note.uploadDate}</span>
          </div>
          <div>
            <span className="block text-slate-500">Downloads</span>
            <span className="font-mono text-cyan-400">{note.downloadCount}</span>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {note.description && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Notes Summary / Description
              </h4>
              <p className="text-slate-300 leading-relaxed">{note.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              File Preview
            </h4>
            
            {isImage && note.fileData?.startsWith('data:image/') ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center max-h-80 overflow-hidden">
                <img 
                  src={note.fileData} 
                  alt={note.title} 
                  className="max-h-72 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-cyan-500/30">
                {note.fileData ? (
                  note.fileData.startsWith('data:') ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-cyan-400 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-sans font-medium text-slate-200">
                        {note.fileName} ({note.fileType.toUpperCase()})
                      </p>
                      <p className="text-xs font-sans text-slate-400 mt-1">
                        Digital study document ready. Click Download to save and open in your local reader.
                      </p>
                    </div>
                  ) : (
                    note.fileData
                  )
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <p>Notes uploaded by {note.uploadedBy}.</p>
                    <p className="mt-1 text-xs">Ready for instant download.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span>Uploaded by: <strong className="text-slate-200 font-normal">{note.uploadedBy}</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            {isAdmin && onDeleteNote && (
              <button
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download ({note.fileSize})</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        itemType="Note"
        itemName={note.fileName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
