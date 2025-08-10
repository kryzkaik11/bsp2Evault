import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import Button from './ui/Button';
import { CloseIcon } from './layout/icons/Icons';

interface LegalModalProps {
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle>Legal Information</CardTitle>
                <CardDescription>Terms of Service & Privacy Policy</CardDescription>
            </div>
             <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
                <CloseIcon size={20} />
            </Button>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-text-high mb-2">Terms of Service</h3>
            <div className="space-y-2 text-text-mid text-sm">
                <p><strong>1. Acceptance of Terms:</strong> By accessing and using Academic Vault ("Service"), you accept and agree to be bound by the terms and provision of this agreement. This is a demonstration instance and should not be used for storing critical data.</p>
                <p><strong>2. User Conduct:</strong> You are responsible for all content you upload, share, or otherwise make available via the Service. You agree not to use the Service for any unlawful purpose or to upload any content that infringes on the intellectual property rights of others.</p>
                <p><strong>3. Service Provision:</strong> The Service is provided "as is" and "as available" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted or error-free.</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-high mb-2">Privacy Policy</h3>
            <div className="space-y-2 text-text-mid text-sm">
                <p><strong>1. Information Collection:</strong> We collect information you provide directly to us, such as when you create an account (e.g., email address). We also collect log information when you use the Service.</p>
                <p><strong>2. Use of Information:</strong> We use the information we collect to provide, maintain, and improve our services. Your files are considered private and will not be accessed by our staff except as required by law or for critical support issues.</p>
                <p><strong>3. Data Security:</strong> We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalModal;