'use client';

import { useEffect, useRef, useState } from 'react';

import { differenceInDays, endOfYear, format, startOfYear, subMonths, subYears } from 'date-fns';
import { GridStack, GridStackWidget } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import {
  BarChart3,
  CalendarIcon,
  CircleCheck,
  CirclePlus,
  Edit,
  Save
} from 'lucide-react';
import * as ReactDOM from 'react-dom/client';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import type { DateRange } from '@kit/ui/calendar';
import { Calendar } from '@kit/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Checkbox } from '@kit/ui/checkbox';
import { DatePicker } from '@kit/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Skeleton } from '@kit/ui/skeleton';
import { Switch } from '@kit/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

import { cn } from '../lib/utils';
import type { ChartSettings, DashboardConfig, PropertyFilterParams, WidgetData } from '../types';
import { BaseWidget } from './base-widget';
import { PropertyFilters } from './filters/property-filters';

// Widget definitions with their components
const widgetDefinitions = [
  {
    id: 'noi',
    name: 'Net Operating Income (NOI)',
    category: 'Income',
    component: BaseWidget,
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    category: 'Income',
    component: BaseWidget,
  },
  {
    id: 'cap-rate',
    name: 'Cap Rate',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'irr',
    name: 'Internal Rate of Return (IRR)',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'equity-multiple',
    name: 'Equity Multiple',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'grm',
    name: 'Gross Rent Multiplier (GRM)',
    category: 'Ratios',
    component: BaseWidget,
  },
  {
    id: 'dscr',
    name: 'Debt Service Coverage Ratio (DSCR)',
    category: 'Ratios',
    component: BaseWidget,
  },
  {
    id: 'ltv',
    name: 'Loan-to-Value Ratio (LTV)',
    category: 'Financing',
    component: BaseWidget,
  },
  {
    id: 'roi',
    name: 'Return on Investment (ROI)',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'expense-ratio',
    name: 'Expense Ratio',
    category: 'Expenses',
    component: BaseWidget,
  },
  {
    id: 'distribution-yield',
    name: 'Distribution Yield',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'investor-return',
    name: 'Investor Return',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'volatility',
    name: 'Volatility',
    category: 'Risk',
    component: BaseWidget,
  },
  {
    id: 'net-cash-flow-yield',
    name: 'Net Cash Flow Yield',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'dcf',
    name: 'Discounted Cash Flow (DCF)',
    category: 'Valuation',
    component: BaseWidget,
  },
  {
    id: 'payback-period',
    name: 'Payback Period',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'goi',
    name: 'Gross Operating Income (GOI)',
    category: 'Income',
    component: BaseWidget,
  },
  {
    id: 'egi',
    name: 'Effective Gross Income (EGI)',
    category: 'Income',
    component: BaseWidget,
  },
  {
    id: 'profit-margin',
    name: 'Profit Margin',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'exit-cap-rate',
    name: 'Exit Cap Rate',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'effective-rent-growth',
    name: 'Effective Rent Growth',
    category: 'Performance',
    component: BaseWidget,
  },
  {
    id: 'wale',
    name: 'Weighted Avg. Lease Exp. (WALE)',
    category: 'Leasing',
    component: BaseWidget,
  },
  {
    id: 'occupancy-rate',
    name: 'Occupancy Rate',
    category: 'Occupancy',
    component: BaseWidget,
  },
  {
    id: 'vacancy-rate',
    name: 'Vacancy Rate',
    category: 'Occupancy',
    component: BaseWidget,
  },
  {
    id: 'walt',
    name: 'Weighted Avg. Lease Term (WALT)',
    category: 'Leasing',
    component: BaseWidget,
  },
  {
    id: 'cash-on-cash-return',
    name: 'Cash on Cash Return',
    category: 'Returns',
    component: BaseWidget,
  },
  {
    id: 'break-even-occupancy',
    name: 'Break-Even Occupancy',
    category: 'Occupancy',
    component: BaseWidget,
  },
  {
    id: 'operating-expense-ratio',
    name: 'Operating Expense Ratio',
    category: 'Expenses',
    component: BaseWidget,
  },
  {
    id: 'economic-occupancy',
    name: 'Economic Occupancy',
    category: 'Occupancy',
    component: BaseWidget,
  },
  {
    id: 'market-rent-growth',
    name: 'Market Rent Growth',
    category: 'Performance',
    component: BaseWidget,
  },
  {
    id: 'absorption-rate',
    name: 'Absorption Rate',
    category: 'Occupancy',
    component: BaseWidget,
  },
].sort((a, b) => a.name.localeCompare(b.name));

