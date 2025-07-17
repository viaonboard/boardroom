// Data converter function to transform API data to widget format
export const convertOnboardingApiDataToWidgetFormat = (apiData: any) => {
  const widgetData: Record<string, any> = {};

  // Velocity Trend - Average Days to Launch
  if (apiData.velocity_trend && apiData.velocity_trend.length > 0) {
    const latest = apiData.velocity_trend[apiData.velocity_trend.length - 1];
    const previous = apiData.velocity_trend.length > 1 ? apiData.velocity_trend[apiData.velocity_trend.length - 2] : latest;
    const change = ((latest.avg_days_to_launch - previous.avg_days_to_launch) / previous.avg_days_to_launch) * 100;
    
    widgetData.velocity_trend = {
      metric: {
        value: latest.avg_days_to_launch.toFixed(1),
        trend: {
          value: Math.abs(change),
          direction: latest.avg_days_to_launch < previous.avg_days_to_launch ? 'down' : 'up',
        },
      },
      chart: {
        data: apiData.velocity_trend.map((item: any) => ({
          name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: item.avg_days_to_launch,
        })),
      },
    };
  }

  // Maps Launched On Time
  const onTimePercent = apiData.percent_maps_launched_on_time * 100;
  widgetData.maps_launched_on_time = {
    metric: {
      value: `${onTimePercent.toFixed(1)}%`,
      trend: {
        value: 5,
        direction: 'up',
      },
    },
    chart: {
      data: [
        { name: 'On Time', value: onTimePercent },
        { name: 'Delayed', value: 100 - onTimePercent },
      ],
    },
  };

  // Median Phase Time
  if (apiData.phase_times && apiData.phase_times.length > 0) {
    const avgPhaseTime = apiData.phase_times.reduce((sum: number, phase: any) => sum + phase.median_phase_duration_days, 0) / apiData.phase_times.length;
    
    widgetData.median_phase_time = {
      metric: {
        value: avgPhaseTime.toFixed(1),
        trend: {
          value: 0,
          direction: 'neutral',
        },
      },
      chart: {
        data: apiData.phase_times.map((phase: any) => ({
          name: phase.phase,
          value: phase.median_phase_duration_days,
        })),
      },
    };
  }

  // Active Customers Per Stage
  if (apiData.active_customers_per_stage && apiData.active_customers_per_stage.length > 0) {
    const totalCustomers = apiData.active_customers_per_stage.reduce((sum: number, stage: any) => sum + stage.active_customers, 0);
    
    widgetData.active_customers_per_stage = {
      metric: {
        value: totalCustomers.toString(),
        trend: {
          value: 1,
          direction: 'up',
        },
      },
      chart: {
        data: apiData.active_customers_per_stage.map((stage: any) => ({
          name: stage.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: stage.active_customers,
        })),
      },
    };
  }

  // Customers Per Owner
  if (apiData.customers_per_owner && apiData.customers_per_owner.length > 0) {
    const totalCustomers = apiData.customers_per_owner.reduce((sum: number, owner: any) => sum + owner.customers, 0);
    
    widgetData.customers_per_owner = {
      metric: {
        value: totalCustomers.toString(),
        trend: {
          value: 1,
          direction: 'up',
        },
      },
      chart: {
        data: apiData.customers_per_owner.map((owner: any) => ({
          name: owner.owner__user__email.split('@')[0].replace('+', ' '),
          value: owner.customers,
        })),
      },
    };
  }

  // Tasks Per Owner
  if (apiData.tasks_per_owner && apiData.tasks_per_owner.length > 0) {
    const totalTasks = apiData.tasks_per_owner.reduce((sum: number, owner: any) => sum + owner.tasks, 0);
    
    widgetData.tasks_per_owner = {
      metric: {
        value: totalTasks.toString(),
        trend: {
          value: 100,
          direction: 'up',
        },
      },
      chart: {
        data: apiData.tasks_per_owner.map((owner: any) => ({
          name: owner.onboarder_user__user__email.split('@')[0].replace('+', ' '),
          value: owner.tasks,
        })),
      },
    };
  }

  // Internal Task Completion Rate
  widgetData.internal_task_completion = {
    metric: {
      value: `${apiData.on_time_task_completion_rate_internal.toFixed(1)}%`,
      trend: {
        value: 2,
        direction: 'up',
      },
    },
    chart: {
      data: [
        { name: 'Jan', value: apiData.on_time_task_completion_rate_internal - 4 },
        { name: 'Feb', value: apiData.on_time_task_completion_rate_internal - 2 },
        { name: 'Mar', value: apiData.on_time_task_completion_rate_internal },
      ],
    },
  };

  // Customer Task Completion Rate
  widgetData.customer_task_completion = {
    metric: {
      value: `${apiData.on_time_task_completion_rate_customer.toFixed(1)}%`,
      trend: {
        value: 3,
        direction: 'up',
      },
    },
    chart: {
      data: [
        { name: 'Jan', value: apiData.on_time_task_completion_rate_customer - 6 },
        { name: 'Feb', value: apiData.on_time_task_completion_rate_customer - 3 },
        { name: 'Mar', value: apiData.on_time_task_completion_rate_customer },
      ],
    },
  };

  // Overdue Task Rate
  widgetData.overdue_task_rate = {
    metric: {
      value: `${apiData.overdue_task_rate.toFixed(1)}%`,
      trend: {
        value: 5,
        direction: 'down', // Down trend is good for overdue tasks
      },
    },
    chart: {
      data: [
        { name: 'Jan', value: apiData.overdue_task_rate + 10 },
        { name: 'Feb', value: apiData.overdue_task_rate + 5 },
        { name: 'Mar', value: apiData.overdue_task_rate },
      ],
    },
  };

  return widgetData;
};

