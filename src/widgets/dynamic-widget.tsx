'use client';

import React from 'react';
import { BaseWidget } from '../components/base-widget';
import type { WidgetConfig, WidgetProps } from '../types';

export interface DynamicWidgetProps extends WidgetProps {
  config?: WidgetConfig;
  data?: any;
}

export const DynamicWidget: React.FC<DynamicWidgetProps> = ({ 
  config, 
  data, 
  mode = 'view',
  type = 'metric',
  onTypeChange,
  onSettingsChange,
  settings,
  chartSettings,
  onChartSettingsChange,
  valueFormatter,
  className 
}) => {
  // Debug logging
  console.log('DynamicWidget render:', {
    configName: config?.name,
    configId: config?.id,
    hasConfig: !!config,
    configKeys: config ? Object.keys(config) : [],
    data,
    chartSettings,
    settings,
    type,
    mode,
  });
  
  // Determine the current view type from chartSettings or default to metric
  const currentType = chartSettings?.mode || type;

  // Helper function to format values based on data type
  const formatValue = (value: any, formatType?: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (formatType) {
      case 'currency':
        return typeof value === 'number' 
          ? new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          : value;
      case 'percentage':
        return typeof value === 'number' 
          ? `${value.toFixed(1)}%`
          : value;
      case 'decimal':
        return typeof value === 'number' 
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(value)
          : value;
      default:
        return value;
    }
  };

  // Extract metric data
  const metricData = data?.metric;
  const formattedValue = metricData?.value 
    ? formatValue(metricData.value, config?.defaultSettings?.formatType)
    : 'N/A';

  const formattedTrend = metricData?.trend;

  console.log('DynamicWidget processed data:', {
    metricData,
    formattedValue,
    formattedTrend,
    currentType,
    hasChartData: !!data?.chart?.data,
  });

  // Get value formatter for charts
  const getValueFormatter = () => {
    const formatType = config?.defaultSettings?.formatType;
    switch (formatType) {
      case 'currency':
        return { style: 'currency' as const, currency: 'USD' };
      case 'percentage':
        return { style: 'percent' as const };
      default:
        return { style: 'decimal' as const };
    }
  };

  // Handle chart settings change
  const handleChartSettingsChange = (newSettings: any) => {
    console.log('DynamicWidget handleChartSettingsChange:', newSettings);
    if (onChartSettingsChange) {
      onChartSettingsChange(newSettings);
    } else if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle type change
  const handleTypeChange = (newType: 'metric' | 'graph') => {
    console.log('DynamicWidget handleTypeChange:', { newType, currentType });
    if (onTypeChange) {
      onTypeChange(newType);
    }
    
    // Update chart settings when switching between metric and graph view
    const currentSettings = chartSettings || settings || config?.defaultSettings;
    if (currentSettings && handleChartSettingsChange) {
      handleChartSettingsChange({
        ...currentSettings,
        mode: newType,
      });
    }
  };

  return (
    <BaseWidget
      title={config?.name || 'Unknown Widget'}
      value={formattedValue}
      trend={formattedTrend}
      description={config?.description}
      mode={mode}
      type={currentType}
      onTypeChange={handleTypeChange}
      data={data}
      chartSettings={chartSettings || settings || config?.defaultSettings}
      onChartSettingsChange={handleChartSettingsChange}
      valueFormatter={valueFormatter || getValueFormatter()}
    />
  );
}; 