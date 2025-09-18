export interface AiRoiKpis {
  totalCostSavings: number;
  totalTimeSavedHours: number;
  automatedResolutions: number;
}

export interface SavingsDataPoint {
  date: string; // YYYY-MM-DD
  savings: number;
}

export interface ContributionDataPoint {
  feature: string;
  actions: number;
}

export interface AiActionLog {
  id: string;
  timestamp: Date;
  feature: string;
  description: string;
  timeSavedMinutes: number;
  costSaved: number;
}
