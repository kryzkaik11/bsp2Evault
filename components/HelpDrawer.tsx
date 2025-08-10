
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { CloseIcon, HelpIcon } from './layout/icons/Icons';

interface HelpDrawerProps {
  onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      
      {/* Drawer */}
      <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <header className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <HelpIcon size={24} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-high">Help Center</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close help drawer">
            <CloseIcon size={20} />
          </Button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-text-mid">
                <p>Welcome to Academic Vault! Here's how to begin:</p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Use the "Upload" section on the Dashboard or in a folder to add your files.</li>
                    <li>Organize files into folders in the "My Vault" section.</li>
                    <li>Create "Collections" to group related files from different folders.</li>
                </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-text-mid">
              <div>
                <h4 className="font-semibold text-text-high">What file types are supported?</h4>
                <p>We support PDFs, DOCX, PPTX, MP4s, MP3s, and more. The upload dialog will show a full list.</p>
              </div>
              <div>
                <h4 className="font-semibold text-text-high">How does the AI processing work?</h4>
                <p>Once a file is uploaded, our system scans and processes it to make it searchable and to generate summaries or notes (feature coming soon).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
};

export default HelpDrawer;
