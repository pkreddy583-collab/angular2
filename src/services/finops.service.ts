import { Injectable, signal } from '@angular/core';
import { FinOpsApp } from '../models/finops.model';

const MOCK_FINOPS_APPS: FinOpsApp[] = [
  {
    id: 'app1',
    name: 'Reporting Service',
    totalCost: 1250,
    costBreakdown: { compute: 900, storage: 300, network: 50 },
    metrics: { avgCpu: 10, provisionedVcpu: 16, unattachedDisks: 0 }
  },
  {
    id: 'app2',
    name: 'Legacy Monolith',
    totalCost: 4800,
    costBreakdown: { compute: 3500, storage: 1200, network: 100 },
    metrics: { avgCpu: 45, provisionedVcpu: 64, unattachedDisks: 3 }
  },
  {
    id: 'app3',
    name: 'Data Ingestion Pipeline',
    totalCost: 850,
    costBreakdown: { compute: 600, storage: 200, network: 50 },
    metrics: { avgCpu: 85, provisionedVcpu: 8, unattachedDisks: 0 }
  }
].sort((a,b) => b.totalCost - a.totalCost);

@Injectable({
  providedIn: 'root'
})
export class FinopsService {
  private _finopsApps = signal<FinOpsApp[]>(MOCK_FINOPS_APPS);
  
  getFinOpsApps() {
    return this._finopsApps.asReadonly();
  }
}
