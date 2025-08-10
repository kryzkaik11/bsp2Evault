
import React from 'react';

interface FooterProps {
    onLegalClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLegalClick }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onLegalClick();
  }
  return (
    <footer className="px-8 py-3 border-t border-border text-xs text-text-low bg-background">
      <div className="flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} Academic Vault</span>
        <div className="flex items-center space-x-4">
          <button onClick={handleLinkClick} className="hover:text-text-mid transition-colors">Terms of Service</button>
          <button onClick={handleLinkClick} className="hover:text-text-mid transition-colors">Privacy Policy</button>
          <a href="#" className="hover:text-text-mid transition-colors">Status</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
