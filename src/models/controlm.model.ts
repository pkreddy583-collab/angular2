export interface ControlMJob {
  id: string;
  name: string;
  application: string;
  status: 'Failed'; // For this workbench, we only care about failed jobs
  startTime: Date;
  endTime: Date;
  errorMessage: string;
  logOutput: string;
}

export interface AiSuggestion {
  title: string;
  description: string;
  actionType: 'rerun' | 'investigate' | 'escalate' | 'info';
}
