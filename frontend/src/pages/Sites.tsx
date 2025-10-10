import { useState, useEffect } from 'react';
import { Globe, Plus, Eye, Users, TrendingUp, MoreVertical, Trash2, Settings as SettingsIcon, Copy, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { sitesApi, Site } from '../lib/api';

interface SitesProps {
  onAddSite: () => void;
  refreshKey: number;
}

export const Sites = ({ onAddSite, refreshKey }: SitesProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [snippetData, setSnippetData] = useState<{ snippet: string; instructions: string } | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    loadSites();
  }, [refreshKey]);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sitesApi.getSites();
      
      if (response.success && response.data) {
        setSites(response.data.sites);
      } else {
        setError(response.error || 'Failed to load sites');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      const response = await sitesApi.deleteSite(siteId);
      if (response.success) {
        // Remove site from local state
        setSites(sites.filter(site => site.siteId !== siteId));
        setShowMenu(null);
        // If the deleted site was showing the snippet, clear it
        if (selectedSite?.siteId === siteId) {
          setSelectedSite(null);
          setSnippetData(null);
        }
      } else {
        setError(response.error || 'Failed to delete site');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete site');
    }
  };

  const handleViewSnippet = async (site: Site) => {
    try {
      setSelectedSite(site);
      const response = await sitesApi.getTrackingSnippet(site.siteId);
      
      if (response.success && response.data) {
        setSnippetData(response.data);
      } else {
        setError(response.error || 'Failed to load tracking snippet');
        // Fallback to generating snippet locally
        setSnippetData({
          snippet: `<script async src="https://api.trackless.dev/tracker.js" data-site-id="${site.siteId}"></script>`,
          instructions: 'Add this snippet to your website before the closing </body> tag'
        });
      }
    } catch (error: any) {
      setError('Failed to load tracking snippet');
      // Fallback to generating snippet locally
      setSnippetData({
        snippet: `<script async src="https://api.trackless.dev/tracker.js" data-site-id="${site.siteId}"></script>`,
        instructions: 'Add this snippet to your website before the closing </body> tag'
      });
    }
  };

  const handleCopySnippet = async () => {
    if (!snippetData) return;
    
    try {
      setCopying(true);
      await navigator.clipboard.writeText(snippetData.snippet);
      
      // Show temporary success state
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      setError('Failed to copy to clipboard');
      setCopying(false);
    }
  };

  const handleCloseSnippet = () => {
    setSelectedSite(null);
    setSnippetData(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Sites</h1>
          <p className="text-gray-600">Manage and monitor all your websites</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={onAddSite}>
          Add New Site
        </Button>
      </div>

      {/* Tracking Snippet Section - Only shows when a site is selected */}
      {selectedSite && snippetData && (
        <Card className="p-6 relative">
          {/* Close Button - Top Right */}
          <button
            onClick={handleCloseSnippet}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close tracking snippet"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-between mb-4 pr-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Tracking Snippet for {selectedSite.name}
            </h3>
            <Button 
              variant="secondary" 
              icon={copying ? <Copy className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopySnippet}
              disabled={copying}
            >
              {copying ? 'Copied!' : 'Copy Snippet'}
            </Button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <code className="text-sm text-green-400 break-all font-mono">
              {snippetData.snippet}
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {snippetData.instructions}
          </p>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {loading ? (
        <Card className="text-center py-16">
          <div className="text-gray-500">Loading sites...</div>
        </Card>
      ) : sites.length === 0 ? (
        <Card className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Globe className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first website to track</p>
          <Button icon={<Plus className="w-5 h-5" />} onClick={onAddSite}>
            Add Your First Site
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.siteId} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#59A5D8] to-[#3B8CB8] rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.domain}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === site.siteId ? null : site.siteId)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showMenu === site.siteId && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                      <button 
                        onClick={() => {
                          handleViewSnippet(site);
                          setShowMenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Get Tracking Code</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteSite(site.siteId)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#59A5D8]" />
                    <span className="text-sm text-gray-600">Pageviews</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{site.totalEvents ? formatNumber(site.totalEvents) : '0'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#59A5D8]" />
                    <span className="text-sm text-gray-600">Last Activity</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {site.lastEventAt ? new Date(site.lastEventAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#59A5D8]" />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <span className={`text-sm font-semibold ${site.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {site.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => handleViewSnippet(site)}
                >
                  Get Tracking Code
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};