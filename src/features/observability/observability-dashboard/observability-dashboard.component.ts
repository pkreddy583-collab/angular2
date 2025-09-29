import { Component, ChangeDetectionStrategy, signal, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-observability-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  templateUrl: './observability-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservabilityDashboardComponent {
  @ViewChildren('stepRow') stepRows!: QueryList<ElementRef<HTMLDivElement>>;

  selectedStep = signal<number | null>(null);

  selectStep(step: number): void {
    if (this.selectedStep() === step) {
      this.selectedStep.set(null); // Toggle off
    } else {
      this.selectedStep.set(step);
      // Let rendering complete before scrolling
      setTimeout(() => {
        const stepIndex = this.serviceHealth.findIndex(s => s.step === step);
        const rowElement = this.stepRows.get(stepIndex);
        rowElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 0);
    }
  }

  // Mock data for the dashboard.
  // In a real app, this would come from a service.

  lastUpdated = new Date();

  businessMetrics = [
    { label: 'Active Users', value: '1.2K', trend: '+5.2%', trendDirection: 'up' as const },
    { label: 'Enrollment Submitted', value: '456', trend: '+12%', trendDirection: 'up' as const, breakdown: 'MA: 150, Channel E2: 40, MAPD: 100' },
    { label: 'Enrollment Variance', value: 'Down by 2%', trend: '', trendDirection: 'down' as const },
    { label: 'Failed to Submit', value: '26', trend: '-8%', trendDirection: 'down' as const },
    { label: 'Completion Rate', value: '98.2%', trend: '+1.1%', trendDirection: 'up' as const },
    { label: 'Avg Session', value: '2.3s', trend: '', trendDirection: 'none' as const },
    { label: 'Avg Completion Time', value: '5 min', trend: '', trendDirection: 'none' as const },
    { label: 'Conversion Rate', value: '70%', trend: '+3%', trendDirection: 'up' as const }
  ];

  userFlow = [
    { step: 1, name: 'Login to Enrollment Hub', service: 'Medicare Service', status: 'healthy' as const },
    { step: 2, name: 'Validate the User', service: 'Web Server Health', status: 'healthy' as const },
    { step: 3, name: 'Populate Zipcode for the agents', service: 'DB Server Health', status: 'warning' as const },
    { step: 4, name: 'Plan Enrollment', service: 'Medicare Service', status: 'healthy' as const },
    { step: 5, name: 'Load Application Form', service: 'Web Server Health', status: 'healthy' as const },
    { step: 6, name: 'PCP Finder Lookup', service: 'DB Server Health', status: 'warning' as const },
    { step: 7, name: 'Credit Card Validation', service: 'Payment Gateway', status: 'critical' as const },
  ];

  serviceDistribution = [
    { name: 'Medicare Service', steps: 2, avgTime: 1250, errors: 0.7 },
    { name: 'Web Server Health', steps: 2, avgTime: 2200, errors: 1.4 },
    { name: 'Payment Gateway', steps: 1, avgTime: 6800, errors: 4.1 },
    { name: 'DB Server Health', steps: 2, avgTime: 3650, errors: 2.7 },
  ];

  serviceHealth = [
    { step: 1, name: 'Login to Enrollment Hub application', service: 'Medicare Service', time: 850, errorRate: 0.5, successRate: 99.9, status: 'healthy' as const },
    { step: 2, name: 'Validate the User', service: 'Web Server Health', time: 1200, errorRate: 1.2, successRate: 99.8, status: 'healthy' as const },
    { step: 3, name: 'Populate Zipcode for the agents', service: 'DB Server Health', time: 2600, errorRate: 2.1, successRate: 99.5, status: 'warning' as const },
    { step: 4, name: 'Plan Enrollment', service: 'Medicare Service', time: 1650, errorRate: 0.8, successRate: 99.7, status: 'healthy' as const },
    { step: 5, name: 'Load Application Form', service: 'Web Server Health', time: 3200, errorRate: 1.5, successRate: 99.6, status: 'healthy' as const },
    { step: 6, name: 'PCP Finder Lookup', service: 'DB Server Health', time: 4500, errorRate: 3.2, successRate: 99.2, status: 'critical' as const },
    { step: 7, name: 'Credit Card Validation', service: 'Payment Gateway', time: 6800, errorRate: 4.1, successRate: 98.9, status: 'critical' as const },
  ];

  slaCompliance = [
    { name: 'Login to Enrollment Hub application', current: 850, limit: 2000, status: 'High' as const },
    { name: 'Validate the User', current: 1200, limit: 3000, status: 'Critical' as const },
    { name: 'Populate Zipcode for the agents', current: 2800, limit: 5000, status: 'Critical' as const },
    { name: 'Plan Enrollment', current: 1650, limit: 5000, status: 'High' as const },
  ];

  pieData = [
    { name: 'DB Server Health', value: 32, color: 'text-red-500' },
    { name: 'Web Server Health', value: 21, color: 'text-blue-500' },
    { name: 'Medicare Service', value: 15, color: 'text-green-500' },
    { name: 'Auth Service', value: 12, color: 'text-purple-500' },
    { name: 'Payment Service', value: 20, color: 'text-yellow-500' },
  ];
  
  alerts = [
    { rule: 'Medicare Service Latency > 70% of timeout', current: '1200', threshold: '2100', status: 'Warning' as const },
    { rule: 'Credit Card Validation error rate > 5%', current: '4.1', threshold: '5', status: 'Critical' as const },
    { rule: 'Server Health Latency > timeout', current: '', threshold: '', status: 'Critical' as const },
  ];
}
