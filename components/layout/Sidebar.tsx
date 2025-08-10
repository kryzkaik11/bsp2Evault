import React, { useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { Role, Folder } from '../../types';
import { HomeIcon, VaultIcon, AdminIcon, LogoutIcon, ChevronDoubleLeftIcon, CollectionIcon, HelpIcon, FolderIcon, SharedVaultIcon, SparklesIcon } from './icons/Icons';
import FolderTree from './FolderTree';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  setCurrentFolderId: (folderId: string | null) => void;
  allFolders: Folder[];
  onHelpClick: () => void;
  isOpen: boolean;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}> = ({ icon, label, isActive, onClick, collapsed }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-text-mid hover:bg-surface hover:text-text-high transition-colors ${
        isActive ? 'bg-surface text-text-high' : ''
      } ${collapsed ? 'justify-center' : ''}`}
    >
      {icon}
      <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, setCurrentFolderId, allFolders, onHelpClick, isOpen }) => {
  const { profile, updateUserSettings } = useAuth();
  
  const collapsed = profile?.settings?.sidebar_collapsed ?? false;
  const setCollapsed = (value: boolean) => updateUserSettings({ sidebar_collapsed: value });
  const isGuest = profile?.role === Role.Guest;

  const handleFolderSelect = (folderId: string) => {
      setCurrentFolderId(folderId);
      setActiveView('vault');
  }

  const sidebarContent = (
      <div className="h-full px-3 py-4 overflow-y-auto overflow-x-hidden flex flex-col relative">
        <div className={`flex items-center mb-5 ${collapsed ? 'justify-center' : 'pl-2.5'}`}>
            <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .9C5.88.9.9 5.88.9 12s4.98 11.1 11.1 11.1 11.1-4.98 11.1-11.1S18.12.9 12 .9zm0 20.28c-5.04 0-9.18-4.14-9.18-9.18S6.96 2.82 12 2.82s9.18 4.14 9.18 9.18-4.14 9.18-9.18 9.18zm-.9-13.95h1.8v7.2h-1.8zM12 16.2c.75 0 1.35-.6 1.35-1.35s-.6-1.35-1.35-1.35-1.35.6-1.35 1.35.6 1.35 1.35 1.35z"/>
            </svg>
            <span className={`self-center text-xl font-semibold whitespace-nowrap text-text-high ml-3 transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              Academic Vault
            </span>
        </div>
        <ul className="space-y-2 font-medium flex-grow">
          {!isGuest && (
            <NavItem
              icon={<HomeIcon size={20} />}
              label="Dashboard"
              isActive={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
              collapsed={collapsed}
            />
          )}

          {isGuest && (
            <NavItem
              icon={<SparklesIcon size={20} />}
              label="Quick Study"
              isActive={activeView === 'quick-study'}
              onClick={() => setActiveView('quick-study')}
              collapsed={collapsed}
            />
          )}

          {!isGuest && (
            <>
                <NavItem
                    icon={<VaultIcon size={20} />}
                    label="My Vault"
                    isActive={activeView === 'vault'}
                    onClick={() => {
                        setActiveView('vault');
                        setCurrentFolderId(null);
                    }}
                    collapsed={collapsed}
                />
                {!collapsed && <FolderTree parentId={null} allFolders={allFolders.filter(f => f.visibility !== 'shared')} onFolderSelect={handleFolderSelect} collapsed={collapsed}/>}
            </>
          )}

          <NavItem
            icon={<SharedVaultIcon size={20} />}
            label="Shared Vault"
            isActive={activeView === 'shared-vault'}
            onClick={() => setActiveView('shared-vault')}
            collapsed={collapsed}
          />

          {!isGuest && (
            <NavItem
                icon={<CollectionIcon size={20} />}
                label="Collections"
                isActive={activeView === 'collections'}
                onClick={() => setActiveView('collections')}
                collapsed={collapsed}
            />
          )}
        </ul>
        <div className="mt-auto space-y-2 font-medium">
          {profile?.role === Role.Admin && (
            <NavItem
              icon={<AdminIcon size={20} />}
              label="Admin Console"
              isActive={activeView === 'admin'}
              onClick={() => setActiveView('admin')}
              collapsed={collapsed}
            />
          )}
          <NavItem
            icon={<HelpIcon size={20} />}
            label="Help"
            isActive={activeView === 'help'}
            onClick={onHelpClick}
            collapsed={collapsed}
          />
          
          <div className="border-t border-border mx-2 my-2"></div>

          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex items-center p-3 w-full rounded-lg text-text-mid hover:bg-surface hover:text-text-high transition-colors ${collapsed ? 'justify-center' : 'justify-end'}`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
             <ChevronDoubleLeftIcon size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
  );

  return (
    <aside
      className={`
        bg-background 
        fixed md:relative
        inset-y-0 left-0 z-40
        transition-all duration-300 ease-in-out
        ${collapsed ? 'md:w-20' : 'md:w-64'}
        w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        flex-shrink-0
      `}
      aria-label="Sidebar"
    >
        {sidebarContent}
    </aside>
  );
};


const FolderTree: React.FC<{
    parentId: string | null;
    allFolders: Folder[];
    onFolderSelect: (folderId: string) => void;
    collapsed: boolean;
    level?: number;
}> = ({ parentId, allFolders, onFolderSelect, collapsed, level = 0 }) => {
    const childFolders = allFolders.filter(f => f.parent_id === parentId);

    if (collapsed || childFolders.length === 0) return null;

    return (
        <ul className="pl-4">
            {childFolders.map(folder => (
                <li key={folder.id}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onFolderSelect(folder.id);
                        }}
                        className="flex items-center p-2 rounded-lg text-text-mid hover:bg-surface"
                        style={{ paddingLeft: `${level * 1 + 0.5}rem`}}
                    >
                        <FolderIcon size={16} className="mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap truncate">{folder.title}</span>
                    </a>
                    <FolderTree parentId={folder.id} allFolders={allFolders} onFolderSelect={onFolderSelect} collapsed={collapsed} level={level + 1} />
                </li>
            ))}
        </ul>
    );
};


export default Sidebar;