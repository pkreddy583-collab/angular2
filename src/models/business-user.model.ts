export interface BusinessService {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Outage';
  businessImpact: string | null;
}
