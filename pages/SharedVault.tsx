import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';
import { AppFile, Folder } from '../types';
import FileCard from '../components/FileCard';
import FolderCard from '../FolderCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { SharedVaultIcon } from '../components/layout/icons/Icons';

interface SharedVaultProps {
    onFileSelect: (file: AppFile) => void;
    updateFile: (file: AppFile) => void;
}

const SharedVault: React.FC<SharedVaultProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
        api.getSharedFiles(currentFolderId),
        api.getSharedFolders(currentFolderId),
        api.getFolderPath(currentFolderId)
    ]).then(([filesData, foldersData, pathData]) => {
        setFiles(filesData);
        setFolders(foldersData);
        setPath(pathData);
        setLoading(false);
    }).catch(console.error);
  }, [currentFolderId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <SharedVaultIcon size={32} className="text-primary"/>
            <h1 className="text-3xl font-bold text-text-high">Shared Vault</h1>
        </div>
        <Breadcrumbs path={path} onNavigate={setCurrentFolderId} rootLabel="Shared Root" />

        {loading ? (
             <div className="text-center py-16 bg-surface rounded-lg">
                <p className="text-text-mid">Loading...</p>
            </div>
        ) : (
             <>
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
                                        isSelected={false}
                                        onToggleSelection={() => {}}
                                        isSelectionActive={false}
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
                                        isSelected={false}
                                        onToggleSelection={() => {}}
                                        isSelectionActive={false}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="text-center py-16 bg-surface rounded-lg">
                    <h3 className="text-lg font-medium text-text-high">This folder is empty</h3>
                    <p className="text-text-mid mt-2">No shared files or folders here.</p>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default SharedVault;