// Group widgets by category
const widgetsByCategory = Object.fromEntries(
  Object.entries(
    widgetDefinitions.reduce<Record<string, typeof widgetDefinitions>>(
      (acc, widget) => {
        const category = widget.category;
        if (category) {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(widget);
        }
        return acc;
      },
      {},
    ),
  ).sort(([a], [b]) => a.localeCompare(b)),
);

// Default dashboard configurations
const DEFAULT_DASHBOARD_STATE = {
  title: 'Financial Dashboard',
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  widgets: [
    'noi',
    'net-cash-flow-yield',
    'expense-ratio',
    'occupancy-rate',
    'effective-rent-growth',
    'wale',
  ],
  layout: [
    { x: 0, y: 0, w: 4, h: 5, id: 'noi' },
    { x: 4, y: 0, w: 4, h: 5, id: 'net-cash-flow-yield' },
    { x: 8, y: 0, w: 4, h: 5, id: 'expense-ratio' },
    { x: 0, y: 5, w: 4, h: 5, id: 'occupancy-rate' },
    { x: 4, y: 5, w: 4, h: 5, id: 'effective-rent-growth' },
    { x: 8, y: 5, w: 4, h: 5, id: 'wale' },
  ],
};

const PROPERTY_DASHBOARD_STATE = {
  title: 'Property Financial Dashboard',
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  widgets: [
    'noi',
    'cap-rate',
    'dscr',
    'ltv',
    'occupancy-rate',
    'vacancy-rate',
    'economic-occupancy',
    'break-even-occupancy',
    'operating-expense-ratio',
    'absorption-rate',
    'market-rent-growth',
    'wale',
    'walt',
  ],
  layout: [
    { x: 0, y: 0, w: 4, h: 5, id: 'noi' },
    { x: 4, y: 0, w: 4, h: 5, id: 'cap-rate' },
    { x: 8, y: 0, w: 4, h: 5, id: 'dscr' },
    { x: 0, y: 5, w: 4, h: 5, id: 'ltv' },
    { x: 4, y: 5, w: 4, h: 5, id: 'occupancy-rate' },
    { x: 8, y: 5, w: 4, h: 5, id: 'vacancy-rate' },
    { x: 0, y: 10, w: 4, h: 5, id: 'economic-occupancy' },
    { x: 4, y: 10, w: 4, h: 5, id: 'break-even-occupancy' },
    { x: 8, y: 10, w: 4, h: 5, id: 'operating-expense-ratio' },
    { x: 0, y: 15, w: 4, h: 5, id: 'absorption-rate' },
    { x: 4, y: 15, w: 4, h: 5, id: 'market-rent-growth' },
    { x: 8, y: 15, w: 4, h: 5, id: 'wale' },
    { x: 0, y: 20, w: 4, h: 5, id: 'walt' },
  ],
};

const INVESTOR_DASHBOARD_STATE = {
  title: 'Investor Performance Dashboard',
  dateRange: {
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  widgets: [
    'irr',
    'equity-multiple',
    'roi',
    'distribution-yield',
    'investor-return',
    'net-cash-flow-yield',
    'cash-on-cash-return',
    'profit-margin',
    'exit-cap-rate',
    'payback-period',
    'volatility',
    'dcf',
  ],
  layout: [
    { x: 0, y: 0, w: 4, h: 5, id: 'irr' },
    { x: 4, y: 0, w: 4, h: 5, id: 'equity-multiple' },
    { x: 8, y: 0, w: 4, h: 5, id: 'roi' },
    { x: 0, y: 5, w: 4, h: 5, id: 'distribution-yield' },
    { x: 4, y: 5, w: 4, h: 5, id: 'investor-return' },
    { x: 8, y: 5, w: 4, h: 5, id: 'net-cash-flow-yield' },
    { x: 0, y: 10, w: 4, h: 5, id: 'cash-on-cash-return' },
    { x: 4, y: 10, w: 4, h: 5, id: 'profit-margin' },
    { x: 8, y: 10, w: 4, h: 5, id: 'exit-cap-rate' },
    { x: 0, y: 15, w: 4, h: 5, id: 'payback-period' },
    { x: 4, y: 15, w: 4, h: 5, id: 'volatility' },
    { x: 8, y: 15, w: 4, h: 5, id: 'dcf' },
  ],
};

const DASHBOARD_DATE_PRESETS = [
  { value: 0, label: 'Today' },
  { value: -7, label: 'Last Week' },
  {
    value: differenceInDays(subMonths(new Date(), 1), new Date()),
    label: 'Last Month',
  },
  {
    value: differenceInDays(subMonths(new Date(), 3), new Date()),
    label: 'Last Quarter',
  },
  {
    value: 'lastYear',
    label: 'Last Year',
    range: {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
    },
  },
];

// Skeleton components
function SkeletonWidget() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-[200px]" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    </div>
  );
}

