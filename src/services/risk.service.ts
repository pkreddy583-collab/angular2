import { Injectable, signal } from '@angular/core';
import { Risk, RiskStatus } from '../models/risk.model';

const MOCK_RISKS: Risk[] = [
    { id: 'RISK-001', title: 'Single point of failure in payment gateway', status: 'Mitigation Plan', category: 'Operational', impact: 5, likelihood: 2, owner: 'SRE Team', dateIdentified: new Date('2025-07-01') },
    { id: 'RISK-002', title: 'Unpatched Log4j vulnerability on legacy server', status: 'Under Review', category: 'Security', impact: 5, likelihood: 4, owner: 'Security Ops', dateIdentified: new Date('2025-07-15') },
    { id: 'RISK-003', title: 'Lack of failover for core authentication database', status: 'New', category: 'Operational', impact: 4, likelihood: 2, owner: 'DBA Team', dateIdentified: new Date('2025-07-20') },
    { id: 'RISK-004', title: 'GDPR compliance gap in data archival process', status: 'Mitigation Plan', category: 'Compliance', impact: 3, likelihood: 3, owner: 'Legal', dateIdentified: new Date('2025-06-10') },
    { id: 'RISK-005', title: 'Cloud provider cost overrun potential', status: 'Accepted', category: 'Financial', impact: 2, likelihood: 4, owner: 'FinOps', dateIdentified: new Date('2025-05-20') },
    { id: 'RISK-006', title: 'No disaster recovery plan for HR Portal', status: 'New', category: 'Operational', impact: 3, likelihood: 2, owner: 'HR Systems', dateIdentified: new Date('2025-07-22') },
    { id: 'RISK-007', title: 'Expired service account credentials', status: 'Closed', category: 'Security', impact: 4, likelihood: 5, owner: 'Security Ops', dateIdentified: new Date('2025-07-05') },
];

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private _risks = signal<Risk[]>(MOCK_RISKS);
  
  getRisksByStatus(status: RiskStatus) {
    return this._risks().filter(r => r.status === status).sort((a,b) => (b.impact * b.likelihood) - (a.impact * a.likelihood));
  }
}
