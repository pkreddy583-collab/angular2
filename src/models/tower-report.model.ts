export interface TicketDrivenWorkItem {
  id: number;
  category: string;
  priority: string;
  count: number;
  avgTime: number; // in minutes
  p50Time?: number; // Median time
  p75Time?: number; // 75th percentile time
  p90Time?: number; // 90th percentile time
  countHistory?: number[]; // for sparkline trend
  previousCount?: number;
  previousAvgTime?: number;
  adjustmentPct?: number | null; // Row-level adjustment override
}

export type Frequency = 'Ad-hoc' | 'Weekly' | 'Monthly' | 'Bi-Weekly' | 'Sprint';

export interface StructuredActivityItem {
  id: number;
  activityName: string;
  frequency: Frequency;
  instances: number;
  hrsPerInstance: number;
  previousInstances?: number;
  previousHrsPerInstance?: number;
  adjustmentPct?: number | null; // Row-level adjustment override
}

export interface StructuredActivityCategory {
  name: string;
  items: StructuredActivityItem[];
}

export interface ReportData {
  floatingFte: {
    total: number;
    deployed: number;
  };
  computeTower: {
    name: string;
    subName: string;
    contractualFte: number;
    staffingVsContract: number;
  };
  ticketDrivenWork: {
    managerAdjustment: number; // percentage
    items: TicketDrivenWorkItem[];
  };
  structuredActivities: StructuredActivityCategory[];
  finalWorkload: {
    actualDeployedFte: number;
  };
}
