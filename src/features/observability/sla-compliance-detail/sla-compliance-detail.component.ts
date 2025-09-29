import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ObservabilityDataService } from '../../../services/observability-data.service';

@Component({
  selector: 'app-sla-compliance-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sla-compliance-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlaComplianceDetailComponent {
  private dataService = inject(ObservabilityDataService);
  slaDetails = this.dataService.getSlaComplianceDetails();
}
