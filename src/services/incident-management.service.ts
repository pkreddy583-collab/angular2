import { Injectable, signal } from '@angular/core';
import {
  MajorIncidentKpi,
  IncidentTrendData,
  CausalAnalysisData,
  KnowledgebaseEntry,
  UnassessedIncident,
} from '../models/incident-management.model';

@Injectable({
  providedIn: 'root',
})
export class IncidentManagementService {
  private _kpis = signal<MajorIncidentKpi[]>([
    { label: 'Total Major Incidents (30d)', value: '42', trend: '+5%', trendDirection: 'up' },
    { label: 'Avg. MTTR (Major)', value: '4.2 Hrs', trend: '-10%', trendDirection: 'down' },
    { label: 'Major Incident SLA', value: '96.5%', trend: '+1.2%', trendDirection: 'up' },
  ]);

  private _incidentTrend = signal<IncidentTrendData[]>(
    Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + (i % 7 === 0 ? 3 : 1), // Spike on weekends
      };
    })
  );

  private _causalAnalysis = signal<CausalAnalysisData[]>([
    { cause: 'Change Failure', percentage: 45, color: '#ef4444' },
    { cause: 'Hardware Failure', percentage: 25, color: '#f97316' },
    { cause: 'Database Contention', percentage: 15, color: '#eab308' },
    { cause: 'Monitoring Gap', percentage: 10, color: '#8b5cf6' },
    { cause: 'Other', percentage: 5, color: '#6b7280' },
  ]);

  private _knowledgebase = signal<KnowledgebaseEntry[]>([
    { id: 'KB001', title: 'Database connection pool exhausted', cause: 'Runaway query from reporting service', resolution: 'Increased pool size temporarily. Optimized the reporting query and added resource limits.', tags: ['database', 'p1', 'contention'] },
    { id: 'KB002', title: 'Production server unresponsive after deployment', cause: 'Memory leak in v1.2.3 of the caching service', resolution: 'Rolled back deployment to v1.2.2. Patched memory leak in v1.2.4 and redeployed.', tags: ['change-failure', 'memory-leak', 'p1'] },
    { id: 'KB003', title: 'SSL certificate renewal failure', cause: 'Automated renewal script failed due to expired API key', resolution: 'Manually renewed and deployed the certificate. Updated the API key in the vault and tested the automation.', tags: ['ssl', 'automation', 'p1'] },
  ]);
  
  private _unassessedIncidents = signal<UnassessedIncident[]>([
    { id: 'INC-201', title: 'API Gateway returning 503 errors', description: 'Users are reporting intermittent 503 Service Unavailable errors when accessing the main API gateway.', aiSuggestedImpact: 1, aiSuggestedUrgency: 1 },
    { id: 'INC-202', title: 'Batch processing job "NIGHTLY_FINANCE" failing', description: 'The nightly finance batch job has failed to complete for the last 3 hours.', aiSuggestedImpact: 2, aiSuggestedUrgency: 2 },
    { id: 'INC-203', title: 'Slow performance on HR Portal', description: 'Employees are reporting the HR portal is slow when accessing payroll information.', aiSuggestedImpact: 3, aiSuggestedUrgency: 3 },
  ]);

  getKpis() { return this._kpis.asReadonly(); }
  getIncidentTrend() { return this._incidentTrend.asReadonly(); }
  getCausalAnalysis() { return this._causalAnalysis.asReadonly(); }
  getKnowledgebase() { return this._knowledgebase.asReadonly(); }
  getUnassessedIncidents() { return this._unassessedIncidents.asReadonly(); }
}
