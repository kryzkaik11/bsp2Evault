
import React from 'react';
import { Folder } from '../types';

interface BreadcrumbsProps {
  path: Folder[];
  onNavigate: (folderId: string | null) => void;
  rootLabel?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onNavigate, rootLabel = "My Vault" }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <button
            onClick={() => onNavigate(null)}
            className="inline-flex items-center text-sm font-medium text-text-mid hover:text-primary"
          >
            {rootLabel}
          </button>
        </li>
        {path.map((folder, index) => (
          <li key={folder.id}>
            <div className="flex items-center">
              <span className="mx-2.5 text-text-low">/</span>
              {index === path.length - 1 ? (
                <span className="text-sm font-medium text-text-high" aria-current="page">
                  {folder.title}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(folder.id)}
                  className="text-sm font-medium text-text-mid hover:text-primary"
                >
                  {folder.title}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
