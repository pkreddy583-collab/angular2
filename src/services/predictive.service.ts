import { Injectable, signal } from '@angular/core';
import { PredictiveModel } from '../models/predictive.model';

@Injectable({
  providedIn: 'root',
})
export class PredictiveService {
  private _predictiveModels = signal<PredictiveModel[]>([
    {
      id: 'incident-volume',
      name: 'Predict Incident Volume',
      description: 'Forecast the number and severity of incidents for a specific service over the next 7 days.',
      inputLabel: 'Select Service',
      inputOptions: [
        'User Authentication',
        'Payment Gateway',
        'HR Portal',
        'All Production Services',
      ],
    },
    {
      id: 'sla-breach-risk',
      name: 'Predict SLA Breach Risk',
      description: 'Assess the likelihood of a high-priority incident breaching its SLA based on current trends and complexity.',
      inputLabel: 'Select High-Priority Incident',
      inputOptions: [
        'INC-001: Production server unresponsive',
        'INC-002: Database connection pool exhausted',
        'INC-006: SSL certificate renewal failure',
      ],
    },
    {
      id: 'fte-demand',
      name: 'Forecast FTE Demand',
      description: 'Predict the required FTE for an operational tower for the next quarter based on historical workload and upcoming projects.',
      inputLabel: 'Select Tower',
      inputOptions: ['Compute', 'Storage', 'Network', 'Database', 'Applications'],
    },
    {
      id: 'change-failure-rate',
      name: 'Predict Change Failure Rate',
      description: 'Estimate the probability of a deployment causing a production incident for a specific application.',
      inputLabel: 'Select Application',
      inputOptions: ['Enrollment Hub', 'Public Website', 'Reporting Service'],
    },
  ]);

  getPredictiveModels() {
    return this._predictiveModels.asReadonly();
  }
}
