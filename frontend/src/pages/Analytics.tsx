import React, { useState, useEffect } from 'react';
import { TrendingUp, Globe, MapPin, Clock, Monitor, Smartphone, Tablet, ExternalLink, Calendar, Users, Eye, BarChart3 } from 'lucide-react';
import { analyticsApi, Site } from '../lib/api';

interface AnalyticsProps {
  selectedSite?: Site | null;
}

export const Analytics = ({ selectedSite }: AnalyticsProps) => {
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data - replace with actual API calls
  const metrics = [
    { id: 'pageviews', label: 'Pageviews', value: '45.2K', change: '+12.5%' },
    { id: 'visitors', label: 'Visitors', value: '18.4K', change: '+8.3%' },
    { id: 'sessions', label: 'Sessions', value: '23.1K', change: '+15.2%' },
    { id: 'duration', label: 'Avg. Duration', value: '4m 23s', change: '-2.4%' }
  ];

  const countries = [
    { name: 'United States', code: 'US', visitors: 8234, percentage: 42 },
    { name: 'United Kingdom', code: 'GB', visitors: 3421, percentage: 18 },
    { name: 'Germany', code: 'DE', visitors: 2890, percentage: 15 },
    { name: 'France', code: 'FR', visitors: 2134, percentage: 11 },
    { name: 'Canada', code: 'CA', visitors: 1567, percentage: 8 },
    { name: 'Others', code: 'OT', visitors: 1184, percentage: 6 }
  ];

  const browsers = [
    { name: 'Chrome', percentage: 58, visitors: 10672, color: 'bg-yellow-500' },
    { name: 'Safari', percentage: 22, visitors: 4048, color: 'bg-blue-500' },
    { name: 'Firefox', percentage: 12, visitors: 2208, color: 'bg-orange-500' },
    { name: 'Edge', percentage: 8, visitors: 1472, color: 'bg-green-500' }
  ];

  const referrers = [
    { source: 'google.com', visits: 5234, percentage: 35 },
    { source: 'Direct', visits: 4567, percentage: 30 },
    { source: 'twitter.com', visits: 2890, percentage: 19 },
    { source: 'facebook.com', visits: 1456, percentage: 10 },
    { source: 'linkedin.com', visits: 912, percentage: 6 }
  ];

  const timeData = [
    { hour: '00:00', value: 120 },
    { hour: '03:00', value: 80 },
    { hour: '06:00', value: 150 },
    { hour: '09:00', value: 420 },
    { hour: '12:00', value: 580 },
    { hour: '15:00', value: 650 },
    { hour: '18:00', value: 720 },
    { hour: '21:00', value: 480 }
  ];

  const devices = [
    { type: 'Desktop', icon: Monitor, percentage: 56, visitors: 10304 },
    { type: 'Mobile', icon: Smartphone, percentage: 38, visitors: 6992 },
    { type: 'Tablet', icon: Tablet, percentage: 6, visitors: 1104 }
  ];

  const maxTimeValue = Math.max(...timeData.map(d => d.value));

  useEffect(() => {
    if (selectedSite) {
      loadAnalyticsData();
    }
  }, [selectedSite, timeRange]);

  const loadAnalyticsData = async () => {
    if (!selectedSite) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Example API calls - implement based on your actual API structure
      // const overviewResponse = await analyticsApi.getOverview(selectedSite.siteId, getStartDate(), getEndDate());
      // const pageviewsResponse = await analyticsApi.getPageviews(selectedSite.siteId, getStartDate(), getEndDate());
      // etc.
      
      // For now, using mock data
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to load analytics data');
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '24h': return new Date(now.setDate(now.getDate() - 1)).toISOString();
      case '7d': return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d': return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d': return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default: return new Date(now.setDate(now.getDate() - 7)).toISOString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#59A5D8] to-[#3B8CB8] rounded-full mb-4">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h3>
            <p className="text-gray-600">Please wait while we load your analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {selectedSite ? `${selectedSite.name} Analytics` : 'Advanced Analytics'}
              </h1>
              <p className="text-gray-600">Deep dive into your website performance</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:border-[#FDC726] transition-colors"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                selectedMetric === metric.id
                  ? 'bg-[#FDC726] border-[#FDC726] shadow-lg'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className={`text-sm font-semibold mb-2 ${
                selectedMetric === metric.id ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {metric.label}
              </p>
              <p className={`text-2xl font-bold mb-1 ${
                selectedMetric === metric.id ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {metric.value}
              </p>
              <p className={`text-sm font-semibold ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change} vs last period
              </p>
            </button>
          ))}
        </div>

        {/* Traffic by Time */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Traffic by Time of Day</h3>
                <p className="text-sm text-gray-600">When your visitors are most active</p>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end gap-4">
            {timeData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-[#FDC726] to-[#e5b520] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${(item.value / maxTimeValue) * 100}%` }}
                    title={`${item.hour}: ${item.value} visits`}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic & Device Data */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Countries */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Top Countries</h3>
                <p className="text-sm text-gray-600">Where your visitors are from</p>
              </div>
            </div>

            <div className="space-y-4">
              {countries.map((country, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.code === 'OT' ? '🌍' : `${String.fromCodePoint(0x1F1E6 + country.code.charCodeAt(0) - 65)}${String.fromCodePoint(0x1F1E6 + country.code.charCodeAt(1) - 65)}`}</span>
                      <span className="text-sm font-semibold text-gray-900">{country.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{country.visitors.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{country.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Device Types</h3>
                <p className="text-sm text-gray-600">How visitors access your site</p>
              </div>
            </div>

            <div className="space-y-6">
              {devices.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <device.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">{device.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{device.visitors.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{device.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-10 flex items-center px-1">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${device.percentage}%` }}
                    >
                      {device.percentage > 15 && (
                        <span className="text-white text-xs font-semibold">{device.percentage}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browsers & Referrers */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Browsers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Browsers</h3>
                <p className="text-sm text-gray-600">Most popular browsers</p>
              </div>
            </div>

            <div className="space-y-5">
              {browsers.map((browser, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{browser.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{browser.visitors.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{browser.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${browser.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${browser.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referrers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Top Referrers</h3>
                <p className="text-sm text-gray-600">Where your traffic comes from</p>
              </div>
            </div>

            <div className="space-y-4">
              {referrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{referrer.source}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{referrer.visits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{referrer.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};