function SkeletonWidgetSelector() {
  return (
    <Card className="flex-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface DashboardWidgetProps {
  config: DashboardConfig;
  data: WidgetData;
  onFiltersChange?: (filters: PropertyFilterParams) => void;
  onWidgetUpdate?: (widgetId: string, data: any) => void;
  onConfigChange?: (config: DashboardConfig) => void;
  onSave?: (config: DashboardConfig) => void;
  className?: string;
  demo?: boolean;
  accountId?: string;
}

export function DashboardWidget({
  config,
  data,
  onFiltersChange,
  onWidgetUpdate,
  onConfigChange,
  onSave,
  className = '',
  demo = false,
  accountId = 'demo',
}: DashboardWidgetProps) {
  const [mode, setMode] = useState<'edit' | 'view'>('view');
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(config.widgets || []);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: config.dateRange?.from ? new Date(config.dateRange.from) : new Date(),
    to: config.dateRange?.to ? new Date(config.dateRange.to) : undefined,
  });
  const [tempDateRange, setTempDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>(dateRange);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);
  const reactRootsRef = useRef<Map<string, ReactDOM.Root>>(new Map());
  const [savedLayout, setSavedLayout] = useState<GridStackWidget[]>(config.layout || []);
  const [savedChartSettings, setSavedChartSettings] = useState<Record<string, ChartSettings>>({});
  const [dashboardTitle, setDashboardTitle] = useState(config.title || 'Dashboard');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [widgetData, setWidgetData] = useState<Record<string, any>>(data);
  const [dataLoading, setDataLoading] = useState(false);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilterParams>(() => ({
    accountSlug: accountId,
    dealType: [],
    propertyType: [],
    propertyClass: [],
    amenities: [],
    zoning: [],
  }));

  // Update tempDateRange when dateRange changes
  useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  // Initialize grid
  useEffect(() => {
    if (!gridRef.current || gridInitialized) return;

    console.log('Initializing GridStack');

    const grid = GridStack.init(
      {
        column: 12,
        cellHeight: 80,
        minRow: 5,
        margin: 16,
        float: true,
        animate: false,
        draggable: {
          handle: '.cursor-move',
        },
        disableDrag: mode === 'view',
        disableResize: mode === 'view',
      },
      gridRef.current,
    );

    gridInstanceRef.current = grid;
    setGridInitialized(true);

    return () => { };
  }, []);

  // Update grid when data and config are loaded
  useEffect(() => {
    if (!gridInitialized) return;

    const updateTimeout = setTimeout(() => {
      console.log('Updating grid with widgets:', {
        selectedWidgets,
        savedLayout,
      });
      updateGridWithWidgets(selectedWidgets, savedLayout);
      setLoading(false);
    }, 0);

    return () => clearTimeout(updateTimeout);
  }, [gridInitialized, selectedWidgets, savedLayout]);

  // Update grid options when mode changes
  useEffect(() => {
    if (!gridInstanceRef.current || !gridInitialized) return;

    gridInstanceRef.current.enableMove(mode === 'edit');
    gridInstanceRef.current.enableResize(mode === 'edit');
  }, [mode, gridInitialized]);

  // Update widget data when data prop changes
  useEffect(() => {
    setWidgetData(data);
  }, [data]);

  const toggleWidget = (widgetId: string) => {
    console.log(
      `Toggling widget: ${widgetId}, current state:`,
      selectedWidgets.includes(widgetId) ? 'ON → OFF' : 'OFF → ON',
    );

    setSelectedWidgets((prev) => {
      const newSelection = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];

      // Update grid immediately after state change
      requestAnimationFrame(() => {
        if (gridInstanceRef.current && gridInitialized) {
          updateGridWithWidgets(newSelection, savedLayout);

          const updatedChartSettings: Record<string, ChartSettings> = {};
          newSelection.forEach((id) => {
            if (savedChartSettings[id]) {
              updatedChartSettings[id] = savedChartSettings[id];
            }
          });
          setSavedChartSettings(updatedChartSettings);
        }
      });

      return newSelection;
    });
  };

  const handleSaveView = async () => {
    try {
      // Validate required fields
      if (!saveName.trim()) {
        toast.error('View name is required');
        return;
      }

      const updatedConfig: DashboardConfig = {
        ...config,
        title: saveTitle?.trim() ?? dashboardTitle,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to?.toISOString() ?? null,
        },
        widgets: selectedWidgets,
        layout: gridInstanceRef.current
          ? (gridInstanceRef.current.save(true) as GridStackWidget[])
          : [],
        chartSettings: savedChartSettings,
      };

      onSave?.(updatedConfig);
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
      setSaveTitle('');
      setIsDefault(false);
      setMode('view');
      toast.success('Dashboard view saved successfully');
    } catch (error) {
      console.error('Error saving view:', error);
      toast.error('Failed to save dashboard view. Please try again.');
    }
  };

  const handleWidgetSettingsChange = async (
    widgetId: string,
    settings: ChartSettings,
  ) => {
    const updatedChartSettings: Record<string, ChartSettings> = {
      ...savedChartSettings,
      [widgetId]: settings,
    };

    setSavedChartSettings(updatedChartSettings);

    // Update config if callback provided
    if (onConfigChange) {
      const updatedConfig: DashboardConfig = {
        ...config,
        chartSettings: updatedChartSettings,
      };
      onConfigChange(updatedConfig);
    }
  };

  const updateGridWithWidgets = (
    widgets: string[],
    layout: GridStackWidget[],
  ) => {
    if (!gridInstanceRef.current || !gridRef.current) return;

    console.log('Updating grid with widgets:', {
      widgets,
      layout,
      hasData: Object.keys(widgetData).length > 0,
      dataLoading,
    });

    const grid = gridInstanceRef.current;
    const reactRoots = reactRootsRef.current;
    const existingWidgets = new Set(Array.from(reactRoots.keys()));

    // Create a map of widget layouts by ID
    const layoutMap = new Map(layout.map((item) => [item.id, item]));

    // Only remove widgets that are no longer needed
    const widgetsToRemove = Array.from(existingWidgets).filter(
      (id) => !widgets.includes(id),
    );

    // Clean up React roots for removed widgets
    widgetsToRemove.forEach((widgetId) => {
      const root = reactRoots.get(widgetId);
      if (root) {
        try {
          root.unmount();
        } catch (e) {
          console.error('Error unmounting React root:', e);
        }
        reactRoots.delete(widgetId);

        // Remove widget from grid
        const element = grid.engine.nodes.find((n) => n.id === widgetId)?.el;
        if (element) {
          grid.removeWidget(element, false);
        }
      }
    });

    // Add or update widgets
    widgets.forEach((widgetId, index) => {
      const widget = widgetDefinitions.find((w) => w.id === widgetId);
      if (!widget) return;

      type LayoutItem = {
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
      };

      const defaultLayout: LayoutItem = {
        id: widgetId,
        x: index % 3,
        y: Math.floor(index / 3),
        w: 4,
        h: 2,
      };

      const layoutItem = layoutMap.get(widgetId) ?? defaultLayout;

      // If widget already exists, just update its data
      if (existingWidgets.has(widgetId)) {
        const root = reactRoots.get(widgetId);
        if (root) {
          root.render(
            <widget.component
              key={widgetId}
              title={widget.name}
              value={widgetData[widgetId]?.metric?.value || 'N/A'}
              trend={widgetData[widgetId]?.metric?.trend}
              data={widgetData[widgetId]}
              mode={mode}
              onSettingsChange={handleWidgetSettingsChange.bind(null, widgetId)}
              settings={savedChartSettings?.[widgetId]}
              valueFormatter={{ style: 'currency', currency: 'USD' }}
            />,
          );
        }
        return;
      }

      // Create new widget
      const widgetElement = document.createElement('div');
      widgetElement.className = 'grid-stack-item';
      widgetElement.setAttribute('gs-id', widgetId);
      widgetElement.setAttribute('gs-x', String(layoutItem.x));
      widgetElement.setAttribute('gs-y', String(layoutItem.y));
      widgetElement.setAttribute('gs-w', String(layoutItem.w));
      widgetElement.setAttribute('gs-h', String(layoutItem.h));

      const contentElement = document.createElement('div');
      contentElement.className = 'grid-stack-item-content';
      widgetElement.appendChild(contentElement);

      grid.makeWidget(widgetElement);

      // Create a new React root and store it
      const root = ReactDOM.createRoot(contentElement);
      reactRoots.set(widgetId, root);

      // Render the component with data
      root.render(
        <widget.component
          key={widgetId}
          title={widget.name}
          value={widgetData[widgetId]?.metric?.value || 'N/A'}
          trend={widgetData[widgetId]?.metric?.trend}
          data={widgetData[widgetId]}
          mode={mode}
          onSettingsChange={handleWidgetSettingsChange.bind(null, widgetId)}
          settings={savedChartSettings?.[widgetId]}
          valueFormatter={{ style: 'currency', currency: 'USD' }}
        />,
      );
    });

    grid.compact();
  };

  // Effect to update grid when data changes
  useEffect(() => {
    if (gridInitialized && selectedWidgets.length > 0) {
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        updateGridWithWidgets(selectedWidgets, savedLayout);
      });
    }
  }, [gridInitialized, selectedWidgets, savedLayout, widgetData]);

  // Add ref for PropertyFilters component
  const propertyFiltersRef = useRef<{ handleClearAllFilters: () => void }>(null);

  return (
    <Card className={`relative w-full ${className}`}>
      {loading && (
        <div className="absolute flex h-full w-full flex-1 items-center justify-center">
          <LoadingOverlay className="!absolute !h-full !w-full !rounded-xl !bg-white" />
        </div>
      )}
      <CardHeader className="flex-none">
        {loading ? (
          <SkeletonHeader />
        ) : (
          <div className="flex items-center justify-between space-x-2">
            {mode === 'edit' ? (
              <Input
                value={dashboardTitle}
                onChange={(e) => {
                  setDashboardTitle(e.target.value);
                  setSaveTitle(e.target.value);
                }}
                className="mr-4 h-12 w-1/2 px-3 text-2xl font-bold"
              />
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{dashboardTitle}</CardTitle>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {config.filters?.enabled && (
                <PropertyFilters
                  ref={propertyFiltersRef}
                  onFiltersChange={(filters) => {
                    setPropertyFilters(filters);
                    onFiltersChange?.(filters);
                  }}
                  defaultFilters={propertyFilters}
                  dashboardType="property"
                />
              )}

              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !dateRange && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-4" align="end">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Start Date</Label>
                        <DatePicker
                          date={tempDateRange?.from}
                          onDateChange={(date: Date | undefined) => {
                            if (
                              date &&
                              tempDateRange.to &&
                              date > tempDateRange.to
                            ) {
                              setTempDateRange({
                                from: date,
                                to: undefined,
                              });
                            } else {
                              setTempDateRange((_prev) => ({
                                from: date ?? tempDateRange.from,
                                to: tempDateRange.to,
                              }));
                            }
                          }}
                          presets={DASHBOARD_DATE_PRESETS as any}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>End Date</Label>
                        <DatePicker
                          date={tempDateRange?.to}
                          onDateChange={(date: Date | undefined) => {
                            if (date && date < tempDateRange.from) {
                              return;
                            }
                            setTempDateRange((prev) => ({
                              from: prev.from,
                              to: date,
                            }));
                          }}
                          presets={DASHBOARD_DATE_PRESETS as any}
                        />
                      </div>
                    </div>
                    <div className="rounded-md border p-4">
                      <Calendar
                        mode="range"
                        selected={tempDateRange}
                        onSelect={(range: DateRange | undefined) => {
                          if (!range?.from) return;
                          if (!range.to || range.from <= range.to) {
                            setTempDateRange({
                              from: range.from,
                              to: range.to,
                            });
                          }
                        }}
                        initialFocus
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTempDateRange(dateRange);
                          setDatePickerOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setDateRange(tempDateRange);
                          setDatePickerOpen(false);
                          onWidgetUpdate?.('date-range', tempDateRange);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {mode === 'edit' ? (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setMode('view')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setMode('edit')}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Customize
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mode === 'edit' &&
            (loading ? (
              <SkeletonWidgetSelector />
            ) : (
              <Card className="flex-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Add KPIs</CardTitle>
                      <CardDescription>
                        Select KPIs to add to your dashboard
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="category-view"
                        className="text-sm text-muted-foreground"
                      >
                        Show Categories
                      </Label>
                      <Switch
                        id="category-view"
                        checked={showCategories}
                        onCheckedChange={setShowCategories}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedWidgets(widgetDefinitions.map((w) => w.id))
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWidgets([])}
                      >
                        Select None
                      </Button>
                    </div>
                  </div>

                  {showCategories ? (
                    <Tabs defaultValue={Object.keys(widgetsByCategory)[0]}>
                      <TabsList className="mb-4">
                        {Object.keys(widgetsByCategory).map((category) => (
                          <TabsTrigger key={category} value={category}>
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {Object.entries(widgetsByCategory).map(
                        ([category, widgets]) => (
                          <TabsContent
                            key={category}
                            value={category}
                            className="m-0"
                          >
                            <ScrollArea className="h-[200px] pr-4">
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {widgets.map((widget) => {
                                  const isSelected = selectedWidgets.includes(
                                    widget.id,
                                  );
                                  return (
                                    <TooltipProvider key={widget.id}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              'h-auto justify-start px-4 py-2 text-left shadow-sm transition-all hover:bg-muted',
                                              isSelected &&
                                              'border-primary bg-primary text-white shadow-md hover:bg-primary hover:text-white',
                                            )}
                                            onClick={() =>
                                              toggleWidget(widget.id)
                                            }
                                          >
                                            <div className="flex w-full items-center">
                                              {isSelected ? (
                                                <CircleCheck className="mr-2 h-4 w-4 shrink-0 text-white" />
                                              ) : (
                                                <CirclePlus className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                              )}
                                              <span className="truncate">
                                                {widget.name}
                                              </span>
                                            </div>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{widget.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        ),
                      )}
                    </Tabs>
                  ) : (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {widgetDefinitions.map((widget) => {
                          const isSelected = selectedWidgets.includes(
                            widget.id,
                          );
                          return (
                            <TooltipProvider key={widget.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'h-auto justify-start px-4 py-2 text-left shadow-sm transition-all hover:bg-muted',
                                      isSelected &&
                                      'border-primary bg-primary text-white shadow-md hover:bg-primary hover:text-white',
                                    )}
                                    onClick={() => toggleWidget(widget.id)}
                                  >
                                    <div className="flex w-full items-center">
                                      {isSelected ? (
                                        <CircleCheck className="mr-2 h-4 w-4 shrink-0 text-white" />
                                      ) : (
                                        <CirclePlus className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                      )}
                                      <span className="truncate">
                                        {widget.name}
                                      </span>
                                    </div>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{widget.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ))}

          <div className="relative flex flex-col gap-1">
            {/* Top scrollbar container */}
            <div className="overflow-x-auto">
              <div className="min-w-[1000px] h-3" />
            </div>

            {/* Main content container - linked scrolling */}
            <div
              className="relative w-full overflow-x-auto"
              onScroll={(e) => {
                const topScrollbar = e.currentTarget.previousElementSibling as HTMLElement;
                if (topScrollbar) {
                  topScrollbar.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
            >
              <div className="min-w-[1000px]">
                {!loading &&
                  !dataLoading &&
                  Object.keys(widgetData).length === 0 && (
                    <Card className="h-full w-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          {selectedWidgets.length === 0 ? (
                            'No Widgets Selected'
                          ) : (
                            'No Results Found'
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex h-full min-h-[400px] items-center justify-center">
                        <div className="text-center">
                          {selectedWidgets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Add widgets to your dashboard to see data
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">
                                No data matches your current filters
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                  if (propertyFiltersRef.current) {
                                    propertyFiltersRef.current.handleClearAllFilters();
                                  }
                                }}
                              >
                                Clear Filters
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                {!loading && dataLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Card className="mx-auto max-w-md p-6">
                      <CardHeader className="flex flex-col items-center text-center">
                        <div className="mt-4">
                          <LoadingOverlay
                            className="mt-4 h-8 w-8"
                            fullPage={false}
                          />
                        </div>
                        <CardTitle>Loading Data</CardTitle>
                        <CardDescription>
                          Fetching the latest property data...
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                )}
                <div ref={gridRef} className="grid-stack"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showSaveDialog} onOpenChange={(open) => {
        if (!open) {
          setSaveName('');
          setSaveDescription('');
          setSaveTitle('');
          setIsDefault(false);
        }
        setShowSaveDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard View</DialogTitle>
            <DialogDescription>
              Save your current dashboard layout and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>View Name *</Label>
              <Input
                value={saveName}
                required
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="View name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Dashboard Title</Label>
              <Input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder={dashboardTitle}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-default"
                checked={isDefault}
                onCheckedChange={(checked: boolean) => setIsDefault(checked)}
              />
              <Label htmlFor="is-default">
                Set as default view
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView}>Save View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 