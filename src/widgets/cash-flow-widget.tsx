'use client';

import { DollarSign } from 'lucide-react';
import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetProps } from '../types';

export const CashFlowWidget: React.FC<WidgetProps> = ({ data, ...props }) => {
  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string') {
      return value;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle both data structures: metric.value and cashFlow.current
  const metricData = data?.metric || data?.cashFlow;
  const value = metricData?.value || metricData?.current;
  const trendData = metricData?.trend;

  return (
    <BaseWidget
      title="Cash Flow"
      value={value ? formatCurrency(value) : 'N/A'}
      icon={<DollarSign className="h-4 w-4" />}
      trend={trendData ? {
        value: `${metricData?.change || 0}%`,
        direction: typeof trendData === 'string' ? trendData : 'neutral',
      } : undefined}
      description="Net cash flow from operations"
      {...props}
    />
  );
}; 