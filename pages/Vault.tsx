import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileCard from '../components/FileCard';
import FolderCard from '../FolderCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { AppFile, Folder, Role } from '../types';
import * as api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FileUpload from '../components/FileUpload';
import SelectionActionBar from '../components/admin/SelectionActionBar';
import { useAuth } from '../hooks/AuthContext';


interface VaultProps {
    files: AppFile[];
    folders: Folder[];
    currentFolderId: string | null;
    setCurrentFolderId: (folderId: string | null) => void;
    onCreateFolder: (title: string) => void;
    addFiles: (files: File[]) => void;
    updateFile: (file: AppFile) => void;
    onFileSelect: (file: AppFile) => void;
    refreshData: () => void;
}

const Vault: React.FC<VaultProps> = ({ files, folders, currentFolderId, setCurrentFolderId, onCreateFolder, addFiles, updateFile, onFileSelect, refreshData }) => {
  const [path, setPath] = useState<Folder[]>([]);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    api.getFolderPath(currentFolderId).then(setPath);
    setSelectedIds([]); // Clear selection when folder changes
  }, [currentFolderId]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
        onCreateFolder(newFolderName.trim());
        setNewFolderName("");
        setShowNewFolderInput(false);
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)? This action cannot be undone.`)) {
        const fileIdsToDelete = selectedIds.filter(id => files.some(f => f.id === id));
        const folderIdsToDelete = selectedIds.filter(id => folders.some(f => f.id === id));
        
        try {
            await api.deleteItems(fileIdsToDelete, folderIdsToDelete);
        } catch(error) {
            console.error("Failed to delete items", error);
            // TODO: show error toast
        } finally {
            refreshData();
            setSelectedIds([]);
        }
    }
  };

  const handlePublish = async () => {
    const fileIdsToPublish = selectedIds.filter(id => files.some(f => f.id === id));
    if (fileIdsToPublish.length === 0) {
        alert("Only files can be published. Please select at least one file.");
        return;
    }

    try {
        await api.publishFiles(fileIdsToPublish);
    } catch(error) {
        console.error("Failed to publish files", error);
    } finally {
        refreshData();
        setSelectedIds([]);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const isAdmin = profile?.role === Role.Admin;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumbs path={path} onNavigate={setCurrentFolderId} />
        <Button onClick={() => setShowNewFolderInput(true)}>New Folder</Button>
      </div>

      {showNewFolderInput && (
        <form onSubmit={handleCreateFolder} className="flex items-center gap-2 p-4 bg-surface rounded-lg">
            <Input 
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
            />
            <Button type="submit">Create</Button>
            <Button variant="ghost" onClick={() => setShowNewFolderInput(false)}>Cancel</Button>
        </form>
      )}

      {(folders.length > 0 || files.length > 0) ? (
        <>
          {folders.length > 0 && (
            <div>
                <h2 className="text-lg font-bold text-text-mid mb-4">Folders</h2>
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {folders.map(folder => (
                        <FolderCard 
                            key={folder.id} 
                            folder={folder} 
                            onClick={setCurrentFolderId}
                            isSelected={selectedIds.includes(folder.id)}
                            onToggleSelection={handleToggleSelection}
                            isSelectionActive={selectedIds.length > 0}
                        />
                    ))}
                </motion.div>
            </div>
          )}
           {files.length > 0 && (
            <div>
                 <h2 className="text-lg font-bold text-text-mid my-4">Files</h2>
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {files.map(file => (
                        <FileCard 
                            key={file.id} 
                            file={file} 
                            onSelect={onFileSelect}
                            isSelected={selectedIds.includes(file.id)}
                            onToggleSelection={handleToggleSelection}
                            isSelectionActive={selectedIds.length > 0}
                        />
                    ))}
                </motion.div>
            </div>
           )}
        </>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg">
          <h3 className="text-lg font-medium text-text-high">This folder is empty</h3>
          <p className="text-text-mid mt-2">Upload some files or create a new folder.</p>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-text-mid mb-4">Upload to this folder</h2>
        <FileUpload addFiles={addFiles} folderId={currentFolderId} />
      </div>

       <AnimatePresence>
        {selectedIds.length > 0 && (
          <SelectionActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onDelete={handleDelete}
            onTag={() => { console.log('Tagging:', selectedIds); }}
            onPublish={handlePublish}
            showPublish={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;