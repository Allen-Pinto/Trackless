import React, { useState, useEffect } from 'react';
import { Eye, Users, MousePointer, Clock, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardData {
  overview: {
    pageviews: number;
    uniqueVisitors: number;
    sessions: number;
    avgDuration: number;
    bounceRate: number;
    activeSessions: number;
  };
  charts: {
    pageviewsOverTime: Array<{
      date: string;
      pageviews: number;
      uniqueVisitors: number;
    }>;
    topPages: Array<{
      page: string;
      views: number;
      uniqueVisitors: number;
    }>;
    referrers: Array<{
      referrer: string;
      visits: number;
      uniqueVisitors: number;
    }>;
    devices: Array<{
      device: string;
      pageviews: number;
      uniqueVisitors: number;
    }>;
  };
}

interface Site {
  _id: string;
  name: string;
  domain: string;
}

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'https://trackless-fxoj.onrender.com';

  // Fetch sites on mount
  useEffect(() => {
    fetchSites();
  }, []);

  // Fetch dashboard data when site or date range changes
  useEffect(() => {
    if (selectedSiteId) {
      fetchDashboardData();
    }
  }, [dateRange, selectedSiteId]);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('Fetching sites...');

      const response = await fetch(`${API_URL}/api/sites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Sites response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }

      const data = await response.json();
      console.log('Sites data:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        setSites(data.data);
        setSelectedSiteId(data.data[0]._id); // Auto-select first site
        console.log('Selected site:', data.data[0]._id);
      } else {
        // No sites - show empty state
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError('Failed to load sites');
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedSiteId) {
      console.log('No site selected, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching dashboard data for site:', selectedSiteId);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const url = `${API_URL}/api/analytics/dashboard?siteId=${selectedSiteId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      console.log('Dashboard URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Dashboard response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard data:', data);
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = dashboardData ? [
    {
      title: 'Total Pageviews',
      value: dashboardData.overview.pageviews.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Unique Visitors',
      value: dashboardData.overview.uniqueVisitors.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Avg. Session Duration',
      value: formatDuration(dashboardData.overview.avgDuration),
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Bounce Rate',
      value: `${dashboardData.overview.bounceRate}%`,
      change: '-5.4%',
      changeType: 'positive' as const,
      icon: MousePointer,
      color: 'from-orange-500 to-orange-600'
    }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FDC726] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-6 break-words">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                setError('');
                fetchSites();
              }}
              className="w-full px-6 py-2 bg-[#FDC726] text-gray-900 rounded-lg font-semibold hover:bg-[#e5b520] transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/signin';
              }}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No sites - show welcome message
  if (sites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FDC726] to-[#e5b520] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Trackless!</h3>
          <p className="text-gray-600 mb-6">
            You haven't added any sites yet. Add your first site to start tracking analytics.
          </p>
          <button 
            onClick={() => {
              // Navigate to sites page and trigger modal
              window.dispatchEvent(new CustomEvent('navigate-to-sites'));
            }}
            className="px-8 py-3 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-colors shadow-sm"
          >
            Add Your First Site
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...dashboardData.charts.pageviewsOverTime.map(d => d.pageviews), 1);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your website performance in real-time</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Site Selector - Only show if multiple sites */}
              {sites.length > 1 && (
                <select 
                  value={selectedSiteId || ''}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-[#FDC726] transition-colors"
                >
                  {sites.map((site) => (
                    <option key={site._id} value={site._id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Date Range Selector */}
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-[#FDC726] transition-colors"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.changeType === 'positive' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Pageviews Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pageviews Over Time</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FDC726] rounded-full"></div>
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Visitors</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-3">
              {dashboardData.charts.pageviewsOverTime.length > 0 ? (
                dashboardData.charts.pageviewsOverTime.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col gap-2">
                    <div className="relative flex-1 flex flex-col justify-end gap-1">
                      <div 
                        className="bg-gradient-to-t from-[#FDC726] to-[#e5b520] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ height: `${(item.pageviews / maxValue) * 100}%` }}
                        title={`Views: ${item.pageviews}`}
                      />
                      <div 
                        className="bg-gray-300 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ height: `${(item.uniqueVisitors / maxValue) * 100}%` }}
                        title={`Visitors: ${item.uniqueVisitors}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 text-center font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Referrers</h3>
            <div className="space-y-5">
              {dashboardData.charts.referrers.slice(0, 4).map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {source.referrer || 'Direct'}
                    </span>
                    <span className="text-sm text-gray-600">{source.visits}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${dashboardData.charts.referrers[0]?.visits ? (source.visits / dashboardData.charts.referrers[0].visits) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{source.uniqueVisitors} unique visitors</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Pages</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Page</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Views</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.charts.topPages.map((page, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">
                        <span className="text-sm font-medium text-gray-900">{page.page}</span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="text-sm text-gray-700">{page.views.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="text-sm text-gray-700">{page.uniqueVisitors.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Devices</h3>
            <div className="space-y-6">
              {dashboardData.charts.devices.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900 capitalize">{device.device}</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData.overview.pageviews > 0 ? Math.round((device.pageviews / dashboardData.overview.pageviews) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-10 flex items-center px-1">
                    <div 
                      className="bg-[#FDC726] h-8 rounded-full transition-all duration-500 flex items-center justify-center"
                      style={{ 
                        width: `${dashboardData.overview.pageviews > 0 ? (device.pageviews / dashboardData.overview.pageviews) * 100 : 0}%` 
                      }}
                    >
                      <span className="text-white text-xs font-semibold">
                        {dashboardData.overview.pageviews > 0 ? Math.round((device.pageviews / dashboardData.overview.pageviews) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {dashboardData.overview.activeSessions || 0} visitors online
                  </p>
                  <p className="text-xs text-gray-500">Updated just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;