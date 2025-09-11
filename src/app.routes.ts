import { Routes } from '@angular/router';
import { DashboardComponent } from './features/incidents/dashboard/dashboard.component';
import { IncidentDetailsComponent } from './features/incidents/incident-details/incident-details.component';
import { ObservabilityDashboardComponent } from './features/observability/observability-dashboard/observability-dashboard.component';
import { ServiceJourneyDetailComponent } from './features/observability/service-journey-detail/service-journey-detail.component';
import { SlaComplianceDetailComponent } from './features/observability/sla-compliance-detail/sla-compliance-detail.component';
import { ApiDataHubComponent } from './features/api-data-hub/api-data-hub.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'incident/:id', component: IncidentDetailsComponent },
  { path: 'observability', component: ObservabilityDashboardComponent },
  { path: 'observability/journey-detail', component: ServiceJourneyDetailComponent },
  { path: 'observability/sla-detail', component: SlaComplianceDetailComponent },
  { path: 'api-data', component: ApiDataHubComponent },
];