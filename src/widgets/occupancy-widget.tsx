'use client';

import { Building2 } from 'lucide-react';
import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetProps } from '../types';

export const OccupancyWidget: React.FC<WidgetProps> = ({ data, ...props }) => {
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'string') {
      return value;
    }
    return `${value.toFixed(1)}%`;
  };

  // Handle both data structures: metric.value and occupancy.current
  const metricData = data?.metric || data?.occupancy;
  const value = metricData?.value || metricData?.current;
  const trendData = metricData?.trend;

  return (
    <BaseWidget
      title="Occupancy Rate"
      value={value ? formatPercentage(value) : 'N/A'}
      icon={<Building2 className="h-4 w-4" />}
      trend={trendData ? {
        value: `${metricData?.change || 0}%`,
        direction: typeof trendData === 'string' ? trendData : 'neutral',
      } : undefined}
      description="Percentage of occupied space"
      {...props}
    />
  );
}; 