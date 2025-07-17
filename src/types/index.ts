
// Chart settings
export type ChartSettings = {
  type: 'line' | 'pie' | 'bar' | 'area';
  color: 'primary' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
  showTrend?: boolean;
  showChart?: boolean;
  formatType?: 'currency' | 'percentage' | 'number' | 'decimal' | 'string';
  mode?: 'metric' | 'graph';
};

// Widget props
export type WidgetProps = {
  mode?: 'view' | 'edit';
  type?: 'metric' | 'graph';
  onTypeChange?: (type: 'metric' | 'graph') => void;
  onSettingsChange?: (settings: ChartSettings) => void;
  settings?: ChartSettings;
  data?: any; // Changed from WidgetData to any to support different data structures
  title?: string;
  className?: string;
  config?: WidgetConfig;
  chartSettings?: ChartSettings;
  onChartSettingsChange?: (settings: ChartSettings) => void;
  valueFormatter?: {
    style: 'currency' | 'percent' | 'decimal';
    currency?: string;
    notation?: 'compact' | 'standard';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
};

// Widget configuration
export type WidgetConfig = {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType<any>;
  description?: string;
  defaultSettings?: ChartSettings;
};

// Widget data structure
export type WidgetData = {
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

// Dashboard configuration
export type DashboardConfig = {
  title: string;
  description?: string;
  dateRange: {
    from: string;
    to: string | null;
  };
  widgets: string[];
  layout: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    id: string;
  }>;
  chartSettings?: Record<string, ChartSettings>;
};

// Property filter parameters
export type PropertyFilterParams = {
  accountSlug: string;
  dealType?: string[];
  propertyType?: string[];
  propertyClass?: string[];
  amenities?: string[];
  zoning?: string[];
};

// Dashboard view
export type DashboardView = {
  id: string;
  name: string;
  description: string | undefined;
  type: 'primary' | 'property' | 'investor' | 'custom';
  is_default: boolean;
  configuration: DashboardConfig;
  account_id: string;
  created_at: string | undefined;
  created_by: string | undefined;
  updated_at: string | undefined;
  updated_by: string | undefined;
};

// Filter configuration
export type FilterConfig = {
  id: string;
  name: string;
  type: 'property' | 'contact' | 'custom';
  fields: FilterField[];
  defaultValues?: Record<string, any>;
};

// Filter field definition
export type FilterField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'daterange' | 'checkbox' | 'radio';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
};

// Filter values
export type FilterValues = Record<string, any>;

// Saved filter
export type SavedFilter = {
  id: string;
  name: string;
  description?: string;
  filters: PropertyFilterParams;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Dashboard widget props
export type DashboardWidgetProps = {
  // Core props
  accountId: string;
  dashboardType?: 'primary' | 'property' | 'investor' | 'custom';
  
  // Configuration
  widgetConfigs: WidgetConfig[];
  filterConfigs?: FilterConfig[];
  
  // Data providers
  onFetchData?: (widgetIds: string[], filters: FilterValues) => Promise<Record<string, WidgetData>>;
  onSaveView?: (view: Omit<DashboardView, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>) => Promise<DashboardView>;
  onLoadViews?: (accountId: string, type: string) => Promise<DashboardView[]>;
  onUpdateView?: (id: string, view: Partial<DashboardView>) => Promise<DashboardView>;
  onDeleteView?: (id: string) => Promise<void>;
  
  // Filter management
  onSaveFilter?: (name: string, filters: FilterValues, type: string) => Promise<SavedFilter>;
  onLoadSavedFilters?: (accountId: string, type: string) => Promise<SavedFilter[]>;
  onUpdateFilter?: (id: string, name: string, filters: FilterValues) => Promise<SavedFilter>;
  onDeleteFilter?: (id: string) => Promise<void>;
  
  // UI customization
  className?: string;
  showFilters?: boolean;
  showViewManagement?: boolean;
  showWidgetSelector?: boolean;
  showDateRange?: boolean;
  
  // Callbacks
  onFiltersChange?: (filters: FilterValues) => void;
  onViewChange?: (view: DashboardView) => void;
  onWidgetToggle?: (widgetId: string, enabled: boolean) => void;
  
  // Styling
  theme?: 'light' | 'dark';
  gridOptions?: {
    column?: number;
    cellHeight?: number;
    margin?: string;
    disableOneColumnMode?: boolean;
  };
};

// Base widget props for internal use
export type BaseWidgetProps = {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  description?: string;
  className?: string;
  mode?: 'edit' | 'view';
  type?: 'metric' | 'graph';
  graphComponent?: React.ReactNode;
  onSettingsChange?: (settings: ChartSettings) => void;
  settings?: ChartSettings;
}; 