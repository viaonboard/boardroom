# Boardroom

**The Ultimate Open-Source Dashboard Builder for React Applications**

![image](https://github.com/user-attachments/assets/50010e17-c89c-48a1-9837-5f3c1c766816)

Boardroom is a powerful, open-source dashboard creation package for React and Next.js applications. Designed with flexibility and simplicity in mind, Boardroom enables developers to quickly create customizable, responsive dashboards tailored to their needs.

---

## 🎯 **Features**

### Open-Source Core (MIT License)
- **Dynamic Widget System**: Configure widgets through JSON configuration
- **Drag & Drop Layout**: Powered by GridStack for intuitive layout management
- **Multiple Chart Types**: Support for line, bar, pie charts and metrics
- **Fully Configurable**: Customize widgets, filters, and data sources
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark theme compatibility
- **Type Safe**: Built with TypeScript for better development experience
- **Real-time Data**: Support for live data updates
- **View Management**: Save and load dashboard configurations
- **Advanced Filtering**: Built-in filtering capabilities

### Pro Features (Private Repository)
**Planned 2025-2026**
- **Advanced Widgets**: Charts, graphs, and analytics powered by popular libraries.
- **Theming**: Advanced theming with a WYSIWYG editor.
- **Authentication**: Built-in user roles and permissions.
- **Data Persistence**: Backend integrations for saving user dashboards.
- **Premium Support**: Dedicated support and documentation.

---

## 🚀 **Getting Started**

### Prerequisites

- React 18+
- TypeScript 4.9+
- Node.js 16+

### Installation

Install the open-source package from npm:

```bash
npm install @boardroom/core
```

Or with Yarn:

```bash
yarn add @boardroom/core
```

### Install Dependencies

```bash
npm install gridstack react react-dom
npm install -D @types/react @types/react-dom
```

### Basic Usage

Here's how to get started with Boardroom:

```tsx
import React, { useState } from 'react';
import { DashboardWidget, WidgetConfig } from '@boardroom/core';
import { Clock, Users, TrendingUp } from 'lucide-react';

// Define your widget configurations
const widgetConfigs: WidgetConfig[] = [
  {
    id: 'velocity_trend',
    name: 'Average Days to Launch',
    category: 'Velocity',
    component: DynamicWidget,
    description: 'Average days to launch with trend over time',
    icon: Clock,
    defaultSettings: {
      type: 'line',
      color: '#3b82f6',
      formatType: 'decimal',
      showTrend: true,
    },
  },
  {
    id: 'active_customers',
    name: 'Active Customers',
    category: 'Customers',
    component: DynamicWidget,
    description: 'Number of active customers',
    icon: Users,
    defaultSettings: {
      type: 'bar',
      color: '#10b981',
      formatType: 'number',
      showTrend: false,
    },
  },
];

function MyDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFetchData = async (widgetIds: string[], filters: any) => {
    setLoading(true);
    try {
      // Fetch data from your API
      const response = await fetch('/api/dashboard-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetIds, filters }),
      });
      const widgetData = await response.json();
      setData(widgetData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardWidget
      widgetConfigs={widgetConfigs}
      onFetchData={handleFetchData}
      data={data}
      loading={loading}
      showFilters={true}
      showViewManagement={true}
      className="w-full h-full"
    />
  );
}
```

### Documentation

#### Directory Structure

```
src/
├── components/  # React components
├── hooks/       # Custom React hooks
├── lib/         # Utility functions and helpers
└── index.ts     # Main entry point
```

Full documentation for the open-source version is available [here](https://docs.onboard.io).

---

## 📚 **API Reference**

### DashboardWidget Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `widgetConfigs` | `WidgetConfig[]` | Yes | Array of widget configurations |
| `onFetchData` | `(widgetIds: string[], filters: any) => Promise<void>` | Yes | Function to fetch data for widgets |
| `data` | `Record<string, any>` | Yes | Widget data object |
| `loading` | `boolean` | No | Loading state |
| `showFilters` | `boolean` | No | Show filter controls |
| `showViewManagement` | `boolean` | No | Show view management controls |
| `className` | `string` | No | Additional CSS classes |

### WidgetConfig Type

```typescript
type WidgetConfig = {
  id: string;                    // Unique widget identifier
  name: string;                  // Display name
  category: string;              // Widget category for grouping
  component: React.ComponentType<WidgetProps>; // Widget component
  description?: string;          // Widget description
  icon?: React.ComponentType<{ className?: string }>; // Widget icon
  chartComponent?: React.ComponentType<{ data: any; settings?: ChartSettings }>; // Custom chart component
  defaultSettings?: ChartSettings; // Default chart settings
};
```

### ChartSettings Type

```typescript
type ChartSettings = {
  type: 'line' | 'pie' | 'bar';  // Chart type
  color: string;                 // Chart color
  showTrend?: boolean;           // Show trend indicator
  showChart?: boolean;           // Show chart visualization
  formatType?: 'currency' | 'percentage' | 'number' | 'decimal' | 'string'; // Data format
};
```

## 📊 **Data Format**

### Widget Data Structure

Each widget expects data in the following format:

```typescript
type WidgetData = {
  current: number;               // Current value
  previous?: number;             // Previous value for trend calculation
  change?: number;               // Percentage change
  trend?: 'up' | 'down' | 'neutral'; // Trend direction
  chartData?: Array<{            // Chart data points
    name: string;
    value: number;
  }>;
};
```

### API Data Converter

For onboarding KPIs, use the provided data converter:

```typescript
import { convertOnboardingApiDataToWidgetFormat } from './data-converter';

// Convert your API data to widget format
const widgetData = convertOnboardingApiDataToWidgetFormat(apiData);
```

## 🎨 **Customization**

### Creating Custom Widgets

```tsx
import React from 'react';
import { BaseWidget } from '@boardroom/core';

interface CustomWidgetProps {
  data?: any;
  settings?: ChartSettings;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({ data, settings }) => {
  return (
    <BaseWidget
      title="Custom Widget"
      value={data?.current || 0}
      trend={data?.trend}
      change={data?.change}
      formatType={settings?.formatType}
    >
      {/* Your custom chart or visualization */}
    </BaseWidget>
  );
};
```

### Custom Chart Components

```tsx
import React from 'react';
import { ChartSettings } from '@boardroom/core';

interface CustomChartProps {
  data: Array<{ name: string; value: number }>;
  settings?: ChartSettings;
}

export const CustomChart: React.FC<CustomChartProps> = ({ data, settings }) => {
  // Implement your custom chart using libraries like Recharts, Chart.js, etc.
  return (
    <div>
      {/* Your chart implementation */}
    </div>
  );
};
```

## 🎨 **Styling**

The component uses Tailwind CSS for styling. You can customize the appearance by:

1. **Theme Colors**: Override CSS variables for theme colors
2. **Custom Classes**: Pass additional classes via the `className` prop
3. **CSS Modules**: Import and override component styles

### Theme Customization

```css
:root {
  --dashboard-primary: #3b82f6;
  --dashboard-secondary: #10b981;
  --dashboard-accent: #f59e0b;
  --dashboard-danger: #ef4444;
}
```

## ⚡ **Advanced Features**

### View Management

The dashboard supports saving and loading different views:

```typescript
// Save current view
const handleSaveView = async (viewName: string, description?: string) => {
  const currentConfig = {
    title: viewName,
    description,
    widgets: selectedWidgets,
    layout: gridInstance.save(),
    chartSettings: savedChartSettings,
  };
  
  await saveDashboardView(currentConfig);
};

// Load saved view
const handleLoadView = async (viewId: string) => {
  const view = await loadDashboardView(viewId);
  setSelectedWidgets(view.widgets);
  setSavedLayout(view.layout);
  setSavedChartSettings(view.chartSettings);
};
```

### Filtering

Implement custom filters by extending the filter interface:

```typescript
interface CustomFilters {
  dateRange?: { from: Date; to: Date };
  categories?: string[];
  status?: string[];
  // Add your custom filter properties
}
```

### Real-time Updates

For real-time data updates, use WebSockets or Server-Sent Events:

```typescript
useEffect(() => {
  const eventSource = new EventSource('/api/dashboard-updates');
  
  eventSource.onmessage = (event) => {
    const updates = JSON.parse(event.data);
    setData(prevData => ({ ...prevData, ...updates }));
  };
  
  return () => eventSource.close();
}, []);
```

## 📖 **Examples**

### Basic Dashboard
See `examples/basic-usage.tsx` for a simple dashboard implementation.

### Onboarding KPIs Dashboard
See `examples/onboarding-kpis.tsx` for a comprehensive example using real onboarding metrics.

### Data Converter
See `examples/data-converter.ts` for API data transformation utilities.

## 🛠️ **Troubleshooting**

### Common Issues

1. **Widgets not rendering**: Ensure widget IDs match between config and data
2. **GridStack not initializing**: Check if GridStack CSS is imported
3. **Type errors**: Verify TypeScript types match your data structure
4. **Performance issues**: Use React.memo for widget components and optimize data fetching

### Debug Mode

Enable debug logging:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Dashboard Widget Debug:', {
    widgetConfigs,
    data,
    loading,
  });
}
```

## 💾 **Database Schema for Dashboard Configurations**

To enable saving/loading dashboard layouts and filters, add the following tables to your database (e.g., Supabase/Postgres):

### `dashboard_configs`

```sql
create table public.dashboard_configs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null, -- FK to accounts (personal or team)
  name text not null,
  config jsonb not null, -- stores the dashboard layout/settings
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dashboard_configs
  add constraint dashboard_configs_account_id_fkey
  foreign key (account_id) references public.accounts(id)
  on delete cascade;

