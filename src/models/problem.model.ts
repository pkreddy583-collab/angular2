export interface Problem {
  id: string; // e.g., PRB-001
  title: string;
  status: 'Backlog' | 'Investigation' | 'Resolved';
  owner: string;
  linkedIncidents: string[]; // Array of incident IDs like 'INC-001'
  createdDate: Date;
  rcaSummary?: string;
  investigationNotes?: { timestamp: Date; note: string }[];
}
