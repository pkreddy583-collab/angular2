export interface TimelineEvent {
  time: string; // ISO 8601 format
  description: string;
}

export interface ActionItem {
  description: string;
  owner: string; // e.g., 'SRE Team'
  status: 'Not Started' | 'In Progress' | 'Done';
}

export interface PostmortemReport {
  incidentId: string;
  incidentTitle: string;
  timeline: TimelineEvent[];
  rootCauseAnalysis: string;
  actionItems: ActionItem[];
  executiveSummary: string;
}
