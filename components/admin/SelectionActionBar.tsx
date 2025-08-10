

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { CloseIcon, CheckSquareIcon } from '../layout/icons/Icons';

interface SelectionActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onTag: () => void;
  onPublish: () => void;
  showPublish?: boolean;
}

const SelectionActionBar: React.FC<SelectionActionBarProps> = ({
  selectedCount,
  onClear,
  onDelete,
  onTag,
  onPublish,
  showPublish = false,
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-card border border-border rounded-lg shadow-2xl z-40 flex items-center justify-between p-2"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear selection">
          <CloseIcon />
        </Button>
        <div className="flex items-center gap-2 text-text-high font-medium">
            <CheckSquareIcon className="text-primary"/>
            <span>{selectedCount} selected</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onTag}>Tag</Button>
        {showPublish && <Button variant="secondary" size="sm" onClick={onPublish}>Publish</Button>}
        <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
      </div>
    </motion.div>
  );
};

export default SelectionActionBar;