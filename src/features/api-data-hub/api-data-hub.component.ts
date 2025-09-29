import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConfigService } from '../../services/data-config.service';
import { IncidentService } from '../../services/incident.service';
import { ObservabilityDataService } from '../../services/observability-data.service';
import { TowerReportService } from '../../services/tower-report.service';
import { FteBalancingService } from '../../services/fte-balancing.service';
import { HandoverService } from '../../services/handover.service';
import { ComplianceService } from '../../services/compliance.service';
import { AdminService } from '../../services/admin.service';
import { PostmortemService } from '../../services/postmortem.service';
import { OnCallRosterService } from '../../services/on-call-roster.service';


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
  private towerReportService = inject(TowerReportService);
  private fteBalancingService = inject(FteBalancingService);
  private handoverService = inject(HandoverService);
  private complianceService = inject(ComplianceService);
  private adminService = inject(AdminService);
  private postmortemService = inject(PostmortemService);
  private onCallRosterService = inject(OnCallRosterService);

  configs = this.dataConfigService.getConfigs();

  // Signals for managing UI state
  copied = signal<string | null>(null);
  activeSection = signal<string>('incidents');
  activeTab = signal<{ [key: string]: string }>({
    incidents: 'logic',
    predictiveBriefing: 'logic',
    serviceJourney: 'api',
    slaCompliance: 'api',
    towerReport: 'logic',
    towerReportTrends: 'logic',
    fteBalancing: 'logic',
    onCallRoster: 'logic',
    handovers: 'logic',
    compliance: 'logic',
    admin: 'logic',
    postmortems: 'logic',
    aiRoi: 'logic',
  });

  // Example data for JSON response previews
  incidentSample = computed(() => this.incidentService.getIncidents()().slice(0, 2));
  journeySample = computed(() => this.observabilityDataService.getServiceJourneyDetails()().slice(0, 1));
  slaSample = computed(() => this.observabilityDataService.getSlaComplianceDetails()().slice(0, 1));
  towerReportSample = computed(() => {
    const reportData = this.towerReportService.reportData();
    return {
      floatingFte: reportData.floatingFte,
      computeTower: reportData.computeTower,
      ticketDrivenWork: reportData.ticketDrivenWork,
      structuredActivities: reportData.structuredActivities,
      finalWorkload: reportData.finalWorkload
    };
  });
  fteSample = computed(() => ({
    towers: this.fteBalancingService.towerStatus().slice(0, 3),
    movements: this.fteBalancingService.movementHistory().slice(0, 2)
  }));
  onCallRosterSample = computed(() => this.onCallRosterService.getRosters()().slice(0, 2));
  handoverSample = computed(() => this.handoverService.getHistoryForDate('2025-07-25'));
  complianceSample = computed(() => this.complianceService.emailLogs().slice(0, 3));
  adminSample = computed(() => ({
    masterActivities: this.adminService.masterActivities().slice(0, 2),
    suggestions: this.adminService.activitySuggestions().slice(0, 2)
  }));
  postmortemSample = computed(() => this.postmortemService.getIncidentsForPostmortem()());
  aiRoiSample = computed