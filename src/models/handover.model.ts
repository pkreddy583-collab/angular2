import { Incident } from './incident.model';

export type PortfolioHealth = 'Healthy' | 'Warning' | 'Critical';

export interface Portfolio {
  id: string;
  name: string;
  services: string[];
  health: PortfolioHealth;
}

export interface HandoverNotes {
  onshoreToOffshore: string;
  offshoreToOnshore: string;
  incidentGists: { [incidentId: string]: string };
}

export interface ManagerFeedback {
  rating: number; // 0-5 stars
  comment: string;
}

export interface HistoricalHandover {
  id: string; // e.g., 'portfolio-1-2023-10-27'
  date: string; // ISO string date YYYY-MM-DD
  portfolioId: string;
  portfolioName: string;
  portfolioHealth: PortfolioHealth;
  notes: HandoverNotes;
  incidents: Incident[];
  feedback: ManagerFeedback;
}

export interface EmailTemplate {
  to: string;
  cc: string;
  subject: string; // e.g., "EOD Handover: {{portfolioName}} - {{date}}"
}
