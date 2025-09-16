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