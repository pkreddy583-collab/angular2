import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObservabilityDataService } from '../../../services/observability-data.service';

@Component({
  selector: 'app-service-journey-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-journey-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceJourneyDetailComponent {
  private dataService = inject(ObservabilityDataService);
  journeySteps = this.dataService.getServiceJourneyDetails();

  generateSparklinePath(data: number[], width = 100, height = 20): string {
    if (!data || data.length < 2) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return `M ${points.join(' L ')}`;
  }
}
