'use client';

import { Percent } from 'lucide-react';
import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetProps } from '../types';

export const CapRateWidget: React.FC<WidgetProps> = ({ data, ...props }) => {
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'string') {
      return value;
    }
    return `${value.toFixed(2)}%`;
  };

  // Handle both data structures: metric.value and capRate.current
  const metricData = data?.metric || data?.capRate;
  const value = metricData?.value || metricData?.current;
  const trendData = metricData?.trend;

  return (
    <BaseWidget
      title="Cap Rate"
      value={value ? formatPercentage(value) : 'N/A'}
      icon={<Percent className="h-4 w-4" />}
      trend={trendData ? {
        value: typeof trendData === 'object' && 'value' in trendData 
          ? `${trendData.value}%` 
          : `${metricData?.change || 0}%`,
        direction: typeof trendData === 'string' ? trendData : trendData.direction,
      } : undefined}
      description="Capitalization rate - NOI divided by property value"
      {...props}
    />
  );
}; 