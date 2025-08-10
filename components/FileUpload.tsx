

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AppFile, Role } from '../types';
import { useAuth } from '../hooks/AuthContext';
import Button from './ui/Button';
import { UploadIcon } from './layout/icons/Icons';

const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface FileUploadProps {
    addFiles: (files: File[]) => void;
    folderId: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ addFiles, folderId }) => {
  const { user, profile } = useAuth();
  const isGuest = profile?.role === Role.Guest;

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (!user || !profile) {
        alert("Please sign in to upload files.");
        return;
    }

    if (isGuest) {
        alert("Guests cannot upload files. Please sign in with an account.");
        return;
    }

    if (!user.email_confirmed_at) {
        alert("Please verify your email address before uploading files.");
        return;
    }
    
    addFiles(acceptedFiles);
    
    if (fileRejections.length > 0) {
      alert(`Some files were rejected. Please ensure they are under ${MAX_SIZE_MB}MB and of a supported type.`);
      console.log('Rejected files:', fileRejections);
    }
  }, [user, profile, addFiles, isGuest]);

  const isDisabled = !user || !user.email_confirmed_at || isGuest;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE_BYTES,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt', '.md'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/x-m4a': ['.m4a'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    disabled: isDisabled,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors
        ${isDragActive ? 'border-primary bg-surface' : 'border-border'}
        ${isDisabled ? 'cursor-not-allowed bg-card/50' : 'cursor-pointer hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <UploadIcon className="w-10 h-10 mb-4 text-text-mid" />
        <p className="mb-2 text-lg text-text-high">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-text-mid">Max file size: {MAX_SIZE_MB}MB. Supported types: PDF, DOCX, PPTX, etc.</p>
        {isDisabled && (
            <p className="text-sm text-warning mt-2">
                {isGuest ? "Guests cannot upload files." : "Please sign in and verify your email to upload files."}
            </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;