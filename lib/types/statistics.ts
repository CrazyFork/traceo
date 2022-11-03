export interface AppStats {
  total: {
    incidentsCount: number;
    errorsCount: number;
    lastWeek: number;
  };
}

export interface HourlyStats {
  date: number;
  count: number;
}

export interface PlotData {
  date: number;
  count: number;
}

export interface DashboardStats {
  apps: {
    owner: number;
  };
  incidents: number;
}
