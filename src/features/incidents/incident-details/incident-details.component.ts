import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-incident-details',
  templateUrl: './incident-details.component.html',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailsComponent {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);
  
  private incidentId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
  
  incident = computed(() => {
    const id = this.incidentId();
    if (!id) return undefined;
    return this.incidentService.getIncidentById(id);
  });

  // For AI Co-pilot tabs
  activeTab = signal('Research');

  selectTab(tabName: string) {
    this.activeTab.set(tabName);
  }
}