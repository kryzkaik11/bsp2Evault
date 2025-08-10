import React from 'react';
import { motion } from 'framer-motion';
import { Folder } from './types';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { FolderIcon } from './components/layout/icons/Icons';

interface FolderCardProps {
  folder: Folder;
  onClick: (folderId: string) => void;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  isSelectionActive: boolean;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, isSelected, onToggleSelection, isSelectionActive }) => {

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelectionActive) {
      e.preventDefault();
      onToggleSelection(folder.id);
    } else {
      onClick(folder.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation(); // prevent card click event
    onToggleSelection(folder.id);
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, scale: 1.03 }}
      className="relative group"
    >
      <Card 
          className={`flex flex-col h-full transition-colors duration-200 ${isSelected ? 'border-primary' : 'hover:border-primary/50'}`}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if(e.key === 'Enter' || e.key === ' ') {
                isSelectionActive ? onToggleSelection(folder.id) : onClick(folder.id)
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Open folder ${folder.title}`}
      >
        <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isSelectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <input
                type="checkbox"
                checked={isSelected}
                onClick={handleCheckboxClick}
                onChange={() => {}}
                className="h-5 w-5 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
                aria-label={`Select folder ${folder.title}`}
            />
        </div>
        <CardHeader>
          <FolderIcon className="w-8 h-8 text-primary" />
        </CardHeader>
        <CardContent className="flex-grow pt-4">
          <p className="font-medium text-text-high truncate">{folder.title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FolderCard;