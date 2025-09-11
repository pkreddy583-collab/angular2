import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConfigService } from '../../services/data-config.service';
import { IncidentService } from '../../services/incident.service';
import { ObservabilityDataService } from '../../services/observability-data.service';

@Component({
  selector: 'app-api-data-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-data-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiDataHubComponent {
  private dataConfigService = inject(DataConfigService);
  private incidentService = inject(IncidentService);
  private observabilityDataService = inject(ObservabilityDataService);

  configs = this.dataConfigService.getConfigs();

  // Signals for managing UI state
  copied = signal<string | null>(null);
  activeSection = signal<string>('incidents');
  activeTab = signal<{[key: string]: string}>({
    incidents: 'api',
    serviceJourney: 'api',
    slaCompliance: 'api'
  });

  // Example data for JSON response previews
  // FIX: The signal returned by getIncidents() must be invoked to get its value.
  incidentSample = computed(() => this.incidentService.getIncidents()().slice(0, 2));
  journeySample = computed(() => this.observabilityDataService.getServiceJourneyDetails()().slice(0, 1));
  slaSample = computed(() => this.observabilityDataService.getSlaComplianceDetails()().slice(0, 1));

  // Method to copy code to clipboard
  copyToClipboard(key: string, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  // Method to pretty-print JSON for display
  prettyPrintJson(json: unknown): string {
    return JSON.stringify(json, (key, value) => {
      // Custom replacer to format dates as ISO strings for the example
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }, 2);
  }

  // UI interaction methods
  selectSection(section: string) {
    this.activeSection.set(section);
  }
  
  selectTab(section: string, tab: string) {
    this.activeTab.update(tabs => ({...tabs, [section]: tab}));
  }
}
