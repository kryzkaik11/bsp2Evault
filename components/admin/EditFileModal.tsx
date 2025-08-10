import React, { useState } from 'react';
import { AppFile, Visibility } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { CloseIcon } from '../layout/icons/Icons';
import { motion } from 'framer-motion';

interface EditFileModalProps {
  file: AppFile;
  onSave: (updatedFile: AppFile) => void;
  onClose: () => void;
}

const EditFileModal: React.FC<EditFileModalProps> = ({ file, onSave, onClose }) => {
  const [title, setTitle] = useState(file.title);
  const [tags, setTags] = useState(file.tags.join(', '));
  const [visibility, setVisibility] = useState(file.visibility);

  const handleSave = () => {
    const updatedFile: AppFile = {
      ...file,
      title,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      visibility,
      updated_at: new Date(),
    };
    onSave(updatedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        />
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg"
        >
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Edit File Details</CardTitle>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                        <CloseIcon size={20}/>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="file-title" className="text-sm font-medium text-text-mid">Title</label>
                        <Input id="file-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="file-tags" className="text-sm font-medium text-text-mid">Tags (comma-separated)</label>
                        <Input id="file-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="file-visibility" className="text-sm font-medium text-text-mid">Visibility</label>
                        <select
                            id="file-visibility"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as Visibility)}
                            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-high ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value={Visibility.Private}>Private</option>
                            <option value={Visibility.Shared}>Shared</option>
                        </select>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>
        </motion.div>
    </div>
  );
};

export default EditFileModal;