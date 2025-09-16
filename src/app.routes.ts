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

export const routes: Routes = [
  // Incident Feature Routes
  { path: '', component: DashboardComponent, title: 'SLA Watchtower' },
  { path: 'incident/:id', component: IncidentDetailsComponent, title: 'Incident Details' },
  
  // Observability Feature Routes
  { path: 'observability', component: ObservabilityDashboardComponent, title: 'Observability Dashboard' },
  { path: 'observability/journey-detail', component: ServiceJourneyDetailComponent, title: 'Service Journey Details' },
  { path: 'observability/sla-detail', component: SlaComplianceDetailComponent, title: 'SLA Compliance Details' },

  // Tower Report Feature Route
  { path: 'tower-report', component: TowerReportComponent, title: 'Tower Deep Dive Report' },
  
  // FTE Balancing Feature Route
  { path: 'fte-balancing', component: FteBalancingComponent, title: 'FTE Heat Map & Balancing' },

  // API & Data Hub Route
  { path: 'api-data-hub', component: ApiDataHubComponent, title: 'API & Data Hub' },

  // Admin Route
  { path: 'admin', component: AdminComponent, title: 'Admin Panel' },

  // Wildcard route to redirect to the main dashboard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];