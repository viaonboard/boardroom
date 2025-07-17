'use client';

import { TrendingUp } from 'lucide-react';
import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetProps } from '../types';

export const IrrWidget: React.FC<WidgetProps> = ({ data, ...props }) => {
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'string') {
      return value;
    }
    return `${value.toFixed(1)}%`;
  };

  // Handle both data structures: metric.value and irr.current
  const metricData = data?.metric || data?.irr;
  const value = metricData?.value || metricData?.current;
  const trendData = metricData?.trend;

  return (
    <BaseWidget
      title="Internal Rate of Return (IRR)"
      value={value ? formatPercentage(value) : 'N/A'}
      icon={<TrendingUp className="h-4 w-4" />}
      trend={trendData ? {
        value: `${metricData?.change || 0}%`,
        direction: typeof trendData === 'string' ? trendData : 'neutral',
      } : undefined}
      description="Annualized rate of return on investment"
      {...props}
    />
  );
}; 