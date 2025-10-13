export type RiskStatus = 'New' | 'Under Review' | 'Mitigation Plan' | 'Accepted' | 'Closed';

export interface Risk {
  id: string;
  title: string;
  status: RiskStatus;
  category: 'Security' | 'Operational' | 'Compliance' | 'Financial';
  impact: number; // 1-5
  likelihood: number; // 1-5
  owner: string;
  dateIdentified: Date;
}
