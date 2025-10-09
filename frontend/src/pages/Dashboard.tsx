import { useState, useEffect } from 'react';
import { Eye, Users, MousePointer, Clock, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { analyticsApi, sitesApi, AnalyticsOverview, Site, TopPage, DeviceStats, TrafficSource } from '../lib/api';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, [selectedSiteId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user's sites
      const sitesResponse = await sitesApi.getSites();
      if (sitesResponse.success && sitesResponse.data) {
        const userSites = sitesResponse.data.sites;
        setSites(userSites);
        
        // Use first site as default or let user select
        const defaultSite = userSites[0];
        if (defaultSite && !selectedSiteId) {
          setSelectedSiteId(defaultSite.siteId);
        }

        if (selectedSiteId || defaultSite?.siteId) {
          const siteId = selectedSiteId || defaultSite.siteId;
          
          // Load analytics data for the selected site
          const [analyticsRes, pagesRes, devicesRes, referrersRes] = await Promise.all([
            analyticsApi.getOverview(siteId),
            analyticsApi.getTopPages(siteId, undefined, undefined, 5),
            analyticsApi.getDeviceStats(siteId),
            analyticsApi.getReferrerStats(siteId, undefined, undefined, 4)
          ]);

          if (analyticsRes.success && analyticsRes.data) {
            setAnalytics(analyticsRes.data);
          }

          if (pagesRes.success && pagesRes.data) {
            setTopPages(pagesRes.data);
          }

          if (devicesRes.success && devicesRes.data) {
            setDeviceStats(devicesRes.data);
          }

          if (referrersRes.success && referrersRes.data) {
            setTrafficSources(referrersRes.data);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const stats = analytics ? [
    {
      title: 'Pageviews',
      value: formatNumber(analytics.totalPageviews),
      change: `${analytics.growth.pageviews > 0 ? '+' : ''}${analytics.growth.pageviews.toFixed(1)}% from last month`,
      changeType: analytics.growth.pageviews >= 0 ? 'positive' as const : 'negative' as const,
      icon: Eye,
    },
    {
      title: 'Unique Visitors',
      value: formatNumber(analytics.totalVisitors),
      change: `${analytics.growth.visitors > 0 ? '+' : ''}${analytics.growth.visitors.toFixed(1)}% from last month`,
      changeType: analytics.growth.visitors >= 0 ? 'positive' as const : 'negative' as const,
      icon: Users,
    },
    {
      title: 'Total Sessions',
      value: formatNumber(analytics.totalSessions),
      change: `${analytics.growth.sessions > 0 ? '+' : ''}${analytics.growth.sessions.toFixed(1)}% from last month`,
      changeType: analytics.growth.sessions >= 0 ? 'positive' as const : 'negative' as const,
      icon: MousePointer,
    },
    {
      title: 'Avg. Duration',
      value: formatDuration(analytics.averageDuration),
      change: `${analytics.bounceRate.toFixed(1)}% bounce rate`,
      changeType: 'neutral' as const,
      icon: Clock,
    },
  ] : [];

  const trafficSourcesWithColors = trafficSources.map((source, index) => ({
    ...source,
    color: ['bg-[#59A5D8]', 'bg-[#3B8CB8]', 'bg-[#2A7CA8]', 'bg-[#1B6C98]'][index] || 'bg-gray-400'
  }));

  const devices = deviceStats ? [
    { name: 'Desktop', value: deviceStats.desktop },
    { name: 'Mobile', value: deviceStats.mobile },
    { name: 'Tablet', value: deviceStats.tablet },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#59A5D8] transition-colors">
            <span className="text-sm font-medium text-gray-700">Last 30 days</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <select 
            value={selectedSiteId} 
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#59A5D8] transition-colors appearance-none cursor-pointer"
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
            {[45, 62, 58, 73, 68, 82, 75, 88, 92, 85, 78, 95, 89, 84].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end">
                <div
                  className="bg-gradient-to-t from-[#59A5D8] to-[#3B8CB8] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
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
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Visitors
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
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
                    className="bg-gradient-to-r from-[#59A5D8] to-[#3B8CB8] h-5 rounded-full transition-all duration-300"
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
