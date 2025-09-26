import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-incident-details',
  templateUrl: './incident-details.component.html',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailsComponent {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);
  
  private incidentId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
  
  incident = computed(() => {
    const id = this.incidentId();
    if (!id) return undefined;
    return this.incidentService.getIncidentById(id as string);
  });

  // For AI Co-pilot tabs
  activeTab = signal('Triage');

  // --- AI Feedback State ---
  feedbackHelpful = signal<'yes' | 'no' | null>(null);
  timeSavedSelection = new FormControl<string | null>(null);
  feedbackSubmitted = signal(false);

  selectTab(tabName: string) {
    this.activeTab.set(tabName);
  }

  recordHelpful(wasHelpful: 'yes' | 'no'): void {
    this.feedbackHelpful.set(wasHelpful);
    if (wasHelpful === 'no') {
      // If user says no, we can consider the feedback loop complete for this simple version
      this.feedbackSubmitted.set(true);
      // In a real app, you might POST 'was_helpful: false' to the backend here.
    }
  }

  submitTimeSavedFeedback(): void {
    if (this.timeSavedSelection.value) {
      console.log('Feedback submitted:', {
        helpful: this.feedbackHelpful(),
        timeSaved: this.timeSavedSelection.value,
      });
      // In a real app, you would POST this data to your backend here.
      // e.g., this.http.post(`/api/incidents/${this.incidentId()}/feedback`, { ... })
      this.feedbackSubmitted.set(true);
    }
  }
}