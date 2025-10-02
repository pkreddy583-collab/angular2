export interface ChangeKpi {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'same';
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  details: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  status: 'Awaiting Approval' | 'Scheduled' | 'Completed' | 'Rolled Back';
  risk: 'Low' | 'Medium' | 'High';
  requestedBy: string;
  application: string;
  deploymentDate: Date;
  validations: ValidationCheck[];
  aiRiskSummary: string;
}
