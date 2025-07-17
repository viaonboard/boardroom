'use client';

import { ReactElement } from 'react';

import {
    BarChart2,
    BarChart3,
    GripVertical,
    Hash,
    Info,
    LineChart as LineChartIcon,
    Minus,
    PieChart as PieChartIcon,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@kit/ui/tooltip';

import { cn } from '../lib/utils';

// Chart types and colors
export type ChartType = 'line' | 'bar' | 'area' | 'pie';
export type ChartColor =
  | 'primary'
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'purple';

export const colorMap: Record<
  ChartColor,
  { primary: string; secondary: string }
> = {
  primary: {
    primary: '#4A4A4A',
    secondary: '#E0E0E0',
  },
  blue: {
    primary: '#2563eb',
    secondary: '#bfdbfe',
  },
  green: {
    primary: '#10b981', // Emerald green
    secondary: '#a7f3d0',
  },
  red: {
    primary: '#ef4444', // Bright red
    secondary: '#fecaca',
  },
  orange: {
    primary: '#f97316', // Bright orange
    secondary: '#fed7aa',
  },
  purple: {
    primary: '#8b5cf6', // Bright purple
    secondary: '#ddd6fe',
  },
};

export type ChartSettings = {
  type: ChartType;
  color: ChartColor;
  mode?: 'metric' | 'graph';
};

export type ValueFormatter = {
  style: 'currency' | 'percent' | 'decimal';
  currency?: string;
  notation?: 'compact' | 'standard';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export type BaseWidgetProps = {
  title: string;
  value: string | number | undefined;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  description?: string;
  mode?: 'view' | 'edit';
  type?: 'metric' | 'graph';
  onTypeChange?: (type: 'metric' | 'graph') => void;
  data?: {
    metric?: {
      value: string | number;
      trend?: {
        value: number;
        direction: 'up' | 'down' | 'neutral';
      };
    };
    chart?: {
      data: Array<{ name: string; value: number }>;
    };
  };
  chartSettings?: ChartSettings;
  onChartSettingsChange?: (settings: ChartSettings) => void;
  valueFormatter: ValueFormatter;
};

function ChartOptions({
  settings,
  onSettingsChange,
}: {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
}): ReactElement {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 w-7 rounded-full bg-background/80 p-0 shadow-sm backdrop-blur-sm hover:bg-background"
              >
                {settings.type === 'line' && (
                  <LineChartIcon
                    className="h-4 w-4"
                    style={{ color: colorMap[settings.color].primary }}
                  />
                )}
                {settings.type === 'bar' && (
                  <BarChart2
                    className="h-4 w-4"
                    style={{ color: colorMap[settings.color].primary }}
                  />
                )}
                {settings.type === 'area' && (
                  <LineChartIcon
                    className="h-4 w-4"
                    style={{ color: colorMap[settings.color].primary }}
                  />
                )}
                {settings.type === 'pie' && (
                  <PieChartIcon
                    className="h-4 w-4"
                    style={{ color: colorMap[settings.color].primary }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[240px]"
              align="start"
              side="top"
              sideOffset={8}
            >
              <Tabs defaultValue="type" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="type">Chart Type</TabsTrigger>
                  <TabsTrigger value="color">Color</TabsTrigger>
                </TabsList>
                <div className="h-[180px] overflow-hidden">
                  <TabsContent
                    value="type"
                    className="mt-0 h-full space-y-1 px-1 pt-4"
                  >
                    <Button
                      variant={settings.type === 'line' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() =>
                        onSettingsChange({ ...settings, type: 'line' })
                      }
                    >
                      <LineChartIcon className="mr-2 h-4 w-4" />
                      Line Chart
                    </Button>
                    <Button
                      variant={settings.type === 'bar' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() =>
                        onSettingsChange({ ...settings, type: 'bar' })
                      }
                    >
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Bar Chart
                    </Button>
                    <Button
                      variant={settings.type === 'area' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() =>
                        onSettingsChange({ ...settings, type: 'area' })
                      }
                    >
                      <LineChartIcon className="mr-2 h-4 w-4" />
                      Area Chart
                    </Button>
                    <Button
                      variant={settings.type === 'pie' ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() =>
                        onSettingsChange({ ...settings, type: 'pie' })
                      }
                    >
                      <PieChartIcon className="mr-2 h-4 w-4" />
                      Pie Chart
                    </Button>
                  </TabsContent>
                  <TabsContent value="color" className="mt-0 h-full">
                    <div className="flex h-full items-center justify-center">
                      <div className="grid grid-cols-3 gap-4 px-4">
                        {(
                          Object.entries(colorMap) as [
                            ChartColor,
                            { primary: string; secondary: string },
                          ][]
                        ).map(([key, colors]) => (
                          <TooltipProvider key={key}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    settings.color === key
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size="sm"
                                  className={cn(
                                    'relative h-9 w-9 overflow-hidden rounded-full p-0',
                                    settings.color === key &&
                                    'ring-2 ring-primary ring-offset-2 ring-offset-background',
                                  )}
                                  onClick={() =>
                                    onSettingsChange({
                                      ...settings,
                                      color: key,
                                    })
                                  }
                                >
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      background: `linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%)`,
                                    }}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="capitalize">{key}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chart Options</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function GraphView({
  data,
  chartType,
  chartColor,
  valueFormatter = { style: 'decimal' },
}: {
  data?: { chart?: { data: Array<{ name: string; value: number }> } };
  chartType: ChartType;
  chartColor: ChartColor;
  valueFormatter: ValueFormatter;
}): ReactElement {
  const chartData = data?.chart?.data ?? [];

  const renderChart = () => {
    const color = colorMap[chartColor].primary;
    const fillColor = colorMap[chartColor].secondary;

    if (!chartData || chartData.length === 0) {
      return <EmptyState />;
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 20, bottom: 0 },
    };

    const formatter = (value: number) => {
      try {
        // Always use compact notation for axis labels
        const axisFormatter = new Intl.NumberFormat('en-US', {
          style: valueFormatter?.style ?? 'decimal',
          currency: valueFormatter?.currency,
          notation: 'compact',
          compactDisplay: 'short',
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        });

        // Use full formatting for tooltips
        const tooltipFormatter = new Intl.NumberFormat('en-US', {
          style: valueFormatter?.style ?? 'decimal',
          currency: valueFormatter?.currency,
          notation: valueFormatter?.notation,
          minimumFractionDigits: valueFormatter?.minimumFractionDigits,
          maximumFractionDigits: valueFormatter?.maximumFractionDigits,
        });

        return {
          axis: axisFormatter.format(
            valueFormatter?.style === 'percent' ? value / 100 : value,
          ),
          tooltip: tooltipFormatter.format(
            valueFormatter?.style === 'percent' ? value / 100 : value,
          ),
        };
      } catch (error) {
        console.error('Error formatting value:', error);
        return {
          axis: value.toString(),
          tooltip: value.toString(),
        };
      }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatter(value).axis}
              width={40}
            />
            <RechartsTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => formatter(value).tooltip}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: color }}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatter(value).axis}
              width={40}
            />
            <RechartsTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => formatter(value).tooltip}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatter(value).axis}
              width={40}
            />
            <RechartsTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => formatter(value).tooltip}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={fillColor}
              strokeWidth={2}
              dot={{ r: 4, fill: color }}
            />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={color}
              dataKey="value"
              label={false}
            />
            <RechartsTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => formatter(value).tooltip}
            />
          </PieChart>
        );
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatter(value).axis}
              width={40}
            />
            <RechartsTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => formatter(value).tooltip}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyState(): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
      <BarChart3 className="mb-2 h-8 w-8 opacity-50" />
      <p className="text-sm">No data available</p>
    </div>
  );
}