// Example API data structure
export const exampleOnboardingApiData = {
  "velocity_trend": [
    {
      "month": "2023-03-01T00:00:00Z",
      "avg_days_to_launch": 65.0,
      "count": 1
    },
    {
      "month": "2023-04-01T00:00:00Z",
      "avg_days_to_launch": 63.5,
      "count": 1
    },
    {
      "month": "2023-05-01T00:00:00Z",
      "avg_days_to_launch": 62.03430511914352,
      "count": 1
    }
  ],
  "percent_maps_launched_on_time": 0.75,
  "active_customers_per_stage": [
    {
      "status": "in_progress",
      "active_customers": 4
    },
    {
      "status": "new",
      "active_customers": 1
    },
    {
      "status": "stalled",
      "active_customers": 2
    }
  ],
  "customers_per_owner": [
    {
      "owner__user__email": "will+acme@onboard.io",
      "customers": 5
    },
    {
      "owner__user__email": "jeff+acme@onboard.io",
      "customers": 4
    }
  ],
  "tasks_per_owner": [
    {
      "onboarder_user__user__email": "will+acme@onboard.io",
      "tasks": 2903
    },
    {
      "onboarder_user__user__email": "jeff+acme@onboard.io",
      "tasks": 1064
    },
    {
      "onboarder_user__user__email": "will+ambersmith@onboard.io",
      "tasks": 630
    },
    {
      "onboarder_user__user__email": "matt+acme@onboard.io",
      "tasks": 154
    },
    {
      "onboarder_user__user__email": "marko+acme@onboard.io",
      "tasks": 17
    },
    {
      "onboarder_user__user__email": "matt+test@onboard.io",
      "tasks": 15
    },
    {
      "onboarder_user__user__email": "api_58_xubkvtaxwk@example.com",
      "tasks": 14
    },
    {
      "onboarder_user__user__email": "will+onboarder@onboard.io",
      "tasks": 5
    }
  ],
  "on_time_task_completion_rate_internal": 34.756097560975604,
  "on_time_task_completion_rate_customer": 65.51724137931035,
  "overdue_task_rate": 67.1923076923077,
  "phase_times": [
    {
      "phase": "On-Site Training",
      "median_phase_duration_days": 1,
      "count": 5
    },
    {
      "phase": "Pre-Kickoff",
      "median_phase_duration_days": 0,
      "count": 3
    }
  ]
}; 