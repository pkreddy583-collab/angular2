import { Frequency } from './tower-report.model';

export type FteCalculationModel = 'Average' | 'Median' | 'P75' | 'P90';

export interface MasterActivity {
  id: number;
  name: string;
  category: string; // e.g., 'Response', 'Proactive'
  defaultFrequency: Frequency;
  defaultHrsPerInstance: number;
}

export interface ActivitySuggestion {
  id: number;
  suggestedName: string;
  category: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string; // In a real app, this would be the logged-in user
  dateSubmitted: Date;
}

export interface SlaConfig {
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  value: number;
  unit: 'hours' | 'days';
  businessHoursOnly: boolean;
  description: string;
}

export interface SupportGroupConfig {
  l1: string;
  l2: string;
  l3: string;
}

export interface ApplicationSupportConfig {
  id: string;
  name: string;
  // Overrides for portfolio-level support groups.
  // If a property is undefined, it inherits from the portfolio.
  supportGroups?: Partial<SupportGroupConfig>;
}

export interface PortfolioSupportConfig {
  id: string;
  name: string;
  // Default support groups for all applications in this portfolio.
  supportGroups: SupportGroupConfig;
  applications: ApplicationSupportConfig[];
}