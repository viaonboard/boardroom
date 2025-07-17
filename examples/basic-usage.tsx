import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { DashboardWidget, DynamicWidget, WidgetConfig } from '../src';

// Example widget configurations
const exampleWidgetConfigs: WidgetConfig[] = [
  {
    id: 'revenue',
    name: 'Total Revenue',
    category: 'Financial',
    component: DynamicWidget,
    description: 'Total revenue for the period',
    icon: DollarSign,
    defaultSettings: {
      type: 'bar',
      color: '#3b82f6',
      formatType: 'currency',
      showTrend: true,
    },
  },
  {
    id: 'users',
    name: 'Active Users',
    category: 'Users',
    component: DynamicWidget,
    description: 'Number of active users',
    icon: Users,
    defaultSettings: {
      type: 'line',
      color: '#10b981',
      formatType: 'number',
      showTrend: true,
    },
  },
  {
    id: 'growth',
    name: 'Growth Rate',
    category: 'Metrics',
    component: DynamicWidget,
    description: 'Monthly growth rate',
    icon: TrendingUp,
    defaultSettings: {
      type: 'line',
      color: '#f59e0b',
      formatType: 'percentage',
      showTrend: true,
    },
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    category: 'Metrics',
    component: DynamicWidget,
    description: 'User conversion rate',
    icon: BarChart3,
    defaultSettings: {
      type: 'pie',
      color: '#8b5cf6',
      formatType: 'percentage',
      showTrend: true,
    },
  },
];

// Example data provider
const fetchExampleData = async (widgetIds: string[]) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    revenue: {
      current: 125000,
      previous: 100000,
      change: 25,
      trend: 'up' as const,
      chartData: [
        { name: 'Jan', value: 100000 },
        { name: 'Feb', value: 110000 },
        { name: 'Mar', value: 125000 },
      ],
    },
    users: {
      current: 15420,
      previous: 14200,
      change: 8.6,
      trend: 'up' as const,
      chartData: [
        { name: 'Jan', value: 14200 },
        { name: 'Feb', value: 14800 },
        { name: 'Mar', value: 15420 },
      ],
    },
    growth: {
      current: 12.5,
      previous: 10.2,
      change: 2.3,
      trend: 'up' as const,
      chartData: [
        { name: 'Jan', value: 10.2 },
        { name: 'Feb', value: 11.8 },
        { name: 'Mar', value: 12.5 },
      ],
    },
    conversion: {
      current: 3.2,
      previous: 2.8,
      change: 0.4,
      trend: 'up' as const,
      chartData: [
        { name: 'Converted', value: 3.2 },
        { name: 'Not Converted', value: 96.8 },
      ],
    },
  };
};

export function BasicUsageExample() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFetchData = async (widgetIds: string[], filters: any) => {
    setLoading(true);
    try {
      const widgetData = await fetchExampleData(widgetIds);
      setData(widgetData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen p-4">
      <DashboardWidget
        accountId="example-account"
        widgetConfigs={exampleWidgetConfigs}
        onFetchData={handleFetchData}
        data={data}
        loading={loading}
        showFilters={true}
        showViewManagement={true}
        className="w-full h-full"
      />
    </div>
  );
} 