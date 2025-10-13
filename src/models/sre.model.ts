export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface LiveMetrics {
  latency: MetricDataPoint[];
  errorRate: MetricDataPoint[];
  cpu: MetricDataPoint[];
  memory: MetricDataPoint[];
}

export interface SSLCertificate {
  domain: string;
  issuer: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  status: 'Valid' | 'Expires Soon' | 'Expired';
}

export interface Deployment {
  id: number;
  timestamp: Date;
  author: string;
  status: 'Success' | 'Failed';
}

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  service: string;
}

export interface WebApp {
  id: string;
  name: string;
  businessCriticality: 'Tier 1' | 'Tier 2' | 'Tier 3';
  healthStatus: 'Healthy' | 'Warning' | 'Critical';
  apdex: number;
  errorRate: number;
  p95Latency: number;
  cpuUtilization: number;
  memUtilization: number;
  metrics: LiveMetrics;
  certificates: SSLCertificate[];
  deployments: Deployment[];
  logs: LogEntry[];
  slo: {
    availability: number;
    latency: number;
    availabilityTrend: 'up' | 'down' | 'same';
    latencyTrend: 'up' | 'down' | 'same';
  };
}

export interface AiInsight {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SreInvestigation {
  id: string;
  title: string;
  appId: string;
  appName: string;
  status: 'Active' | 'Warning' | 'Critical';
  timestamp: Date;
}