export function BaseWidget({
  title,
  value,
  trend,
  description,
  mode = 'view',
  type = 'metric',
  onTypeChange,
  data,
  chartSettings,
  onChartSettingsChange,
  valueFormatter,
}: BaseWidgetProps): ReactElement {
  // Debug logging
  console.log('BaseWidget Data:', {
    title,
    value,
    valueType: typeof value,
    isValueNaN: typeof value === 'number' && isNaN(value),
    hasChartData: !!data?.chart?.data,
    chartDataLength: data?.chart?.data?.length,
    type,
    chartSettingsMode: chartSettings?.mode,
    currentType: chartSettings?.mode || type,
    hasValidData: false, // Will be calculated below
  });

  // Determine the current view type from chartSettings or fallback to type prop
  const currentType = chartSettings?.mode || type;

  // Check if we have valid data
  const hasValidData =
    currentType === 'metric'
      ? value !== undefined &&
      value !== null &&
      value !== 'N/A' &&
      value !== 'NaN' &&
      value !== '' &&
      (typeof value !== 'number' || !isNaN(value))
      : data?.chart?.data &&
      data.chart.data.length > 0 &&
      data.chart.data.every(
        (item) => typeof item.value === 'number' && !isNaN(item.value),
      );

  console.log('BaseWidget validation:', {
    currentType,
    hasValidData,
    value,
    chartData: data?.chart?.data,
  });

  const handleTypeChange = (newType: 'metric' | 'graph') => {
    console.log('BaseWidget handleTypeChange:', { newType, currentType });
    if (onTypeChange) {
      onTypeChange(newType);
    }
    if (chartSettings && onChartSettingsChange) {
      onChartSettingsChange({
        ...chartSettings,
        mode: newType,
      });
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'group relative flex h-full w-full flex-col',
          mode === 'edit' && 'cursor-move',
        )}
      >
        <CardHeader className="flex flex-none flex-row items-center justify-between space-y-0 px-4 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Metric/Graph toggle - always visible */}
            <div className="flex items-center rounded-md border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7 rounded-r-none',
                      currentType === 'metric' && 'bg-muted',
                    )}
                    onClick={() => handleTypeChange('metric')}
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Metric View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7 rounded-l-none',
                      currentType === 'graph' && 'bg-muted',
                    )}
                    onClick={() => handleTypeChange('graph')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Graph View</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Drag handle - only in edit mode */}
            {mode === 'edit' && (
              <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="relative h-full">
            {currentType === 'metric' && !hasValidData ? (
              <EmptyState />
            ) : currentType === 'metric' ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex max-w-[90%] flex-col items-center">
                  <div className="truncate text-xl font-bold sm:text-2xl lg:text-3xl">
                    {value}
                  </div>
                  {trend && (
                    <div
                      className={cn(
                        'mt-1 flex items-center text-sm',
                        trend.direction === 'up' && 'text-green-500',
                        trend.direction === 'down' && 'text-red-500',
                        trend.direction === 'neutral' && 'text-gray-500',
                      )}
                    >
                      {trend.direction === 'up' ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : trend.direction === 'down' ? (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      ) : (
                        <Minus className="mr-1 h-3 w-3" />
                      )}
                      {trend.value}%
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full">
                {chartSettings && onChartSettingsChange && (
                  <GraphView
                    data={data}
                    chartType={chartSettings.type}
                    chartColor={chartSettings.color}
                    valueFormatter={valueFormatter}
                  />
                )}
              </div>
            )}

            {/* Chart options - floating in bottom left corner */}
            {currentType === 'graph' &&
              chartSettings &&
              onChartSettingsChange &&
              hasValidData && (
                <div className="absolute -bottom-3 -left-3">
                  <ChartOptions
                    settings={chartSettings}
                    onSettingsChange={onChartSettingsChange}
                  />
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 