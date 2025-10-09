import { useState } from 'react';
import { Globe, Copy, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { sitesApi } from '../../lib/api';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteAdded?: () => void;
}

export const AddSiteModal = ({ isOpen, onClose, onSiteAdded }: AddSiteModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [trackingSnippet, setTrackingSnippet] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !domain) {
      setError('Please fill in all required fields');
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      console.log('Creating site with:', { name, domain, description });
      console.log('Current token:', localStorage.getItem('authToken'));
      
      const response = await sitesApi.createSite(name, domain, description);
      
      if (response.success && response.data) {
        const site = response.data.site;
        setSiteId(site.siteId);
        
        // Get the tracking snippet
        try {
          const snippetResponse = await sitesApi.getTrackingSnippet(site.siteId);
          if (snippetResponse.success && snippetResponse.data) {
            setTrackingSnippet(snippetResponse.data.snippet);
          }
        } catch (snippetError: any) {
          console.warn('Failed to get tracking snippet:', snippetError);
          // Still show success even if snippet fails
          setTrackingSnippet(`<script async src="http://localhost:5001/tracker.js" data-site-id="${site.siteId}"></script>`);
        }
        
        setStep('success');
        if (onSiteAdded) {
          onSiteAdded();
        }
      } else {
        setError(response.error || 'Failed to create site');
      }
    } catch (error: any) {
      console.error('Site creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please sign in again.');
      } else {
        setError(error.message || 'Failed to create site');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep('form');
    setName('');
    setDomain('');
    setDescription('');
    setError('');
    setSiteId('');
    setTrackingSnippet('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'form' ? 'Add New Site' : 'Site Created Successfully'}>
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Site Name"
            placeholder="My Awesome Website"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<Globe className="w-5 h-5" />}
          />

          <Input
            type="text"
            label="Domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            icon={<Globe className="w-5 h-5" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your website"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#59A5D8] transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Add Site
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <p className="text-center text-gray-600 mb-4">
            Your site has been added successfully! Copy the tracking snippet below and paste it into your website's HTML, just before the closing tag.
          </p>

          <div className="bg-gray-900 rounded-lg p-4 relative">
            <pre className="text-xs text-gray-100 overflow-x-auto">
              <code>{trackingSnippet}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Site ID:</strong> {siteId}
            </p>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};
