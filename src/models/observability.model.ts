export interface RecentError {
  timestamp: Date;
  message: string;
  traceId: string;
}

export interface ServiceJourneyStep {
  step: number;
  name: string;
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  avgTime: number;
  errorRate: number;
  p95Latency: number;
  apdexScore: number;
  recentErrors: RecentError[];
  latencyHistory: number[];
}

export interface ComplianceHistoryEntry {
  period: string;
  value: number;
}

export interface RelatedIncident {
  id: string;
  title: string;
  resolved: boolean;
  date: string;
}

export interface SlaComplianceDetail {
  name: string;
  current: number;
  limit: number;
  status: 'High' | 'Critical';
  complianceHistory: ComplianceHistoryEntry[];
  relatedIncidents: RelatedIncident[];
  aiInsight: string;
}