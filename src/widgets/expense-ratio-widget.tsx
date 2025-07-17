'use client';

import { Percent } from 'lucide-react';
import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetProps } from '../types';

export const ExpenseRatioWidget: React.FC<WidgetProps> = ({ data, ...props }) => {
  const formatPercentage = (value: number | string) => {
    if (typeof value === 'string') {
      return value;
    }
    return `${value.toFixed(1)}%`;
  };

  // Handle both data structures: metric.value and expenseRatio.current
  const metricData = data?.metric || data?.expenseRatio;
  const value = metricData?.value || metricData?.current;
  const trendData = metricData?.trend;

  return (
    <BaseWidget
      title="Expense Ratio"
      value={value ? formatPercentage(value) : 'N/A'}
      icon={<Percent className="h-4 w-4" />}
      trend={trendData ? {
        value: `${metricData?.change || 0}%`,
        direction: typeof trendData === 'string' ? trendData : 'neutral',
      } : undefined}
      description="Operating expenses as percentage of gross income"
      {...props}
    />
  );
}; 