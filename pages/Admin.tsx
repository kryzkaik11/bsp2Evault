import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { UserIcon, FileIcon, SharedVaultIcon, CollectionIcon } from '../components/layout/icons/Icons';
import { AppFile, Visibility } from '../types';
import Badge, { getStatusVariant } from '../components/ui/Badge';
import * as api from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import EditFileModal from '../components/admin/EditFileModal';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description?: string; loading?: boolean }> = ({ icon, title, value, description, loading }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-mid">{title}</CardTitle>
            <div className="text-text-low">{icon}</div>
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-7 w-20 mt-1 mb-2" /> : <div className="text-2xl font-bold text-text-high">{value}</div>}
            {loading ? <Skeleton className="h-3 w-32" /> : <p className="text-xs text-text-low">{description}</p>}
        </CardContent>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFiles: 0,
        storageUsed: '0 GB',
        sharedItems: 0,
        activeCollections: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const [allFiles, allFolders, allCollections] = await Promise.all([
                    api.getAllFiles(),
                    api.getAllFolders(),
                    api.getCollections()
                ]);

                const userIds = new Set<string>();
                allFiles.forEach(f => userIds.add(f.owner_id));
                allFolders.forEach(f => userIds.add(f.owner_id));
                
                const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);

                setStats({
                    totalUsers: userIds.size,
                    totalFiles: allFiles.length,
                    storageUsed: formatBytes(totalSize),
                    sharedItems: allFiles.filter(f => f.visibility === Visibility.Shared).length,
                    activeCollections: allCollections.length,
                });
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard loading={loading} icon={<UserIcon size={20}/>} title="Total Users" value={stats.totalUsers.toString()} description="Unique owners of items"/>
            <StatCard loading={loading} icon={<FileIcon size={20}/>} title="Total Files" value={stats.totalFiles.toString()} description={`${stats.storageUsed} storage used`}/>
            <StatCard loading={loading} icon={<SharedVaultIcon size={20}/>} title="Shared Items" value={stats.sharedItems.toString()} description="Published by instructors"/>
            <StatCard loading={loading} icon={<CollectionIcon size={20}/>} title="Active Collections" value={stats.activeCollections.toString()} description="Curated study groups"/>
        </div>
    );
};

const AdminFileManagement: React.FC = () => {
    const [allFiles, setAllFiles] = useState<AppFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFile, setEditingFile] = useState<AppFile | null>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const files = await api.getAllFiles();
            setAllFiles(files);
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleSaveFile = async (updatedFile: AppFile) => {
        await api.updateFileInApi(updatedFile);
        setEditingFile(null);
        await fetchFiles();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Advanced File Management</CardTitle>
                    <CardDescription>Manage all user files, tags, and publications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border border-border rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-mid">
                            <thead className="text-xs text-text-high uppercase bg-surface">
                                <tr>
                                    <th scope="col" className="px-6 py-3">File Name</th>
                                    <th scope="col" className="px-6 py-3">Owner ID</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Visibility</th>
                                    <th scope="col" className="px-6 py-3">Date Added</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="bg-card border-b border-border">
                                            <td className="px-6 py-4" colSpan={6}><Skeleton className="h-5 w-full" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    allFiles.map(file => (
                                        <tr key={file.id} className="bg-card border-b border-border hover:bg-surface">
                                            <th scope="row" className="px-6 py-4 font-medium text-text-high whitespace-nowrap">{file.title}</th>
                                            <td className="px-6 py-4 truncate max-w-xs">{file.owner_id}</td>
                                            <td className="px-6 py-4"><Badge variant={getStatusVariant(file.status)} className="capitalize">{file.status}</Badge></td>
                                            <td className="px-6 py-4 capitalize">{file.visibility}</td>
                                            <td className="px-6 py-4">{new Date(file.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingFile(file)}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {editingFile && (
                <EditFileModal
                    file={editingFile}
                    onSave={handleSaveFile}
                    onClose={() => setEditingFile(null)}
                />
            )}
        </>
    );
};


type AdminTab = 'dashboard' | 'files';

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const getTabClass = (tabName: AdminTab) => {
        return `whitespace-nowrap py-3 px-4 font-medium text-sm rounded-t-lg transition-colors cursor-pointer ${
            activeTab === tabName
            ? 'bg-surface text-primary'
            : 'text-text-mid hover:bg-surface/50 hover:text-text-high'
        }`;
    };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-high">Admin Console</h1>
      
      <div className="border-b border-border">
          <nav className="flex space-x-2">
             <button onClick={() => setActiveTab('dashboard')} className={getTabClass('dashboard')}>
                Dashboard
             </button>
             <button onClick={() => setActiveTab('files')} className={getTabClass('files')}>
                File Management
             </button>
          </nav>
      </div>
      
      <div>
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'files' && <AdminFileManagement />}
      </div>
    </div>
  );
};

export default Admin;