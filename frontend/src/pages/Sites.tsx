import React, { useState, useEffect } from 'react';
import { Globe, Plus, Eye, Users, TrendingUp, MoreVertical, Trash2, Settings, Code, Copy, Check, X, ExternalLink } from 'lucide-react';
import { sitesApi, Site } from '../lib/api';
import { Button } from '../components/ui/Button';

interface SitesProps {
  onAddSite: () => void;
  refreshKey: number;
}

export const Sites = ({ onAddSite, refreshKey }: SitesProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setSites(sites.filter(site => site.siteId !== siteId));
        setShowMenu(null);
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
        setSnippetData({
          snippet: `<script async src="https://api.trackless.dev/tracker.js" data-site-id="${site.siteId}"></script>`,
          instructions: 'Add this snippet to your website before the closing </body> tag'
        });
      }
    } catch (error: any) {
      setError('Failed to load tracking snippet');
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Sites</h1>
              <p className="text-gray-600">Manage and monitor all your websites</p>
            </div>
            
            <button
              onClick={onAddSite}
              className="flex items-center gap-2 px-6 py-3 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add New Site
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tracking Snippet Modal */}
        {selectedSite && snippetData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative">
              <button
                onClick={handleCloseSnippet}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Tracking Code</h3>
              <p className="text-gray-600 mb-6">Add this snippet to your website before the closing &lt;/body&gt; tag</p>

              <div className="bg-gray-900 rounded-xl p-4 mb-4 relative">
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{snippetData.snippet}</code>
                </pre>
                <button
                  onClick={handleCopySnippet}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copying ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Site ID:</strong> {selectedSite.siteId}
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Instructions:</strong> {snippetData.instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
            <div className="text-gray-500">Loading sites...</div>
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Globe className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No sites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your first website to track analytics
            </p>
            <button
              onClick={onAddSite}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Your First Site
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div key={site.siteId} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{site.name}</h3>
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
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                        <button
                          onClick={() => {
                            handleViewSnippet(site);
                            setShowMenu(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Code className="w-4 h-4" />
                          Get Tracking Code
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={() => handleDeleteSite(site.siteId)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">Pageviews</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {site.totalEvents ? formatNumber(site.totalEvents) : '0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">Last Activity</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {site.lastEventAt ? new Date(site.lastEventAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">Status</span>
                    </div>
                    <span className={`text-sm font-bold ${site.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${site.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">{site.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button
                    onClick={() => handleViewSnippet(site)}
                    className="text-sm text-[#FDC726] hover:text-[#e5b520] font-semibold"
                  >
                    View Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};