import { Injectable, signal } from '@angular/core';
import { AiRoiKpis, SavingsDataPoint, ContributionDataPoint, AiActionLog } from '../models/ai-roi.model';

@Injectable({
  providedIn: 'root',
})
export class AiRoiService {

  private kpis = signal<AiRoiKpis>({
    totalCostSavings: 12540,
    totalTimeSavedHours: 250.8,
    automatedResolutions: 78,
  });

  private costSavingsHistory = signal<SavingsDataPoint[]>([
    { date: '2025-07-01', savings: 300 },
    { date: '2025-07-02', savings: 450 },
    { date: '2025-07-03', savings: 420 },
    { date: '2025-07-04', savings: 510 },
    { date: '2025-07-05', savings: 600 },
    { date: '2025-07-06', savings: 550 },
    { date: '2025-07-07', savings: 700 },
  ]);

  private featureContributions = signal<ContributionDataPoint[]>([
    { feature: 'Incident Gist', actions: 150 },
    { feature: 'Handover Summary', actions: 45 },
    { feature: 'RCA Suggestion', actions: 80 },
    { feature: 'Automated Remediation', actions: 78 },
  ]);

  private actionLog = signal<AiActionLog[]>([
    { id: 'log-1', timestamp: new Date(), feature: 'Handover Summary', description: 'Generated EOD summary for Core Services portfolio.', timeSavedMinutes: 15, costSaved: 12.50 },
    { id: 'log-2', timestamp: new Date(Date.now() - 30 * 60 * 1000), feature: 'Incident Gist', description: 'Generated gist for INC-001.', timeSavedMinutes: 5, costSaved: 4.17 },
    { id: 'log-3', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), feature: 'Automated Remediation', description: 'Applied self-heal script for "DB connection pool" error.', timeSavedMinutes: 45, costSaved: 37.50 },
    { id: 'log-4', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), feature: 'RCA Suggestion', description: 'Provided relevant KB article for INC-003.', timeSavedMinutes: 20, costSaved: 16.67 },
    { id: 'log-5', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), feature: 'Incident Gist', description: 'Generated gist for INC-002.', timeSavedMinutes: 5, costSaved: 4.17 },
  ]);

  getKpis() {
    return this.kpis.asReadonly();
  }

  getCostSavingsHistory() {
    return this.costSavingsHistory.asReadonly();
  }

  getFeatureContributions() {
    return this.featureContributions.asReadonly();
  }

  getActionLog() {
    return this.actionLog.asReadonly();
  }
}