alter table public.dashboard_configs enable row level security;

create policy "Account can access own dashboard configs"
  on public.dashboard_configs
  for all
  using (account_id = auth.uid());

create index on public.dashboard_configs (account_id);
```

### `dashboard_filters` (optional)

```sql
create table public.dashboard_filters (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  name text not null,
  filter jsonb not null, -- stores the filter settings
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dashboard_filters
  add constraint dashboard_filters_account_id_fkey
  foreign key (account_id) references public.accounts(id)
  on delete cascade;

alter table public.dashboard_filters enable row level security;

create policy "Account can access own dashboard filters"
  on public.dashboard_filters
  for all
  using (account_id = auth.uid());

create index on public.dashboard_filters (account_id);
```

**Security:**
- RLS ensures only the account owner/team can access their configs/filters.
- Foreign keys ensure data consistency.

**You can adapt these tables for any backend (Supabase, Postgres, etc.) as needed.**

---

## 💼 **Pro Version**

Unlock the full potential of Boardroom with the Pro version:

1. Advanced widgets for detailed analytics.
2. Backend support for persistence and authentication.
3. Priority support for your projects.

Interested? [Contact us](mailto:team@onboard.io) or visit [our website](https://onboard.io) for more information.

---

## 🛠️ **Contributing**

We welcome contributions from the community! Here's how you can get involved:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

Please read our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

---

## 📜 **License**

Boardroom's open-source core is licensed under the [MIT License](LICENSE). The Pro version is proprietary and requires a separate license.

---

## 🌟 **Community and Support**

- Follow us on [Twitter](https://twitter.com/boardroom).
- Explore our [Roadmap](https://github.com/viaonboard/boardroom/issues).

---

## ⭐ **Show Your Support**

If you find Boardroom helpful, please give us a star on GitHub! It helps us grow and reach more developers.

```bash
git clone https://github.com/viaonboard/boardroom
```

Happy building with **Boardroom**!

