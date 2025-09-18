import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CapacityPlanningService } from '../../../services/capacity-planning.service';

@Component({
  selector: 'app-capacity-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './capacity-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityDashboardComponent {
  private capacityService = inject(CapacityPlanningService);
  capacityData = this.capacityService.getCapacityData();

  servicesWithStatus = computed(() => {
    return this.capacityData().map(service => {
      let overallStatus: 'ok' | 'warning' | 'critical' = 'ok';
      const metricsWithUsage = service.metrics.map(metric => {
        const usage = (metric.current / metric.limit) * 100;
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        if (usage >= metric.thresholds.critical) {
          status = 'critical';
        } else if (usage >= metric.thresholds.warning) {
          status = 'warning';
        }
        
        if (status === 'critical') overallStatus = 'critical';
        if (status === 'warning' && overallStatus !== 'critical') overallStatus = 'warning';

        return { ...metric, usage, status };
      });
      return { ...service, metrics: metricsWithUsage, overallStatus };
    });
  });

  getProgressBarClass(status: 'ok' | 'warning' | 'critical'): string {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  }

   getBorderClass(status: 'ok' | 'warning' | 'critical'): string {
    switch (status) {
      case 'ok': return 'border-gray-200';
      case 'warning': return 'border-yellow-500';
      case 'critical': return 'border-red-500';
    }
  }
}