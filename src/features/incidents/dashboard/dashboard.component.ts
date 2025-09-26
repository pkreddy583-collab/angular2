import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { IncidentCardComponent } from '../incident-card/incident-card.component';
import { PredictiveSummaryComponent } from './predictive-summary/predictive-summary.component';
import { AiRoiSummaryComponent } from './ai-roi-summary/ai-roi-summary.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, IncidentCardComponent, RouterLink, PredictiveSummaryComponent, AiRoiSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private incidentService = inject(IncidentService);
  incidents = this.incidentService.getIncidents();
}
