import { BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Analytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Deep dive into your website analytics</p>
      </div>

      <Card className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#59A5D8] to-[#3B8CB8] rounded-full mb-4">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          This page will contain detailed analytics including custom date ranges, advanced filtering,
          conversion tracking, and more insightful metrics.
        </p>
      </Card>
    </div>
  );
};
