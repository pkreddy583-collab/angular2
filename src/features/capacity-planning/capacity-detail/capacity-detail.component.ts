import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CapacityPlanningService } from '../../../services/capacity-planning.service';
import { SparklineChartComponent } from '../../tower-report/sparkline-chart.component';

@Component({
  selector: 'app-capacity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SparklineChartComponent],
  templateUrl: './capacity-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityDetailComponent {
  private route = inject(ActivatedRoute);
  private capacityService = inject(CapacityPlanningService);

  private serviceId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));

  serviceData = computed(() => {
    const id = this.serviceId();
    if (!id) return undefined;
    return this.capacityService.getCapacityDataByServiceId(id)();
  });

  getMetricColor(usage: number, thresholds: { warning: number; critical: number; }): string {
    if (usage >= thresholds.critical) return '#ef4444'; // red-500
    if (usage >= thresholds.warning) return '#f59e0b'; // yellow-500
    return '#22c55e'; // green-500
  }
}