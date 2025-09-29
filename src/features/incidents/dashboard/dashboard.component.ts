import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../services/incident.service';
import { IncidentCardComponent } from '../incident-card/incident-card.component';
import { Incident } from '../../../models/incident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [IncidentCardComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private incidentService = inject(IncidentService);
  incidents = this.incidentService.getIncidents();

  trackById(index: number, incident: Incident): string {
    return incident.id;
  }
}
