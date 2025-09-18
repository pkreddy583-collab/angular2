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
import { ChangeDashboardComponent } from './features/change-management/change-dashboard/change-dashboard.component';
import { ProblemWorkspaceComponent } from './features/problem-management/problem-workspace/problem-workspace.component';
import { OnCallDashboardComponent } from './features/on-call-hub/on-call-dashboard/on-call-dashboard.component';
import { ServiceListComponent } from './features/service-catalog/service-list/service-list.component';
import { ServiceDetailComponent } from './features/service-catalog/service-detail/service-detail.component';
import { KnowledgeBaseListComponent } from './features/knowledge-base/knowledge-base-list/knowledge-base-list.component';
import { KnowledgeBaseArticleComponent } from './features/knowledge-base/knowledge-base-article/knowledge-base-article.component';
import { PostMortemListComponent } from './features/post-mortem/post-mortem-list/post-mortem-list.component';
import { PostMortemDetailComponent } from './features/post-mortem/post-mortem-detail/post-mortem-detail.component';
import { CapacityDashboardComponent } from './features/capacity-planning/capacity-dashboard/capacity-dashboard.component';
import { CapacityDetailComponent } from './features/capacity-planning/capacity-detail/capacity-detail.component';

export const routes: Routes = [
  // Incident Feature Routes
  { path: '', component: DashboardComponent, title: 'SLA Watchtower' },
  { path: 'incident/:id', component: IncidentDetailsComponent, title: 'Incident Details' },
  
  // Observability Feature Routes
  { path: 'observability', component: ObservabilityDashboardComponent, title: 'Observability Dashboard' },
  { path: 'observability/journey-detail', component: ServiceJourneyDetailComponent, title: 'Service Journey Details' },
  { path: 'observability/sla-detail', component: SlaComplianceDetailComponent, title: 'SLA Compliance Details' },

  // Handover Hub Feature Route
  { path: 'handover-hub', component: HandoverHubComponent, title: 'Handover Hub' },

  // Existing Module Routes
  { path: 'change-management', component: ChangeDashboardComponent, title: 'Change Management' },
  { path: 'problem-management', component: ProblemWorkspaceComponent, title: 'Problem Management' },
  { path: 'on-call-hub', component: OnCallDashboardComponent, title: 'On-Call Hub' },

  // New Actionable Modules
  { path: 'service-catalog', component: ServiceListComponent, title: 'Service Catalog' },
  { path: 'service-catalog/:id', component: ServiceDetailComponent, title: 'Service Details' },
  { path: 'knowledge-base', component: KnowledgeBaseListComponent, title: 'Knowledge Base' },
  { path: 'knowledge-base/:id', component: KnowledgeBaseArticleComponent, title: 'KB Article' },
  { path: 'post-mortem', component: PostMortemListComponent, title: 'Post-Mortem Hub' },
  { path: 'post-mortem/:id', component: PostMortemDetailComponent, title: 'Post-Mortem Details' },
  { path: 'capacity-planning', component: CapacityDashboardComponent, title: 'Capacity Planning' },
  { path: 'capacity-planning/:id', component: CapacityDetailComponent, title: 'Capacity Details' },

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