import { Injectable, signal } from '@angular/core';
import { ServiceJourneyStep, SlaComplianceDetail } from '../models/observability.model';

export interface VmUtilization {
  name: string;
  cpu: number;
  memory: number;
  disk: number;
}

@Injectable({
  providedIn: 'root',
})
export class ObservabilityDataService {
  private journeySteps = signal<ServiceJourneyStep[]>([
     {
      step: 1,
      name: 'Login to Enrollment Hub application',
      service: 'Medicare Service',
      status: 'healthy' as const,
      avgTime: 850,
      errorRate: 0.5,
      p95Latency: 1100,
      apdexScore: 0.98,
      recentErrors: [],
      latencyHistory: [850, 860, 840, 855, 830, 870, 850, 845, 865, 850],
    },
    {
      step: 2,
      name: 'Validate the User',
      service: 'Web Server Health',
      status: 'healthy' as const,
      avgTime: 1200,
      errorRate: 1.2,
      p95Latency: 1500,
      apdexScore: 0.95,
      recentErrors: [
        { timestamp: new Date(Date.now() - 3600000), message: 'Invalid token format', traceId: 'abc-789' }
      ],
      latencyHistory: [1200, 1210, 1190, 1205, 1220, 1180, 1200, 1215, 1195, 1200],
    },
    {
      step: 3,
      name: 'Populate Zipcode for the agents',
      service: 'DB Server Health',
      status: 'warning' as const,
      avgTime: 2600,
      errorRate: 2.1,
      p95Latency: 3200,
      apdexScore: 0.88,
      recentErrors: [
        { timestamp: new Date(Date.now() - 7200000), message: 'Slow query detected', traceId: 'def-456' }
      ],
      latencyHistory: [2500, 2650, 2580, 2610, 2700, 2550, 2600, 2620, 2680, 2600],
    },
    {
      step: 4,
      name: 'Plan Enrollment',
      service: 'Medicare Service',
      status: 'healthy' as const,
      avgTime: 1650,
      errorRate: 0.8,
      p95Latency: 1900,
      apdexScore: 0.97,
      recentErrors: [],
      latencyHistory: [1650, 1670, 1640, 1660, 1630, 1680, 1650, 1655, 1665, 1650],
    },
    {
      step: 5,
      name: 'Load Application Form',
      service: 'Web Server Health',
      status: 'healthy' as const,
      avgTime: 3200,
      errorRate: 1.5,
      p95Latency: 3800,
      apdexScore: 0.92,
      recentErrors: [],
      latencyHistory: [3100, 3250, 3180, 3210, 3300, 3050, 3200, 3220, 3280, 3200],
    },
    {
      step: 6,
      name: 'PCP Finder Lookup',
      service: 'DB Server Health',
      status: 'critical' as const,
      avgTime: 4500,
      errorRate: 3.2,
      p95Latency: 5800,
      apdexScore: 0.75,
      recentErrors: [
        { timestamp: new Date(Date.now() - 600000), message: 'Query timeout exception', traceId: 'xyz-123' },
        { timestamp: new Date(Date.now() - 1200000), message: 'Connection reset by peer', traceId: 'xyz-456' }
      ],
      latencyHistory: [4400, 4550, 4480, 4510, 4600, 4350, 4500, 4520, 4580, 4500],
    },
    {
      step: 7,
      name: 'Credit Card Validation',
      service: 'Payment Gateway',
      status: 'critical' as const,
      avgTime: 6800,
      errorRate: 4.1,
      p95Latency: 8200,
      apdexScore: 0.68,
      recentErrors: [
        { timestamp: new Date(Date.now() - 300000), message: 'Gateway timeout (504)', traceId: 'ghi-789' },
        { timestamp: new Date(Date.now() - 900000), message: 'Invalid card number', traceId: 'jkl-012' },
        { timestamp: new Date(Date.now() - 1500000), message: 'API key limit reached', traceId: 'mno-345' }
      ],
      latencyHistory: [6700, 6850, 6780, 6810, 6900, 6650, 6800, 6820, 6880, 6800],
    },
  ]);

