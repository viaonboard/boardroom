// Main component exports
export { DashboardWidget } from '../dashboard-widget';
export { BaseWidget } from './components/base-widget';
export { DynamicWidget } from './widgets/dynamic-widget';

// Type exports
export type {
    BaseWidgetProps, ChartSettings, DashboardConfig, DashboardView,
    DashboardWidgetProps, FilterConfig,
    FilterField,
    FilterValues, PropertyFilterParams,
    SavedFilter, WidgetConfig,
    WidgetData,
    WidgetProps
} from './types';

// Utility exports
export { cn } from './lib/utils';
