export interface MajorIncidentKpi {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'same';
}

export interface IncidentTrendData {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface CausalAnalysisData {
  cause: string;
  percentage: number;
  color: string;
}

export interface KnowledgebaseEntry {
  id: string;
  title: string;
  cause: string;
  resolution: string;
  tags: string[];
}

export interface UnassessedIncident {
  id: string;
  title: string;
  description: string;
  aiSuggestedImpact: number;
  aiSuggestedUrgency: number;
}