  private slaDetails = signal<SlaComplianceDetail[]>([
    {
      name: 'Login to Enrollment Hub application',
      current: 850,
      limit: 2000,
      status: 'High' as const,
      complianceHistory: [
        { period: 'T-6d', value: 99.98 },
        { period: 'T-5d', value: 99.95 },
        { period: 'T-4d', value: 99.99 },
        { period: 'T-3d', value: 99.97 },
        { period: 'T-2d', value: 99.98 },
        { period: 'T-1d', value: 99.96 },
        { period: 'Today', value: 99.99 },
      ],
      relatedIncidents: [
        { id: 'INC-101', title: 'Brief latency spike on login service', resolved: true, date: '3 days ago' },
      ],
      aiInsight: 'Performance is stable with minor fluctuations. Proactive monitoring of authentication response times is recommended during peak hours.'
    },
    {
      name: 'Validate the User',
      current: 1200,
      limit: 3000,
      status: 'Critical' as const,
      complianceHistory: [
        { period: 'T-6d', value: 99.80 },
        { period: 'T-5d', value: 99.85 },
        { period: 'T-4d', value: 99.75 },
        { period: 'T-3d', value: 99.82 },
        { period: 'T-2d', value: 99.78 },
        { period: 'T-1d', value: 99.81 },
        { period: 'Today', value: 99.79 },
      ],
      relatedIncidents: [],
      aiInsight: 'Consistently high latency, though within SLA. The P95 latency is approaching the threshold. Investigate downstream dependencies for optimization opportunities.'
    },
    {
      name: 'Populate Zipcode for the agents',
      current: 2800,
      limit: 5000,
      status: 'Critical' as const,
      complianceHistory: [
        { period: 'T-6d', value: 99.50 },
        { period: 'T-5d', value: 99.60 },
        { period: 'T-4d', value: 99.40 },
        { period: 'T-3d', value: 99.30 },
        { period: 'T-2d', value: 99.55 },
        { period: 'T-1d', value: 99.20 },
        { period: 'Today', value: 99.25 },
      ],
      relatedIncidents: [
        { id: 'INC-098', title: 'Database query timeout for zipcode lookup', resolved: false, date: '1 day ago' }
      ],
      aiInsight: 'SLA compliance is trending downwards. The active incident is likely the root cause. Prioritize resolution of INC-098 to prevent an SLA breach.'
    },
    {
      name: 'Plan Enrollment',
      current: 1650,
      limit: 5000,
      status: 'High' as const,
      complianceHistory: [
        { period: 'T-6d', value: 99.95 },
        { period: 'T-5d', value: 99.96 },
        { period: 'T-4d', value: 99.94 },
        { period: 'T-3d', value: 99.97 },
        { period: 'T-2d', value: 99.95 },
        { period: 'T-1d', value: 99.98 },
        { period: 'Today', value: 99.96 },
      ],
      relatedIncidents: [],
      aiInsight: 'Excellent and stable performance. No immediate concerns.'
    },
  ]);
  
  private vmUtilization = signal<VmUtilization[]>([
    { name: 'ESX Host 1', cpu: 78, memory: 65, disk: 85 },
    { name: 'ESX Host 2', cpu: 45, memory: 88, disk: 70 },
    { name: 'ESX Host 3', cpu: 92, memory: 95, disk: 60 },
    { name: 'Diego Cell 1', cpu: 60, memory: 70, disk: 55 },
    { name: 'Diego Cell 2', cpu: 55, memory: 68, disk: 50 },
  ]);

  getServiceJourneyDetails() {
    return this.journeySteps.asReadonly();
  }

  getSlaComplianceDetails() {
    return this.slaDetails.asReadonly();
  }
  
  getVmUtilization() {
    return this.vmUtilization.asReadonly();
  }
}
