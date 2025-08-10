


import React from 'react';
import { motion } from 'framer-motion';
import { AppFile, FileStatus, FileType } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import Tag from './ui/Tag';
import { FileIcon, VideoIcon, AudioIcon, SparklesIcon } from './layout/icons/Icons';
import Badge, { getStatusVariant } from './ui/Badge';
import Progress from './ui/Progress';

interface FileCardProps {
  file: AppFile;
  onSelect: (file: AppFile) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  isSelectionActive: boolean;
}

const FileTypeIcon: React.FC<{ type: FileType }> = ({ type }) => {
  const fileTypeStr = type.toLowerCase();
  if (['mp4', 'mov'].includes(fileTypeStr)) {
    return <VideoIcon className="w-6 h-6 text-accent" />;
  }
  if (['mp3', 'wav', 'm4a'].includes(fileTypeStr)) {
    return <AudioIcon className="w-6 h-6 text-accent" />;
  }
  return <FileIcon className="w-6 h-6 text-primary" />;
};


const FileCard: React.FC<FileCardProps> = ({ file, onSelect, isSelected, onToggleSelection, isSelectionActive }) => {
  const isProcessing = [
    FileStatus.Uploading,
    FileStatus.Scanning,
    FileStatus.Processing,
  ].includes(file.status);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelectionActive) {
        e.preventDefault();
        onToggleSelection(file.id);
    } else if (!isProcessing) {
        onSelect(file);
    }
  }
  
  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation(); // prevent card click event
      onToggleSelection(file.id);
  }

  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, scale: 1.03 }}
        className="relative"
    >
        <Card 
            className={`flex flex-col h-full transition-colors duration-200 ${isProcessing ? 'cursor-default' : ''} ${isSelected ? 'border-primary' : 'hover:border-primary/50'}`}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (isSelectionActive) {
                        onToggleSelection(file.id)
                    } else if (!isProcessing) {
                        onSelect(file)
                    }
                }
            }}
            tabIndex={isProcessing ? -1 : 0}
            role="button"
            aria-label={`Open file ${file.title}`}
        >
        <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isSelectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
             <input
                type="checkbox"
                checked={isSelected}
                onClick={handleCheckboxClick}
                onChange={() => {}} // onChange is required but logic is in onClick
                className="h-5 w-5 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
                aria-label={`Select file ${file.title}`}
            />
        </div>
        <CardHeader>
            <div className="flex items-start justify-between">
            <FileTypeIcon type={file.type} />
            <Badge variant={getStatusVariant(file.status)} className="capitalize">{file.status}</Badge>
            </div>
            <CardTitle className="pt-4 truncate text-base">{file.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            {isProcessing && (
                <div className="flex items-center justify-center text-xs text-text-mid animate-pulse">
                    <SparklesIcon size={16} className="mr-2 text-accent" />
                    Processing AI...
                </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
            {file.tags.slice(0, 3).map(tag => (
            <Tag key={tag}>{tag}</Tag>
            ))}
            {file.tags.length > 3 && <Tag>+{file.tags.length - 3}</Tag>}
        </CardFooter>
        </Card>
    </motion.div>
  );
};

export default FileCard;