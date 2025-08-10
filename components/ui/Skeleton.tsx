
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
