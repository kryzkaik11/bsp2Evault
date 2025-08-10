
import React from 'react';

const Spinner: React.FC<{size?: string}> = ({ size = 'h-5 w-5' }) => {
  return (
    <div className={`${size} animate-spin rounded-full border-2 border-current border-t-transparent`} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
