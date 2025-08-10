
import React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ children, className }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium text-text-mid bg-surface rounded-md border border-border ${className}`}
    >
      {children}
    </span>
  );
};

export default Tag;
