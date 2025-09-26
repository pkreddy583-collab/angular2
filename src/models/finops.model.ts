export interface FinOpsApp {
  id: string;
  name: string;
  totalCost: number;
  costBreakdown: {
    compute: number;
    storage: number;
    network: number;
  };
  metrics: {
    avgCpu: number;
    provisionedVcpu: number;
    unattachedDisks: number;
  };
}

export interface SavingsOpportunity {
  type: 'Rightsizing' | 'Unused Resources' | 'Storage Tiering';
  description: string;
  estimatedMonthlySavings: number;
}
