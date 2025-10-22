export interface L1SuggestedAction {
  text: string;
  done: boolean;
}

export interface L1RelevantKnowledge {
  id: string;
  title: string;
}

export interface L1TriageResult {
  summary: string;
  suggestedActions: L1SuggestedAction[];
  relevantKnowledge: L1RelevantKnowledge[];
  escalationPath: string | null;
  requiresChange: boolean;
  changeRequestDetails: {
    title: string;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
  } | null;
}
