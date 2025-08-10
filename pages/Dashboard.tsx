import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import { AppFile, Role } from '../types';
import FileCard from '../components/FileCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { useAuth } from '../hooks/AuthContext';
import { SharedVaultIcon, UploadIcon, FolderIcon, CollectionIcon, SparklesIcon, FileIcon } from '../components/layout/icons/Icons';
import Skeleton from '../components/ui/Skeleton';

interface DashboardProps {
    setActiveView: (view: string) => void;
    addFiles: (files: File[]) => void;
    onFileSelect: (file: AppFile) => void;
}

const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button onClick={onClick} className="p-4 bg-surface rounded-lg text-left hover:bg-card border border-transparent hover:border-border transition-all duration-200 flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
    <div className="bg-primary/10 text-primary p-3 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-text-high">{title}</h3>
      <p className="text-sm text-text-mid">{description}</p>
    </div>
  </button>
);

const FileCardGridSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
        ))}
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ setActiveView, addFiles, onFileSelect }) => {
  const [recentFiles, setRecentFiles] = useState<AppFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  
  useEffect(() => {
    setLoading(true);
    api.getFiles(null).then(files => {
        setRecentFiles(files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4));
        setLoading(false);
    }).catch(console.error);
  }, []);

  if (profile?.role === Role.Guest) {
      return (
        <div className="flex items-center justify-center h-full">
            <Card className="text-center p-8">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome, Guest!</CardTitle>
                    <CardDescription>Try our AI-powered Quick Study tool without needing an account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setActiveView('quick-study')}>
                        <SparklesIcon className="mr-2" size={20}/>
                        Go to Quick Study
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
  }

  const welcomeName = profile?.role === Role.Admin ? 'Admin' : profile?.display_name;

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-text-high">Welcome back, {welcomeName}!</h1>
            <p className="text-text-mid mt-1">Ready to dive back into your studies? Here's a quick overview.</p>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard 
                  icon={<UploadIcon size={24}/>} 
                  title="Upload File"
                  description="Quickly add a new file to your vault root."
                  onClick={() => document.getElementById('quick-upload')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <QuickActionCard 
                  icon={<FolderIcon size={24}/>} 
                  title="Go to My Vault"
                  description="Browse your folders and manage files."
                  onClick={() => setActiveView('vault')}
                />
                <QuickActionCard 
                  icon={<CollectionIcon size={24}/>} 
                  title="View Collections"
                  description="Group related files from different places."
                  onClick={() => setActiveView('collections')}
                />
                <QuickActionCard 
                  icon={<SharedVaultIcon size={24}/>} 
                  title="Browse Shared Vault"
                  description="See files shared by instructors."
                  onClick={() => setActiveView('shared-vault')}
                />
            </div>
        </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-high">Recent Files</h2>
          <Button variant="ghost" onClick={() => setActiveView('vault')}>View All</Button>
        </div>
        {loading ? (
            <FileCardGridSkeleton />
        ) : recentFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentFiles.map(file => (
                <FileCard 
                    key={file.id} 
                    file={file} 
                    onSelect={onFileSelect} 
                    isSelected={false}
                    onToggleSelection={() => {}}
                    isSelectionActive={false}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-surface rounded-lg flex flex-col items-center justify-center">
                <FileIcon size={48} className="text-text-low mb-4"/>
                <h3 className="text-lg font-medium text-text-high">No recent files</h3>
                <p className="text-text-mid mt-2">Upload your first file to get started.</p>
                 <Button onClick={() => document.getElementById('quick-upload')?.scrollIntoView({ behavior: 'smooth' })} className="mt-4">
                    <UploadIcon className="mr-2" size={16}/>
                    Upload File
                 </Button>
            </div>
        )}
      </div>

      <Card id="quick-upload">
        <CardHeader>
          <CardTitle>Quick Upload to Vault Root</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload addFiles={addFiles} folderId={null} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;