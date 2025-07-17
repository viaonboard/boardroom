'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { endOfYear, format, startOfYear, subMonths, subYears } from 'date-fns';
import { GridStack, GridStackWidget } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import {
  AlertTriangle,
  BarChart3,
  CalendarIcon,
  CircleCheck,
  CirclePlus,
  Edit,
  Info,
  RotateCcw,
  Save,
  Settings2,
  Trash2
} from 'lucide-react';
import * as ReactDOM from 'react-dom/client';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DatePicker,
  DateRange,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  LoadingOverlay,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './src/ui';

import { cn } from './src/lib/utils';

import './dashboard-widget.css';
import { PropertyFilters } from './src/components/filters/property-filters';
import type { ChartSettings, DashboardConfig, PropertyFilterParams, SavedFilter, WidgetConfig, WidgetData } from './src/types';
import { DynamicWidget } from './src/widgets/dynamic-widget';

// Date presets for the dashboard
const DASHBOARD_DATE_PRESETS = [
  {
    label: 'Last 30 days',
    value: () => ({
      from: subMonths(new Date(), 1),
      to: new Date(),
    }),
  },
  {
    label: 'Last 3 months',
    value: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: 'Last 6 months',
    value: () => ({
      from: subMonths(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: 'Last year',
    value: () => ({
      from: subYears(new Date(), 1),
      to: new Date(),
    }),
  },
  {
    label: 'This year',
    value: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
];

// Widget definitions with their components
const allWidgetDefinitions: WidgetConfig[] = [
  {
    id: 'noi',
    name: 'Net Operating Income (NOI)',
    category: 'Income',
    component: DynamicWidget,
    description: 'Total income minus operating expenses',
    defaultSettings: {
      type: 'bar' as const,
      color: 'blue' as const,
      formatType: 'currency' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
  {
    id: 'occupancy',
    name: 'Occupancy Rate',
    category: 'Occupancy',
    component: DynamicWidget,
    description: 'Percentage of occupied units',
    defaultSettings: {
      type: 'line' as const,
      color: 'green' as const,
      formatType: 'percentage' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
  {
    id: 'capRate',
    name: 'Cap Rate',
    category: 'Returns',
    component: DynamicWidget,
    description: 'Capitalization rate',
    defaultSettings: {
      type: 'line' as const,
      color: 'orange' as const,
      formatType: 'percentage' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
  {
    id: 'cashFlow',
    name: 'Cash Flow',
    category: 'Income',
    component: DynamicWidget,
    description: 'Net cash flow from operations',
    defaultSettings: {
      type: 'bar' as const,
      color: 'purple' as const,
      formatType: 'currency' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
  {
    id: 'expenseRatio',
    name: 'Expense Ratio',
    category: 'Expenses',
    component: DynamicWidget,
    description: 'Operating expenses as percentage of income',
    defaultSettings: {
      type: 'pie' as const,
      color: 'red' as const,
      formatType: 'percentage' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
  {
    id: 'irr',
    name: 'Internal Rate of Return (IRR)',
    category: 'Returns',
    component: DynamicWidget,
    description: 'Internal rate of return',
    defaultSettings: {
      type: 'line' as const,
      color: 'primary' as const,
      formatType: 'percentage' as const,
      showTrend: true,
      mode: 'metric' as const,
    },
  },
].sort((a, b) => a.name.localeCompare(b.name));

// Group widgets by category - this will be computed dynamically based on available widgets
const getWidgetsByCategory = (widgets: WidgetConfig[]) => {
  return Object.fromEntries(
    Object.entries(
      widgets.reduce<Record<string, typeof widgets>>(
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
};

// Function to dynamically generate chart settings based on widget configurations
const generateChartSettings = (widgets: string[], widgetDefinitions: WidgetConfig[]): Record<string, ChartSettings> => {
  const chartSettings: Record<string, ChartSettings> = {};
  
  widgets.forEach((widgetId) => {
    const widget = widgetDefinitions.find((w) => w.id === widgetId);
    if (widget && widget.defaultSettings) {
      chartSettings[widgetId] = {
        type: widget.defaultSettings.type || 'bar',
        color: widget.defaultSettings.color || 'blue',
        showTrend: widget.defaultSettings.showTrend ?? true,
        mode: widget.defaultSettings.mode || 'metric',
      };
    }
  });
  
  return chartSettings;
};

// Function to create default dashboard state dynamically
const createDefaultDashboardState = (widgetDefinitions: WidgetConfig[]): DashboardConfig => {
  const defaultWidgets = ['noi', 'occupancy', 'capRate', 'cashFlow', 'expenseRatio', 'irr'];
  
  return {
    title: 'Financial Dashboard',
    description: 'Default financial dashboard',
    dateRange: {
      from: new Date().toISOString(),
      to: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    },
    widgets: defaultWidgets,
    layout: [
      { x: 0, y: 0, w: 6, h: 4, id: 'noi' },
      { x: 6, y: 0, w: 6, h: 4, id: 'occupancy' },
      { x: 0, y: 4, w: 4, h: 4, id: 'capRate' },
      { x: 4, y: 4, w: 4, h: 4, id: 'cashFlow' },
      { x: 8, y: 4, w: 4, h: 4, id: 'expenseRatio' },
      { x: 0, y: 8, w: 12, h: 4, id: 'irr' },
    ],
    chartSettings: generateChartSettings(defaultWidgets, widgetDefinitions),
  };
};

// Default dashboard state - now generated dynamically
const DEFAULT_DASHBOARD_STATE = createDefaultDashboardState(allWidgetDefinitions);

// Skeleton components for loading states
function SkeletonWidget() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between space-x-2">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
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
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export interface DashboardWidgetProps {
  config?: DashboardConfig;
  data?: Record<string, WidgetData>;
  widgetConfigs?: WidgetConfig[]; // Add this prop to accept custom widget configurations
  onConfigChange?: (config: DashboardConfig) => void;
  onSaveConfig?: (config: DashboardConfig) => Promise<void>;
  onLoadConfig?: () => Promise<DashboardConfig[]>;
  onDeleteConfig?: (id: string) => Promise<void>;
  onFiltersChange?: (filters: PropertyFilterParams) => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: SavedFilter) => Promise<void>;
  onLoadFilter?: (id: string) => Promise<SavedFilter>;
  onDeleteFilter?: (id: string) => Promise<void>;
  loading?: boolean;
  error?: any;
  className?: string;
  dashboardType?: 'primary' | 'property' | 'investor';
}

export const DashboardWidget = React.memo(function DashboardWidget({
  config,
  data = {},
  widgetConfigs,
  onConfigChange,
  onSaveConfig,
  onLoadConfig,
  onDeleteConfig,
  onFiltersChange,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  loading = false,
  error = null,
  className,
  dashboardType,
}: DashboardWidgetProps) {
  // Use custom widget configs if provided, otherwise use default ones
  const availableWidgets = widgetConfigs || allWidgetDefinitions;
  
  // Create default config dynamically based on available widgets
  const defaultConfig = useMemo(() => {
    return config || createDefaultDashboardState(availableWidgets);
  }, [config, availableWidgets]);

  // Debug: Log incoming props
  console.log('[DashboardWidget] render', { 
    config: defaultConfig, 
    data, 
    loading, 
    error,
    availableWidgets: availableWidgets.map(w => w.id),
    hasCustomWidgets: !!widgetConfigs
  });

  // State management
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [dashboardTitle, setDashboardTitle] = useState(defaultConfig.title);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultConfig.dateRange?.from ? new Date(defaultConfig.dateRange.from) : new Date(),
    to: defaultConfig.dateRange?.to ? new Date(defaultConfig.dateRange.to) : undefined,
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(defaultConfig.widgets);
  const [savedLayout, setSavedLayout] = useState<GridStackWidget[]>(defaultConfig.layout);
  const [showCategories, setShowCategories] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedView, setSelectedView] = useState<string | null>(null);
  const [deleteViewId, setDeleteViewId] = useState<string | null>(null);
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilterParams>({ accountSlug: 'default' });
  const [configurations, setConfigurations] = useState<DashboardConfig[]>([]);
  const [originalSavedState, setOriginalSavedState] = useState<{
    widgets: string[];
    layout: GridStackWidget[];
  } | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);

  // Define updateGridWithWidgets before it's used in useEffect
  const updateGridWithWidgets = useCallback((
    widgets: string[],
    layout: GridStackWidget[],
  ) => {
    console.log('[DashboardWidget] updateGridWithWidgets called', { 
      widgets, 
      layout, 
      hasData: Object.keys(data).length > 0,
      dataKeys: Object.keys(data),
      availableWidgets: availableWidgets.map(w => w.id),
      mode,
      gridInitialized
    });
    
    if (!gridInstanceRef.current) {
      console.log('Grid not initialized yet');
      return;
    }

    console.log('Updating grid with widgets:', {
      widgets,
      layout,
      hasData: Object.keys(data).length > 0,
      dataKeys: Object.keys(data),
    });

    const grid = gridInstanceRef.current;
    const layoutMap = new Map(layout.map((item) => [item.id, item]));
    const existingWidgets = new Set(
      grid.engine.nodes.map((node) => node.id),
    );

    const widgetsToRemove = Array.from(existingWidgets).filter(
      (id) => id && !widgets.includes(id),
    );

    // Clean up React roots for removed widgets
    widgetsToRemove.forEach((widgetId) => {
      if (!widgetId) return;
      const root = reactRoots.current.get(widgetId);
      if (root) {
        // Defer unmounting to avoid synchronous unmount during render
        setTimeout(() => {
          try {
            root.unmount();
          } catch (e) {
            console.error('Error unmounting React root:', e);
          }
        }, 0);
        reactRoots.current.delete(widgetId);

        // Remove widget from grid
        const element = grid.engine.nodes.find((n) => n.id === widgetId)?.el;
        if (element) {
          grid.removeWidget(element, false);
        }
      }
    });

    // Add or update widgets
    let widgetCount = 0;
    widgets.forEach((widgetId, index) => {
      const widget = availableWidgets.find((w) => w.id === widgetId);
      if (!widget) {
        console.log('Widget not found:', {
          widgetId,
          availableWidgets: availableWidgets.map(w => w.id),
        });
        return;
      }
      widgetCount++;

      console.log('Processing widget:', {
        widgetId, 
        widgetName: widget.name,
        hasData: !!data[widgetId],
        data: data[widgetId],
        chartSettings: defaultConfig.chartSettings?.[widgetId]
      });

      const defaultLayout = {
        id: widgetId,
        x: index % 2,
        y: Math.floor(index / 2),
        w: 6,
        h: 4,
      };

      const layoutItem = layoutMap.get(widgetId) ?? defaultLayout;

      // If widget already exists, just update its data
      if (existingWidgets.has(widgetId)) {
        const root = reactRoots.current.get(widgetId);
        if (root) {
          root.render(
            <widget.component
              key={widgetId}
              config={widget}
              mode={mode}
              data={data[widgetId]}
              chartSettings={defaultConfig.chartSettings?.[widgetId]}
              onChartSettingsChange={(settings: ChartSettings) => {
                if (onConfigChange) {
                  const updatedConfig = {
                    ...defaultConfig,
                    chartSettings: {
                      ...defaultConfig.chartSettings,
                      [widgetId]: settings,
                    },
                  };
                  onConfigChange(updatedConfig);
                }
              }}
              onTypeChange={(type: 'metric' | 'graph') => {
                // Update chart settings when switching between metric and graph view
                if (onConfigChange) {
                  const currentSettings = defaultConfig.chartSettings?.[widgetId] || widget.defaultSettings;
                  const updatedSettings: ChartSettings = {
                    type: currentSettings?.type || 'bar',
                    color: currentSettings?.color || 'blue',
                    showTrend: currentSettings?.showTrend ?? true,
                    mode: type,
                  };
                  
                  const updatedConfig = {
                    ...defaultConfig,
                    chartSettings: {
                      ...defaultConfig.chartSettings,
                      [widgetId]: updatedSettings,
                    },
                  };
                  onConfigChange(updatedConfig);
                }
              }}
              valueFormatter={
                widget.defaultSettings?.formatType === 'currency'
                  ? { style: 'currency' as const, currency: 'USD' }
                  : widget.defaultSettings?.formatType === 'percentage'
                  ? { style: 'percent' as const }
                  : { style: 'decimal' as const }
              }
            />,
          );
        }
        return;
      }

      // Create new widget
      const widgetElement = document.createElement('div');
      widgetElement.className = 'grid-stack-item';
      widgetElement.setAttribute('gs-id', widgetId);
      widgetElement.setAttribute('gs-x', String(layoutItem.x ?? 0));
      widgetElement.setAttribute('gs-y', String(layoutItem.y ?? 0));
      widgetElement.setAttribute('gs-w', String(layoutItem.w ?? 0));
      widgetElement.setAttribute('gs-h', String(layoutItem.h ?? 0));

      const contentElement = document.createElement('div');
      contentElement.className = 'grid-stack-item-content';
      widgetElement.appendChild(contentElement);

      grid.makeWidget(widgetElement);

      // Create a new React root and store it
      const root = ReactDOM.createRoot(contentElement);
      reactRoots.current.set(widgetId, root);

      // Render the component with data
      root.render(
        <widget.component
          key={widgetId}
          config={widget}
          mode={mode}
          data={data[widgetId]}
          chartSettings={defaultConfig.chartSettings?.[widgetId]}
          onChartSettingsChange={(settings: ChartSettings) => {
            if (onConfigChange) {
              const updatedConfig = {
                ...defaultConfig,
                chartSettings: {
                  ...defaultConfig.chartSettings,
                  [widgetId]: settings,
                },
              };
              onConfigChange(updatedConfig);
            }
          }}
          onTypeChange={(type: 'metric' | 'graph') => {
            // Update chart settings when switching between metric and graph view
            if (onConfigChange) {
              const currentSettings = defaultConfig.chartSettings?.[widgetId] || widget.defaultSettings;
              const updatedSettings: ChartSettings = {
                type: currentSettings?.type || 'bar',
                color: currentSettings?.color || 'blue',
                showTrend: currentSettings?.showTrend ?? true,
                mode: type,
              };
              
              const updatedConfig = {
                ...defaultConfig,
                chartSettings: {
                  ...defaultConfig.chartSettings,
                  [widgetId]: updatedSettings,
                },
              };
              onConfigChange(updatedConfig);
            }
          }}
          valueFormatter={
            widget.defaultSettings?.formatType === 'currency'
              ? { style: 'currency' as const, currency: 'USD' }
              : widget.defaultSettings?.formatType === 'percentage'
              ? { style: 'percent' as const }
              : { style: 'decimal' as const }
          }
        />,
      );
    });

    if (widgetCount === 0) {
      // Fallback: show a message in the grid if no widgets are rendered
      if (gridRef.current) {
        gridRef.current.innerHTML = '<div style="padding:2rem;text-align:center;color:#888;">No widgets to display</div>';
      }
    }

    grid.compact();
  }, [mode, data, availableWidgets, defaultConfig.chartSettings, onConfigChange]);

  // Update grid when widgets or layout changes
  useEffect(() => {
    // Debug: confirm effect runs and config is correct
    console.log('[DashboardWidget] useEffect for grid update', {
      gridInitialized,
      widgets: defaultConfig.widgets,
      layout: defaultConfig.layout,
      dataKeys: Object.keys(data),
      hasGridInstance: !!gridInstanceRef.current,
    });
    if (gridInitialized && defaultConfig.widgets.length > 0 && gridInstanceRef.current) {
      // Use a small delay to ensure DOM is ready
      setTimeout(() => {
        updateGridWithWidgets(defaultConfig.widgets, defaultConfig.layout);
      }, 100);
    }
  }, [gridInitialized, defaultConfig.widgets, defaultConfig.layout, data, updateGridWithWidgets]);

  // Update grid when selectedWidgets change (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && gridInitialized && gridInstanceRef.current) {
      console.log('Selected widgets changed, updating grid:', selectedWidgets);
      setTimeout(() => {
        updateGridWithWidgets(selectedWidgets, defaultConfig.layout);
      }, 0);
    }
  }, [selectedWidgets, mode, gridInitialized, updateGridWithWidgets, defaultConfig.layout]);

  // Update grid when mode changes
  useEffect(() => {
    if (gridInitialized && gridInstanceRef.current) {
      console.log('Mode changed, updating grid:', { mode, selectedWidgets });
      setTimeout(() => {
        updateGridWithWidgets(selectedWidgets, defaultConfig.layout);
      }, 0);
    }
  }, [mode, gridInitialized, updateGridWithWidgets, selectedWidgets, defaultConfig.layout]);

  // Keep selectedWidgets in sync with config.widgets
  useEffect(() => {
    if (defaultConfig.widgets && defaultConfig.widgets.length > 0) {
      setSelectedWidgets(defaultConfig.widgets);
    }
  }, [defaultConfig.widgets]);

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);
  const reactRoots = useRef<Map<string, ReactDOM.Root>>(new Map());
  const propertyFiltersRef = useRef<{ handleClearAllFilters: () => void }>(null);

  // Cleanup effect for React roots
  useEffect(() => {
    return () => {
      // Clean up all React roots on component unmount
      reactRoots.current.forEach((root) => {
        try {
          root.unmount();
        } catch (e) {
          console.error('Error unmounting React root during cleanup:', e);
        }
      });
      reactRoots.current.clear();
    };
  }, []);

  // Initialize GridStack
  useEffect(() => {
    console.log('GridStack initialization effect:', {
      hasGridRef: !!gridRef.current,
      hasGridInstance: !!gridInstanceRef.current,
      gridStackAvailable: typeof GridStack !== 'undefined',
      mode,
    });

    if (gridRef.current && !gridInstanceRef.current && typeof GridStack !== 'undefined') {
      try {
        console.log('Initializing GridStack...');
        gridInstanceRef.current = GridStack.init(
          {
            column: 12,
            cellHeight: 80,
            minRow: 5,
            margin: 16,
            float: true,
            animate: false,
            draggable: {
              handle: '.cursor-move, .grip-vertical',
            },
            disableDrag: mode === 'view',
            disableResize: mode === 'view',
            acceptWidgets: true,
            removable: false,
            staticGrid: false,
            rtl: false,
            alwaysShowResizeHandle: mode === 'edit',
            resizable: {
              handles: mode === 'edit' ? 'e,se,s' : 'none',
            },
          },
          gridRef.current,
        );
        setGridInitialized(true);
        console.log('GridStack initialized successfully');
      } catch (e) {
        console.error('GridStack initialization failed', e);
      }
    }
  }, [mode]);

  // Update tempDateRange when dateRange changes
  useEffect(() => {
    if (dateRange) {
      setTempDateRange(dateRange);
    }
  }, [dateRange]);

  // Load configurations on mount
  useEffect(() => {
    if (onLoadConfig) {
      void loadConfigurations();
    }
  }, [onLoadConfig]); // Only depend on onLoadConfig, not loadConfigurations function

  const loadConfigurations = async (selectDefaultView = true) => {
    if (!onLoadConfig) return;

    try {
      const configs = await onLoadConfig();
      setConfigurations(configs);

      if (selectDefaultView && configs.length > 0) {
        // Since DashboardConfig doesn't have isDefault, just use the first config
        const defaultConfig = configs[0];
        if (defaultConfig) {
          loadView(defaultConfig);
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast.error('Failed to load dashboard configurations');
    }
  };

  const loadView = (view: DashboardConfig) => {
    setDashboardTitle(view.title);
    setDateRange({
      from: view.dateRange?.from ? new Date(view.dateRange.from) : new Date(),
      to: view.dateRange?.to ? new Date(view.dateRange.to) : undefined,
    });
    setSelectedWidgets(view.widgets);
    setSavedLayout(view.layout);
    // Note: DashboardConfig doesn't have an id property, so we'll use a different approach
    setSelectedView(view.title); // Use title as identifier for now
  };

  const resetDashboard = () => {
    const newDefaultState = createDefaultDashboardState(availableWidgets);
    setDashboardTitle(newDefaultState.title);
    setDateRange({
      from: new Date(newDefaultState.dateRange.from),
      to: newDefaultState.dateRange.to ? new Date(newDefaultState.dateRange.to) : undefined,
    });
    setSelectedWidgets(newDefaultState.widgets);
    setSavedLayout(newDefaultState.layout);
    setSelectedView(null);
  };

  const toggleWidget = (widgetId: string) => {
    const newSelectedWidgets = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter((id) => id !== widgetId)
      : [...selectedWidgets, widgetId];
    
    setSelectedWidgets(newSelectedWidgets);
    
    // Update the config immediately
    if (onConfigChange) {
      const updatedConfig = {
        ...defaultConfig,
        widgets: newSelectedWidgets,
      };
      onConfigChange(updatedConfig);
    }

    // Force grid update after state change
    setTimeout(() => {
      if (gridInstanceRef.current && gridInitialized) {
        updateGridWithWidgets(newSelectedWidgets, defaultConfig.layout);
      }
    }, 0);
  };

  const handleEditView = (view: DashboardConfig) => {
    setSaveName(view.title); // Use title instead of name
    setSaveDescription(view.description || '');
    setSaveTitle(view.title);
    setIsDefault(false); // DashboardConfig doesn't have isDefault
    setSelectedView(view.title); // Use title as identifier
    setShowSaveDialog(true);
  };

  const handleSaveView = async () => {
    if (!onSaveConfig || !saveName.trim()) {
      toast.error('Please provide a name for the dashboard view');
      return;
    }

    try {
      const newConfig: DashboardConfig = {
        title: saveTitle || dashboardTitle,
        description: saveDescription,
        dateRange: {
          from: dateRange?.from?.toISOString() || new Date().toISOString(),
          to: dateRange?.to?.toISOString() || null,
        },
        widgets: selectedWidgets,
        layout: gridInstanceRef.current
          ? (gridInstanceRef.current.save(true) as GridStackWidget[]).map(widget => ({
              x: widget.x ?? 0,
              y: widget.y ?? 0,
              w: widget.w ?? 4,
              h: widget.h ?? 4,
              id: widget.id ?? '',
            }))
          : savedLayout.map(widget => ({
              x: widget.x ?? 0,
              y: widget.y ?? 0,
              w: widget.w ?? 4,
              h: widget.h ?? 4,
              id: widget.id ?? '',
            })),
        chartSettings: defaultConfig.chartSettings || {},
      };

      await onSaveConfig(newConfig);
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
      setSaveTitle('');
      setIsDefault(false);
      setSelectedView(null);
      await loadConfigurations(false);
      toast.success('Dashboard view saved successfully');
    } catch (error) {
      console.error('Error saving view:', error);
      toast.error('Failed to save dashboard view');
    }
  };

  const handleDeleteView = async (id: string) => {
    if (!onDeleteConfig) return;

    try {
      await onDeleteConfig(id);
      setDeleteViewId(null);
      await loadConfigurations(false);
      toast.success('Dashboard view deleted successfully');
    } catch (error) {
      console.error('Error deleting view:', error);
      toast.error('Failed to delete dashboard view');
    }
  };

  const handleViewSelect = (value: string) => {
    if (value === 'default') {
      resetDashboard();
      setSelectedView(null);
    } else {
      const view = configurations.find((v) => v.title === value); // Changed to title
      if (view) {
        loadView(view);
      }
    }
    setViewPopoverOpen(false);
  };

  const saveOriginalState = () => {
    setOriginalSavedState({
      widgets: selectedWidgets,
      layout: savedLayout,
    });
  };

  const handleCancelEdit = () => {
    if (originalSavedState) {
      setSelectedWidgets(originalSavedState.widgets);
      setSavedLayout(originalSavedState.layout);
    }
    setMode('view');
    setOriginalSavedState(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Failed to load dashboard</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('relative w-full', className)}>
      {loading && (
        <div className="absolute flex h-full w-full flex-1 items-center justify-center">
          <LoadingOverlay className="!absolute !h-full !w-full !rounded-xl !bg-white" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="mx-auto max-w-md p-6">
            <CardHeader className="flex flex-col items-center text-center">
              <CardTitle>Error Loading Dashboard</CardTitle>
              <CardDescription className="text-destructive">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
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
                onChange={(e) => setDashboardTitle(e.target.value)}
                className="mr-4 h-12 w-1/2 px-3 text-2xl font-bold"
              />
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{dashboardTitle}</CardTitle>
                {selectedView &&
                  configurations.find((v) => v.title === selectedView) // Changed to title
                    ?.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {configurations.find((v) => v.title === selectedView) // Changed to title
                              ?.description ?? ''}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              {dashboardType === 'primary' && (
                <PropertyFilters
                  ref={propertyFiltersRef}
                  onFiltersChange={setPropertyFilters}
                  defaultFilters={propertyFilters}
                  dashboardType="property"
                />
              )}

              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[280px] justify-start text-left font-normal',
                          !tempDateRange && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempDateRange?.from ? (
                          tempDateRange.to ? (
                            <>
                              {format(tempDateRange.from, 'LLL dd, y')} -{' '}
                              {format(tempDateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(tempDateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DatePicker
                        date={tempDateRange?.from}
                        onDateChange={(date: Date | undefined) => {
                          if (date) {
                            setTempDateRange({
                              from: date,
                              to: tempDateRange?.to,
                            });
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {onLoadConfig && (
                <Popover
                  open={viewPopoverOpen}
                  onOpenChange={setViewPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings2 className="h-4 w-4" />
                      {selectedView
                        ? configurations.find((v) => v.title === selectedView) // Changed to title
                          ?.title || 'Default View'
                        : 'Default View'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Dashboard Views</h4>
                        <p className="text-sm text-muted-foreground">
                          Select a view to load
                        </p>
                      </div>

                      <div className="h-[200px] overflow-y-auto pr-4">
                        <div className="space-y-2">
                          {configurations.length === 0 && (
                            <Button
                              key="default-view"
                              variant={!selectedView ? 'secondary' : 'outline'}
                              className={cn(
                                'w-full justify-start',
                                selectedView === null && 'border-solid border-primary',
                              )}
                              onClick={() => handleViewSelect('default')}
                            >
                              Default View
                            </Button>
                          )}
                          {configurations.map((view) => (
                            <div
                              key={view.title}
                              className="flex items-center gap-2"
                            >
                              <Button
                                variant={
                                  selectedView === view.title
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={cn(
                                  'w-full justify-start overflow-hidden',
                                  selectedView === view.title &&
                                  'border-solid border-primary',
                                )}
                                onClick={() => handleViewSelect(view.title)}
                              >
                                <span className="flex flex-1 items-center justify-between overflow-hidden text-left">
                                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                    {view.title}
                                  </span>
                                </span>
                              </Button>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditView(view)}
                                  className="h-8 w-8 shrink-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDeleteViewId(view.title)}
                                  className="h-8 w-8 shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {mode === 'edit' ? (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  {selectedView && onSaveConfig && (
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={async () => {
                        const currentView = configurations.find(
                          (v) => v.title === selectedView, // Changed to title
                        );

                        if (currentView && onSaveConfig) {
                          await onSaveConfig({
                            ...currentView,
                            title: dashboardTitle,
                            dateRange: {
                              from: dateRange?.from?.toISOString() || DEFAULT_DASHBOARD_STATE.dateRange.from,
                              to: dateRange?.to?.toISOString() || DEFAULT_DASHBOARD_STATE.dateRange.to,
                            },
                            widgets: selectedWidgets,
                            layout: gridInstanceRef.current
                              ? (gridInstanceRef.current.save(
                                true,
                              ) as GridStackWidget[]).map(widget => ({
                                  x: widget.x ?? 0,
                                  y: widget.y ?? 0,
                                  w: widget.w ?? 4,
                                  h: widget.h ?? 4,
                                  id: widget.id ?? '',
                                }))
                              : savedLayout.map(widget => ({
                                  x: widget.x ?? 0,
                                  y: widget.y ?? 0,
                                  w: widget.w ?? 4,
                                  h: widget.h ?? 4,
                                  id: widget.id ?? '',
                                })),
                            // Note: DashboardConfig doesn't have updatedAt field
                          });

                          setMode('view');
                          setOriginalSavedState(null);
                          await loadConfigurations(false);
                        }
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  )}
                  {onSaveConfig && (
                    <Button
                      variant={selectedView ? 'outline' : 'default'}
                      className="gap-2"
                      onClick={() => {
                        setSelectedView(null);
                        setIsDefault(configurations.length === 0);
                        setShowSaveDialog(true);
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Save As...
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    saveOriginalState();
                    setMode('edit');
                  }}
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
                        onClick={() => {
                          const allWidgetIds = availableWidgets.map((w) => w.id);
                          setSelectedWidgets(allWidgetIds);
                          if (onConfigChange) {
                            const updatedConfig = {
                              ...defaultConfig,
                              widgets: allWidgetIds,
                            };
                            onConfigChange(updatedConfig);
                          }
                          // Force grid update
                          setTimeout(() => {
                            if (gridInstanceRef.current && gridInitialized) {
                              updateGridWithWidgets(allWidgetIds, defaultConfig.layout);
                            }
                          }, 0);
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWidgets([]);
                          if (onConfigChange) {
                            const updatedConfig = {
                              ...defaultConfig,
                              widgets: [],
                            };
                            onConfigChange(updatedConfig);
                          }
                          // Force grid update
                          setTimeout(() => {
                            if (gridInstanceRef.current && gridInitialized) {
                              updateGridWithWidgets([], defaultConfig.layout);
                            }
                          }, 0);
                        }}
                      >
                        Select None
                      </Button>
                      {selectedView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (originalSavedState) {
                              setSelectedWidgets(originalSavedState.widgets);
                              if (onConfigChange) {
                                const updatedConfig = {
                                  ...defaultConfig,
                                  widgets: originalSavedState.widgets,
                                };
                                onConfigChange(updatedConfig);
                              }
                              // Force grid update
                              setTimeout(() => {
                                if (gridInstanceRef.current && gridInitialized) {
                                  updateGridWithWidgets(originalSavedState.widgets, defaultConfig.layout);
                                }
                              }, 0);
                            } else {
                              const savedView = configurations.find(
                                (v) => v.title === selectedView, // Changed to title
                              );
                              if (savedView) {
                                setSelectedWidgets(savedView.widgets);
                                if (onConfigChange) {
                                  const updatedConfig = {
                                    ...defaultConfig,
                                    widgets: savedView.widgets,
                                  };
                                  onConfigChange(updatedConfig);
                                }
                                // Force grid update
                                setTimeout(() => {
                                  if (gridInstanceRef.current && gridInitialized) {
                                    updateGridWithWidgets(savedView.widgets, defaultConfig.layout);
                                  }
                                }, 0);
                              }
                            }
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>

                  {showCategories ? (
                    <Tabs defaultValue="Income" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        {Object.keys(getWidgetsByCategory(availableWidgets)).map((category) => (
                          <TabsTrigger key={category} value={category}>
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {Object.entries(getWidgetsByCategory(availableWidgets)).map(([category, widgets]) => (
                        <TabsContent key={category} value={category}>
                          <ScrollArea className="h-[300px] pr-4">
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
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {availableWidgets.map((widget) => {
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
                  Object.keys(data).length === 0 &&
                  !error && (
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
          setSelectedView(null);
        }
        setShowSaveDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedView ? 'Edit Dashboard View' : 'Save Dashboard View'}
            </DialogTitle>
            <DialogDescription>
              {selectedView
                ? 'Update your dashboard layout and settings'
                : 'Save your current dashboard layout and settings'}
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
                {configurations.length === 0
                  ? 'This will be set as the default view'
                  : 'Set as default view'}
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

      <AlertDialog
        open={!!deleteViewId}
        onOpenChange={(open) => !open && setDeleteViewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              saved view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteViewId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteViewId && handleDeleteView(deleteViewId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}); 