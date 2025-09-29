import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IncidentService } from '../../../services/incident.service';
import { IncidentCardComponent } from '../incident-card/incident-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [IncidentCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private incidentService = inject(IncidentService);
  incidents = this.incidentService.getIncidents();
}