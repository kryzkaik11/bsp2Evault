

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import Vault from '../../pages/Vault';
import Admin from '../../pages/Admin';
import Onboarding from '../Onboarding';
import Footer from './Footer';
import { AppFile, Folder, Role } from '../../types';
import { useAuth } from '../../hooks/AuthContext';
import * as api from '../../services/api';
import Collections from '../../pages/Collections';
import HelpDrawer from '../HelpDrawer';
import LegalModal from '../LegalModal';
import FileDetail from '../../pages/FileDetail';
import SharedVault from '../../pages/SharedVault';
import QuickStudy from '../../pages/QuickStudy';
import WhatsNewModal from '../WhatsNewModal';
import AccountModal from '../AccountModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';


const AppLayout: React.FC<{ showOnboarding: boolean }> = ({ showOnboarding }) => {
  const { profile, completeOnboarding } = useAuth();
  
  const [activeView, setActiveView] = useState(profile?.role === Role.Guest ? 'quick-study' : 'dashboard');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(null);

  const [files, setFiles] = useState<AppFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isLegalOpen, setLegalOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useLocalStorage('whatsNew_202407', true);
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [initialAccountTab, setInitialAccountTab] = useState<'profile' | 'settings'>('profile');


  const refreshAllFolders = () => {
    api.getAllFolders().then(setAllFolders).catch(console.error);
  };
  
  useEffect(() => {
    refreshAllFolders();
  }, []);

  const refreshData = (folderId: string | null = currentFolderId) => {
    Promise.all([
      api.getFiles(folderId),
      api.getFolders(folderId)
    ]).then(([filesData, foldersData]) => {
      setFiles(filesData);
      setFolders(foldersData);
    }).catch(console.error);
  };

  useEffect(() => {
    if (activeView === 'vault') {
        refreshData(currentFolderId);
    }
  }, [currentFolderId, activeView]);

  const addFilesToState = async (newFiles: File[], folderId: string | null) => {
    if (!profile) return;
    try {
        const uploadPromises = newFiles.map(file => api.addFile(file, profile.id, folderId));
        await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading files:", error);
        // Here you could show an error notification to the user
    } finally {
        refreshData(folderId);
    }
  };

  const updateFileInState = (updatedFile: AppFile) => {
    api.updateFileInApi(updatedFile).then(() => {
       setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)));
       if (selectedFile?.id === updatedFile.id) {
           setSelectedFile(updatedFile);
       }
    }).catch(console.error);
  };

  const handleAddSampleFiles = async () => {
    if(!profile) return;
    try {
        await api.addSampleFiles(profile.id);
    } catch (error) {
        console.error("Failed to add sample files", error);
    } finally {
        refreshData(currentFolderId);
    }
  };

  const handleCreateFolder = async (title: string) => {
    if (!profile) return;
    await api.createFolder(title, currentFolderId, profile.id);
    refreshData(currentFolderId);
    refreshAllFolders();
  };

  const handleFileSelect = (file: AppFile) => {
    setSelectedFile(file);
  };

  const handleBackToVault = () => {
    setSelectedFile(null);
  };

  const handleAccountClick = (tab: 'profile' | 'settings') => {
    setInitialAccountTab(tab);
    setAccountModalOpen(true);
  };

  if (selectedFile) {
    return <FileDetail file={selectedFile} onBack={handleBackToVault} updateFile={updateFileInState} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
                    key="dashboard"
                    setActiveView={setActiveView} 
                    onFileSelect={handleFileSelect}
                    addFiles={(files) => addFilesToState(files, null)}
                />;
      case 'vault':
        return <Vault
                    key="vault"
                    files={files} 
                    folders={folders} 
                    currentFolderId={currentFolderId}
                    setCurrentFolderId={setCurrentFolderId}
                    onCreateFolder={handleCreateFolder}
                    addFiles={(files) => addFilesToState(files, currentFolderId)}
                    updateFile={updateFileInState}
                    onFileSelect={handleFileSelect}
                    refreshData={() => refreshData(currentFolderId)}
                />;
      case 'shared-vault':
        return <SharedVault key="shared-vault" onFileSelect={handleFileSelect} updateFile={updateFileInState} />;
      case 'quick-study':
        return <QuickStudy key="quick-study" />;
      case 'collections':
        return <Collections key="collections" onFileSelect={handleFileSelect} />;
      case 'admin':
        return <Admin key="admin" />;
      default:
        return profile?.role === Role.Guest 
            ? <QuickStudy key="quick-study-default" /> 
            : <Dashboard 
                    key="dashboard-default"
                    setActiveView={setActiveView} 
                    onFileSelect={handleFileSelect}
                    addFiles={(files) => addFilesToState(files, null)}
                />;
    }
  };

  const pageVariants = {
      initial: { opacity: 0, y: 20 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -20 },
  };

  const pageTransition: Transition = {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.4,
  };


  return (
    <div className="flex h-screen bg-background text-text-high">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        setCurrentFolderId={setCurrentFolderId}
        allFolders={allFolders}
        onHelpClick={() => setHelpOpen(true)}
        isOpen={isSidebarOpen}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} onAccountClick={handleAccountClick} />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {renderActiveView()}
              </motion.div>
          </AnimatePresence>
        </main>
        <Footer onLegalClick={() => setLegalOpen(true)} />
      </div>
      {showOnboarding && (
          <Onboarding 
            onComplete={completeOnboarding}
            addSampleFiles={handleAddSampleFiles}
          />
        )}
      {showWhatsNew && !showOnboarding && profile?.role !== Role.Guest && (
        <WhatsNewModal onClose={() => setShowWhatsNew(false)} />
      )}
      {isHelpOpen && <HelpDrawer onClose={() => setHelpOpen(false)} />}
      {isLegalOpen && <LegalModal onClose={() => setLegalOpen(false)} />}
      {isAccountModalOpen && <AccountModal isOpen={isAccountModalOpen} onClose={() => setAccountModalOpen(false)} initialTab={initialAccountTab} />}
    </div>
  );
};

export default AppLayout;
