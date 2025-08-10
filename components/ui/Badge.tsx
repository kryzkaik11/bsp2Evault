
import React from 'react';
import { FileStatus } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'processing' | 'ready' | 'error' | 'secondary';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-accent text-accent-foreground',
    processing: 'border-transparent bg-warning text-accent-foreground',
    ready: 'border-transparent bg-success text-accent-foreground',
    error: 'border-transparent bg-error text-primary-foreground',
  };

  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />;
};

export const getStatusVariant = (status: FileStatus): BadgeProps['variant'] => {
    switch (status) {
        case FileStatus.Ready:
            return 'ready';
        case FileStatus.Processing:
        case FileStatus.Scanning:
        case FileStatus.Uploading:
            return 'processing';
        case FileStatus.Error:
        case FileStatus.Quarantined:
            return 'error';
        default:
            return 'default';
    }
};

export default Badge;
