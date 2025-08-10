

import React from 'react';
import { AppFile } from '../types';
import { Card, CardContent } from './ui/Card';
import { FileIcon } from './layout/icons/Icons';
import Spinner from './ui/Spinner';

interface FilePreviewProps {
    file: AppFile;
    fileContent: string | null;
    isLoading: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, fileContent, isLoading }) => {
    const renderPreview = () => {
        if (isLoading) {
            return (
                 <div className="text-center py-16 bg-surface rounded-lg flex flex-col items-center justify-center min-h-[400px]">
                    <Spinner size="h-10 w-10" />
                    <p className="mt-4 text-text-mid">Loading file content...</p>
                 </div>
            )
        }
        
        if (fileContent) {
            return (
                <div className="w-full h-[60vh] bg-surface rounded-lg p-4 border border-border">
                    <textarea
                        readOnly
                        value={fileContent}
                        className="w-full h-full bg-transparent border-0 resize-none text-text-mid focus:outline-none"
                        aria-label="File content preview"
                    />
                </div>
            )
        }

        return (
             <div className="text-center py-16 bg-surface rounded-lg flex flex-col items-center justify-center min-h-[400px]">
                <FileIcon size={48} className="text-text-low mb-4"/>
                <h3 className="text-xl font-medium text-text-high">Preview Not Available</h3>
                <p className="text-text-mid mt-2 max-w-md">
                   Could not load content for <strong>{file.title}</strong>. It might be a non-text file (like an image or video) or an error occurred.
                </p>
                <p className="text-text-mid mt-1 max-w-md">
                    You can still try the AI tools, but they may be less accurate.
                </p>
            </div>
        );
    };

    return (
        <Card className="bg-transparent border-0">
            <CardContent className="p-0">
                {renderPreview()}
            </CardContent>
        </Card>
    );
};

export default FilePreview;