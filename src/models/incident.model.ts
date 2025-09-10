export interface Incident {
  id: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  assignedTo: string;
  createdDate: Date;
  slaBreachDate: Date;
  description: string;
  affectedServices: string[];
  lastUpdate: string;
}