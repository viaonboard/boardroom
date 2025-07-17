import React, { useState } from 'react';
import { DashboardWidget, DynamicWidget, WidgetConfig } from '../src';
import { convertOnboardingApiDataToWidgetFormat, exampleOnboardingApiData } from './data-converter';

// Onboarding KPI Widget Configurations
const onboardingWidgetConfigs: WidgetConfig[] = [
  {
    id: 'velocity_trend',
    name: 'Average Days to Launch',
    category: 'Velocity',
    component: DynamicWidget,
    description: 'Average days to launch with trend over time',
    defaultSettings: {
      type: 'line' as const,
      color: 'blue' as const,
      formatType: 'decimal' as const,
      showTrend: true,
    },
  },
  {
    id: 'maps_launched_on_time',
    name: 'Maps Launched On Time',
    category: 'Performance',
    component: DynamicWidget,
    description: 'Percentage of maps launched on time',
    defaultSettings: {
      type: 'pie' as const,
      color: 'green' as const,
      formatType: 'percentage' as const,
      showTrend: true,
    },
  },
  {
    id: 'median_phase_time',
    name: 'Median Time in Phase',
    category: 'Velocity',
    component: DynamicWidget,
    description: 'Median time spent in each milestone phase',
    defaultSettings: {
      type: 'bar' as const,
      color: 'orange' as const,
      formatType: 'decimal' as const,
      showTrend: false,
    },
  },
  {
    id: 'active_customers_per_stage',
    name: 'Active Customers Per Stage',
    category: 'Customers',
    component: DynamicWidget,
    description: 'Number of active customers in each onboarding stage',
    defaultSettings: {
      type: 'bar' as const,
      color: 'purple' as const,
      formatType: 'number' as const,
      showTrend: false,
    },
  },
  {
    id: 'customers_per_owner',
    name: 'Customers Per Owner',
    category: 'Team',
    component: DynamicWidget,
    description: 'Number of customers assigned to each owner',
    defaultSettings: {
      type: 'bar' as const,
      color: 'primary' as const,
      formatType: 'number' as const,
      showTrend: false,
    },
  },
  {
    id: 'tasks_per_owner',
    name: 'Tasks Per Owner',
    category: 'Team',
    component: DynamicWidget,
    description: 'Number of tasks assigned to each owner',
    defaultSettings: {
      type: 'bar' as const,
      color: 'red' as const,
      formatType: 'number' as const,
      showTrend: false,
    },
  },
  {
    id: 'internal_task_completion',
    name: 'Internal Task Completion Rate',
    category: 'Performance',
    component: DynamicWidget,
    description: 'On-time task completion rate for internal tasks',
    defaultSettings: {
      type: 'line' as const,
      color: 'green' as const,
      formatType: 'percentage' as const,
      showTrend: true,
    },
  },
  {
    id: 'customer_task_completion',
    name: 'Customer Task Completion Rate',
    category: 'Performance',
    component: DynamicWidget,
    description: 'On-time task completion rate for customer tasks',
    defaultSettings: {
      type: 'line' as const,
      color: 'blue' as const,
      formatType: 'percentage' as const,
      showTrend: true,
    },
  },
  {
    id: 'overdue_task_rate',
    name: 'Overdue Task Rate',
    category: 'Performance',
    component: DynamicWidget,
    description: 'Percentage of tasks that are overdue',
    defaultSettings: {
      type: 'line' as const,
      color: 'red' as const,
      formatType: 'percentage' as const,
      showTrend: true,
    },
  },
];

export function OnboardingKPIsExample() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState({
    title: 'Onboarding KPIs Dashboard',
    description: 'Real-time metrics for customer onboarding performance',
    dateRange: {
      from: new Date().toISOString(),
      to: new Date().toISOString(),
    },
    widgets: onboardingWidgetConfigs.map(w => w.id),
    layout: onboardingWidgetConfigs.map((widget, index) => ({
      id: widget.id,
      x: index % 3,
      y: Math.floor(index / 3),
      w: 4,
      h: 4,
    })),
    chartSettings: {},
  });
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Convert API data to widget format
        const widgetData = convertOnboardingApiDataToWidgetFormat(exampleOnboardingApiData);
        setData(widgetData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConfigChange = (config: any) => {
    console.log('Onboarding config changed:', config);
    setCurrentConfig(config);
  };

  const handleSaveConfig = async (config: any) => {
    console.log('Saving onboarding config:', config);
    const newConfig = { ...config };
    setSavedConfigs(prev => [...prev, newConfig]);
    return Promise.resolve();
  };

  const handleLoadConfig = async () => {
    console.log('Loading onboarding configs');
    return savedConfigs;
  };

  const handleDeleteConfig = async (id: string) => {
    console.log('Deleting onboarding config:', id);
    setSavedConfigs(prev => prev.filter(config => config.title !== id));
    return Promise.resolve();
  };

  return (
    <div className="w-full h-[800px] p-4 bg-background">
      <DashboardWidget
        config={currentConfig}
        widgetConfigs={onboardingWidgetConfigs}
        data={data}
        loading={loading}
        className="w-full h-full"
        onConfigChange={handleConfigChange}
        onSaveConfig={handleSaveConfig}
        onLoadConfig={handleLoadConfig}
        onDeleteConfig={handleDeleteConfig}
      />
    </div>
  );
} 