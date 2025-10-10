import { useState, useEffect, useRef } from 'react';
import { Eye, Users, MousePointer, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  analyticsApi, 
  AnalyticsOverview, 
  Site, 
  TopPage, 
  DeviceStats, 
  TrafficSource 
} from '../services/analyticsApi';
import { useLocation } from 'react-router-dom';

// Simple Card components
const Card = ({ children, className = '', hover = false }: any) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, change, changeType, icon: Icon }: any) => (
  <Card hover>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        {change && (
          <p className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [pageviewsOverTime, setPageviewsOverTime] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const initialLoadDone = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!authLoading && user && !initialLoadDone.current) {
      loadSites();
      initialLoadDone.current = true;
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (selectedSiteId && initialLoadDone.current) {
      loadAnalytics(selectedSiteId);
    }
  }, [selectedSiteId]);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError('');

      const sitesData = await analyticsApi.getSites();
      setSites(sitesData);
      
      if (sitesData.length > 0 && !selectedSiteId) {
        setSelectedSiteId(sitesData[0].siteId);
      }
    } catch (error: any) {
      console.error('Failed to load sites:', error);
      setError(error.message || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (siteId: string) => {
    if (isLoadingRef.current) {
      console.log('Already loading analytics, skipping...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setError('');

      console.log(`Loading analytics for site: ${siteId}`);

      // Load all analytics data in parallel
      const [overviewRes, pagesRes, devicesRes, referrersRes, pageviewsRes] = await Promise.all([
        analyticsApi.getOverview(siteId),
        analyticsApi.getTopPages(siteId, undefined, undefined, 5),
        analyticsApi.getDeviceStats(siteId),
        analyticsApi.getReferrerStats(siteId, undefined, undefined, 4),
        analyticsApi.getPageviewsOverTime(siteId)
      ]);

      setAnalytics(overviewRes);
      setTopPages(pagesRes);
      setDeviceStats(devicesRes);
      setTrafficSources(referrersRes);
      setPageviewsOverTime(pageviewsRes);

    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics');
    } finally {
      isLoadingRef.current = false;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate percentages for device stats
  const calculateDevicePercentages = (devices: DeviceStats[]) => {
    const total = devices.reduce((sum, device) => sum + device.pageviews, 0);
    return devices.map(device => ({
      name: device.device.charAt(0).toUpperCase() + device.device.slice(1),
      value: total > 0 ? Math.round((device.pageviews / total) * 100) : 0
    }));
  };

  // Calculate percentages for traffic sources
  const calculateTrafficSourcePercentages = (sources: TrafficSource[]) => {
    const total = sources.reduce((sum, source) => sum + source.visits, 0);
    return sources.map(source => ({
      source: source.referrer || 'Direct',
      percentage: total > 0 ? Math.round((source.visits / total) * 100) : 0
    }));
  };

  // Transform top pages data
  const transformTopPages = (pages: TopPage[]) => {
    return pages.map(page => ({
      page: page.page,
      pageviews: page.views,
      visitors: page.uniqueVisitors,
      bounceRate: 0 // Your API doesn't provide bounce rate per page yet
    }));
  };

  const stats = analytics ? [
    {
      title: 'Pageviews',
      value: formatNumber(analytics.pageviews),
      change: '+0% from last month', // You'll need to implement growth calculation
      changeType: 'positive',
      icon: Eye,
    },
    {
      title: 'Unique Visitors',
      value: formatNumber(analytics.uniqueVisitors),
      change: '+0% from last month',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Total Sessions',
      value: formatNumber(analytics.sessions),
      change: '+0% from last month',
      changeType: 'positive',
      icon: MousePointer,
    },
    {
      title: 'Avg. Duration',
      value: formatDuration(analytics.avgDuration),
      change: `${analytics.bounceRate.toFixed(1)}% bounce rate`,
      changeType: 'neutral',
      icon: Clock,
    },
  ] : [];

  const trafficSourcesWithColors = calculateTrafficSourcePercentages(trafficSources).map((source, index) => ({
    ...source,
    color: ['bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800'][index] || 'bg-gray-400'
  }));

  const devices = calculateDevicePercentages(deviceStats);

  // For the chart, use actual pageviews over time data
  const chartData = pageviewsOverTime.map(item => ({
    date: item.date,
    pageviews: item.pageviews
  }));

  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500">Loading authentication...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to view analytics</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sites found</h3>
            <p className="text-gray-600">Add your first site to start tracking analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h1>
          <p className="text-gray-600">Track your website performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
            <span className="text-sm font-medium text-gray-700">Last 30 days</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <select 
            value={selectedSiteId} 
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer text-sm font-medium text-gray-700"
          >
            {sites.map((site) => (
              <option key={site.siteId} value={site.siteId}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pageviews Over Time</h3>
          <div className="h-64 flex items-end gap-2">
            {chartData.length > 0 ? (
              chartData.map((item, index) => {
                // Calculate height as percentage of max value
                const maxPageviews = Math.max(...chartData.map(d => d.pageviews));
                const height = maxPageviews > 0 ? (item.pageviews / maxPageviews) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col justify-end">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${item.pageviews} pageviews`}
                    />
                  </div>
                );
              })
            ) : (
              // Fallback to mock data if no real data
              [45, 62, 58, 73, 68, 82, 75, 88, 92, 85, 78, 95, 89, 84].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))
            )}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            {chartData.length > 0 ? (
              chartData.slice(0, 7).map((item, index) => (
                <span key={index}>{item.date.split('-').slice(1).join('/')}</span>
              ))
            ) : (
              // Fallback labels
              <>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficSourcesWithColors.map((source, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{source.source}</span>
                  <span className="text-gray-600">{source.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${source.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Page</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Visitors</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {transformTopPages(topPages).map((page, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{page.page}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatNumber(page.pageviews)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatNumber(page.visitors)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">{page.bounceRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Devices</h3>
          <div className="space-y-4">
            {devices.map((device, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">{device.name}</span>
                  <span className="text-gray-600">{device.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 flex items-center px-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-5 rounded-full transition-all duration-300"
                    style={{ width: `${device.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};