import { Routes } from '@angular/router';

// Import all the page-level components
import { DashboardComponent } from './features/incidents/dashboard/dashboard.component';
import { IncidentDetailsComponent } from './features/incidents/incident-details/incident-details.component';
import { ObservabilityDashboardComponent } from './features/observability/observability-dashboard/observability-dashboard.component';
import { ServiceJourneyDetailComponent } from './features/observability/service-journey-detail/service-journey-detail.component';
import { SlaComplianceDetailComponent } from './features/observability/sla-compliance-detail/sla-compliance-detail.component';
import { TowerReportComponent } from './features/tower-report/tower-report.component';
import { ApiDataHubComponent } from './features/api-data-hub/api-data-hub.component';
import { FteBalancingComponent } from './features/fte-balancing/fte-balancing.component';
import { AdminComponent } from './features/admin/admin.component';
import { HandoverHubComponent } from './features/handover-hub/handover-hub.component';
import { WorkbenchComponent } from './features/workbench/workbench.component';
import { ComplianceTrackerComponent } from './features/compliance-tracker/compliance-tracker.component';
import { PredictiveInsightsComponent } from './features/predictive-insights/predictive-insights.component';
import { DeepDiveTrendsComponent } from './features/tower-report/deep-dive-trends/deep-dive-trends.component';
import { AiRoiDashboardComponent } from './features/ai-roi-dashboard/ai-roi-dashboard.component';
import { OnCallRosterComponent } from './features/on-call-roster/on-call-roster.component';
import { JourneyBuilderComponent } from './features/observability/journey-builder/journey-builder.component';
import { CommandCenterComponent } from './features/command-center/command-center.component';
import { MyDashboardComponent } from './features/my-dashboard/my-dashboard.component';
import { IncidentManagementComponent } from './features/incident-management/incident-management.component';
import { ChangeManagementComponent } from './features/change-management/change-management.component';
import { SreWorkbenchComponent } from './features/sre-workbench/sre-workbench.component';
import { ProblemManagementComponent } from './features/problem-management/problem-management.component';
import { ConfigurationManagementComponent } from './features/configuration-management/configuration-management.component';
import { HomeComponent } from './features/home/home.component';
import { CertificateManagementComponent } from './features/certificate-management/certificate-management.component';
import { RiskManagementComponent } from './features/risk-management/risk-management.component';
import { BusinessUserHubComponent } from './features/business-user-hub/business-user-hub.component';

export const routes: Routes = [
  // New Home Route
  { path: 'home', component: HomeComponent, title: 'IT Operations Hub' },
  { path: 'sla-watchtower', component: DashboardComponent, title: 'SLA Watchtower' },
  
  // Incident Feature Routes
  { path: 'command-center', component: CommandCenterComponent, title: 'Operations Command Center' },
  { path: 'my-dashboard', component: MyDashboardComponent, title: 'My Dashboard' },
  { path: 'incident-management', component: IncidentManagementComponent, title: 'Incident Management Hub' },
  { path: 'problem-management', component: ProblemManagementComponent, title: 'Problem Management Hub' },
  { path: 'change-management', component: ChangeManagementComponent, title: 'Change Management Hub' },
  { path: 'configuration-management', component: ConfigurationManagementComponent, title: 'Configuration Management Hub' },
  { path: 'incident/:id', component: IncidentDetailsComponent, title: 'Incident Details' },
  { path: 'ai-roi', component: AiRoiDashboardComponent, title: 'AI ROI Dashboard' },
  
  // New detailed pages
  { path: 'certificate-management', component: CertificateManagementComponent, title: 'Certificate Management' },
  { path: 'risk-management', component: RiskManagementComponent, title: 'Risk Management' },
  
  // SRE Workbench Route
  { path: 'sre-workbench', component: SreWorkbenchComponent, title: 'SRE Workbench' },

  // Business User Hub
  { path: 'business-user-hub', component: BusinessUserHubComponent, title: 'Business User Hub' },

  // Observability Feature Routes (Platform Management)
  { path: 'observability', component: ObservabilityDashboardComponent, title: 'Platform Management & Observability' },
  { path: 'observability/builder', component: JourneyBuilderComponent, title: 'Journey Builder' },
  { path: 'observability/journey-detail', component: ServiceJourneyDetailComponent, title: 'Service Journey Details' },
  { path: 'observability/sla-detail', component: SlaComplianceDetailComponent, title: 'SLA Compliance Details' },

  // Handover Hub Feature Route
  { path: 'handover-hub', component: HandoverHubComponent, title: 'Handover Hub' },

  // On-call Roster Route
  { path: 'on-call-roster', component: OnCallRosterComponent, title: 'On-call Roster' },

  // Compliance Tracker Route
  { path: 'compliance-tracker', component: ComplianceTrackerComponent, title: 'EOD/BOD Compliance' },

  // AI Workbench Route
  { path: 'workbench', component: WorkbenchComponent, title: 'AI Workbench' },

  // Predictive Insights Route
  { path: 'predictive-insights', component: PredictiveInsightsComponent, title: 'Predictive Insights' },

  // Tower Report Feature Route
  { path: 'tower-report', component: TowerReportComponent, title: 'Tower Deep Dive Report' },
  { path: 'tower-report/trends', component: DeepDiveTrendsComponent, title: 'Deep Dive Trends' },
  
  // FTE Balancing Feature Route
  { path: 'fte-balancing', component: FteBalancingComponent, title: 'FTE Heat Map & Balancing' },

  // API & Data Hub Route
  { path: 'api-data-hub', component: ApiDataHubComponent, title: 'API & Data Hub' },

  // Admin Route
  { path: 'admin', component: AdminComponent, title: 'Admin Panel' },

  // Wildcard route to redirect to the new home page
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];