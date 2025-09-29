import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
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
  imports: [],
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
    handovers: 'logic',
    onCallRoster: 'logic',
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
  handoverSample = computed(() => this.handoverService.getHistoryForDate('2025-07-25'));
  onCallRosterSample = computed(() => this.onCallRosterService.getRosters()().slice(0, 1));
  complianceSample = computed(() => this.complianceService.emailLogs().slice(0, 3));
  adminSample = computed(() => ({
    masterActivities: this.adminService.masterActivities().slice(0, 2),
    suggestions: this.adminService.activitySuggestions().slice(0, 2)
  }));
  postmortemSample = computed(() => this.postmortemService.getIncidentsForPostmortem()());
  aiRoiSample = computed(() => ({
      totalTimeSavedHours: 12.5,
      incidentsAnalyzed: 42,
      helpfulnessRating: 92.8
  }));
  predictiveBriefingSample = computed(() => ([
      {
        "modelName": "Incident Volume Forecast (7d)",
        "input": "All Production Services",
        "prediction": "Volume expected to be Low (5-10 incidents)",
        "confidence": "High"
      },
      {
        "modelName": "FTE Demand Forecast (Q-Next)",
        "input": "Applications",
        "prediction": "Demand to increase by ~1.5 FTE",
        "confidence": "Medium"
      }
  ]));


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
    this.activeTab.update(tabs => ({ ...tabs, [section]: tab }));
  }

  // --- DDL and DML Section ---

  incidentsDdl = `-- Table to store on-call users/engineers
CREATE TABLE users (
    user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL COMMENT 'Full name of the user or engineer'
) COMMENT 'Master list of users who can be assigned to incidents';

-- Table to store the master list of monitored services
CREATE TABLE services (
    service_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique name of the monitored service'
) COMMENT 'Master list of all monitored services';

-- Core table for storing incident data
CREATE TABLE incidents (
    incident_id VARCHAR(20) PRIMARY KEY COMMENT 'The unique identifier for the incident (e.g., INC-001)',
    title VARCHAR(255) NOT NULL COMMENT 'A brief, descriptive title for the incident',
    description TEXT COMMENT 'A detailed description of the incident, its impact, and symptoms',
    priority ENUM('P1', 'P2', 'P3') NOT NULL COMMENT 'The priority level of the incident',
    status ENUM('Active', 'Resolved', 'Closed') NOT NULL DEFAULT 'Active' COMMENT 'The current status of the incident',
    assigned_to_user_id INT UNSIGNED COMMENT 'Who is currently working on the incident',
    created_at DATETIME NOT NULL COMMENT 'Timestamp when the incident was created',
    sla_breach_at DATETIME NOT NULL COMMENT 'Timestamp when the SLA for this incident will be breached',
    last_update TEXT COMMENT 'The latest update or note on the incident progress',
    
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id),
    INDEX idx_status_priority (status, priority),
    INDEX idx_sla_breach_at (sla_breach_at)
) COMMENT 'Main table for tracking operational incidents';

-- Join table to link incidents to the services they affect (many-to-many)
CREATE TABLE incident_services (
    incident_id VARCHAR(20) NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (incident_id, service_id),
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id)
) COMMENT 'Links incidents to the services they impact';

-- Table to store AI-generated content for the co-pilot module
CREATE TABLE incident_ai_copilot_data (
    copilot_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    incident_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'Foreign key to the specific incident',
    triage_summary TEXT COMMENT 'AI-generated initial assessment of the incident',
    research_links JSON COMMENT 'AI-found relevant KB articles or docs. Stored as a JSON array of objects.',
    event_timeline JSON COMMENT 'AI-generated timeline of key incident events. Stored as a JSON array.',
    executive_summary TEXT COMMENT 'AI-generated high-level summary for non-technical stakeholders',
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE
) COMMENT 'Stores all AI-generated content for the incident co-pilot';

-- Table to store user feedback on the AI co-pilot's helpfulness
CREATE TABLE incident_ai_feedback (
    feedback_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    incident_id VARCHAR(20) NOT NULL,
    user_id INT UNSIGNED NOT NULL COMMENT 'The user who gave the feedback',
    was_helpful BOOLEAN NOT NULL,
    time_saved_range VARCHAR(20) COMMENT 'e.g., <5, 5-10, 15-30, 30+',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_incident_user (incident_id, user_id)
) COMMENT 'Stores user feedback on the effectiveness of the AI co-pilot';
`;

  incidentsDml = `-- Populate the master tables first
INSERT INTO users (user_id, user_name) VALUES
(1, 'Alice'),
(2, 'Bob'),
(3, 'Charlie'),
(4, 'Diana'),
(5, 'Eve'),
(6, 'Frank');

INSERT INTO services (service_id, service_name) VALUES
(1, 'All Production Services'),
(2, 'Order Service'),
(3, 'User Authentication'),
(4, 'Inventory Management'),
(5, 'HR Portal'),
(6, 'Payroll Service'),
(7, 'File Storage Service'),
(8, 'Public Website');

-- Populate the main incidents table (timestamps are placeholders)
INSERT INTO incidents (incident_id, title, priority, assigned_to_user_id, created_at, sla_breach_at, description, last_update) VALUES
('INC-001', 'Production server unresponsive', 'P1', 1, '2025-07-26 10:00:00', '2025-07-26 12:30:00', 'The main production server is not responding...', 'On-call engineer paged. Initial investigation...'),
('INC-002', 'Database connection pool exhausted', 'P1', 2, '2025-07-26 07:00:00', '2025-07-26 18:00:00', 'The primary database is rejecting new connections...', 'Database administrators are increasing the pool size...'),
('INC-003', 'Login service experiencing high latency', 'P2', 3, '2025-07-25 12:00:00', '2025-07-27 06:00:00', 'Users are reporting that login attempts are taking up to 20 seconds...', 'The service has been scaled up. Performance is being monitored.'),
('INC-006', 'SSL certificate renewal failure', 'P1', 6, '2025-07-26 11:50:00', '2025-07-26 13:15:00', 'The automated SSL certificate renewal process has failed...', 'The security team is manually renewing and deploying the certificate.');

-- Populate the join table to link incidents and services
INSERT INTO incident_services (incident_id, service_id) VALUES
('INC-001', 1), -- All Production Services
('INC-002', 2), -- Order Service
('INC-002', 3), -- User Authentication
('INC-002', 4), -- Inventory Management
('INC-003', 3), -- User Authentication
('INC-006', 8); -- Public Website

-- Populate the AI co-pilot data for a specific incident
INSERT INTO incident_ai_copilot_data (incident_id, triage_summary, research_links, event_timeline, executive_summary)
VALUES (
  'INC-001',
  'Based on the error logs and service metrics, the server unresponsiveness is likely due to a critical hardware failure on the primary node. The immediate impact is a complete outage for all hosted services. The top priority is to failover to the secondary node to restore service while the physical inspection is underway.',
  '[{"title": "KB00202: Optimizing Database Indexing for Search", "gist": "This article is relevant because the incident highlights slowness..."}]',
  '[{"time": "2025-07-26T10:00:00Z", "description": "Initial P1 alert received from monitoring for \\'Production server unresponsive\\'."}, {"time": "2025-07-26T10:05:00Z", "description": "Alice, the on-call engineer, was paged and acknowledged the incident."}]',
  'A critical incident is impacting all production services due to an unresponsive server. The technical team is actively working to restore service by failing over to a backup server. The estimated time to recovery is approximately 30-45 minutes.'
);

-- Sample feedback entry
INSERT INTO incident_ai_feedback (incident_id, user_id, was_helpful, time_saved_range)
VALUES ('INC-001', 1, TRUE, '15-30');
`;

  incidentsApiLogic = `
<h3>Endpoint: <code>GET /api/incidents</code></h3>
<p>Retrieves a list of all active, high-priority incidents for the Watchtower dashboard.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>Query the <code>incidents</code> table for all records where <code>status</code> is 'Active'.</li>
  <li>For each incident, query the <code>incident_services</code> and <code>services</code> tables to get a list of affected service names.</li>
  <li>Join with the <code>users</code> table to get the name of the assignee.</li>
  <li>Construct a JSON array of incident objects, ensuring date fields are in ISO 8601 format.</li>
</ol>
<h4>Sample SQL Query:</h4>
<pre><code>SELECT
    i.incident_id AS id,
    i.title,
    i.priority,
    u.user_name AS assignedTo,
    i.created_at AS createdDate,
    i.sla_breach_at AS slaBreachDate,
    i.description,
    i.last_update AS lastUpdate,
    -- Use GROUP_CONCAT to aggregate affected services into a single field
    (SELECT GROUP_CONCAT(s.service_name SEPARATOR ', ')
     FROM incident_services isc
     JOIN services s ON isc.service_id = s.service_id
     WHERE isc.incident_id = i.incident_id) AS affectedServices
FROM incidents i
LEFT JOIN users u ON i.assigned_to_user_id = u.user_id
WHERE i.status = 'Active'
ORDER BY i.sla_breach_at ASC;
</code></pre>
<hr>
<h3>Endpoint: <code>POST /api/incidents/:id/feedback</code></h3>
<p>Saves user feedback for the AI Co-pilot for a specific incident.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>Get the <code>incident_id</code> from the URL path parameter.</li>
  <li>Get the user feedback data from the request body.</li>
  <li>Validate the payload to ensure all required fields are present.</li>
  <li>Execute an <code>INSERT</code> statement into the <code>incident_ai_feedback</code> table.</li>
  <li>Return a <code>201 Created</code> status on success.</li>
</ol>
<h4>Sample SQL Query:</h4>
<pre><code>-- Parameters: $incident_id, $user_id, $was_helpful, $time_saved_range
INSERT INTO incident_ai_feedback 
  (incident_id, user_id, was_helpful, time_saved_range)
VALUES 
  ($incident_id, $user_id, $was_helpful, $time_saved_range);
</code></pre>
`;

  predictiveBriefingApiLogic = `
<h3>API Endpoint: <code>GET /api/analytics/operations-briefing</code></h3>
<p>This endpoint generates the three high-level forecasts for the Watchtower dashboard. It requires multiple steps and several calls to an AI model like Gemini.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
    <li>Perform three tasks in parallel: Generate Incident Volume Forecast, Generate FTE Demand Forecast, and Generate Top SLA Breach Risk Assessment.</li>
    <li>For each task, fetch relevant historical data from the database as context.</li>
    <li>Create a specific, targeted prompt for the AI model, including the historical context.</li>
    <li>Call the AI model API (e.g., Gemini) with the prompt and a <code>responseSchema</code> to ensure a structured JSON output.</li>
    <li>Combine the three results into a single JSON array and return it.</li>
</ol>
<hr>
<h4>Task 1: Incident Volume Forecast (Next 7 Days)</h4>
<p><strong>Step 1: Fetch Historical Data</strong></p>
<pre><code>SELECT
  DATE(created_at) as incident_date,
  COUNT(*) as daily_count
FROM incidents
WHERE created_at >= NOW() - INTERVAL 90 DAY
GROUP BY DATE(created_at)
ORDER BY incident_date ASC;
</code></pre>
<p><strong>Step 2: Call AI Model (Python Pseudocode)</strong></p>
<pre><code>import google.generativeai as genai

ai = genai.GenerativeModel('gemini-2.5-flash')
historical_data = "..." # String from SQL query results

prompt = f"""
Act as an SRE data scientist. Based on the following 90-day incident history, forecast the likely incident volume for the next 7 days.
History: {historical_data}
"""

response = ai.generate_content(
    prompt,
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": {
            "type": "object",
            "properties": {
                "prediction": {"type": "string"},
                "confidence": {"type": "string", "enum": ["High", "Medium", "Low"]}
            }
        }
    }
)
incident_forecast = json.loads(response.text)
</code></pre>
`;


  towerReportDdl = `-- Dimension Tables (Master Data)
CREATE TABLE towers (
    tower_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tower_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'e.g., Compute, Storage'
) COMMENT 'Dimension table for operational towers';

CREATE TABLE reporting_units (
    unit_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tower_id INT UNSIGNED NOT NULL,
    unit_name VARCHAR(100) NOT NULL COMMENT 'e.g., Core Infra / Alpha',
    UNIQUE KEY (tower_id, unit_name),
    FOREIGN KEY (tower_id) REFERENCES towers(tower_id)
) COMMENT 'Dimension table for reporting units within towers';

CREATE TABLE users (
    user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50)
) COMMENT 'Master list of users for audit trails';

-- Note: master_activities table is defined in the Admin schema.

-- Snapshot Tables (Aggregated Monthly Data)
-- This table holds the top-level summary for a specific report instance.
CREATE TABLE monthly_report_summaries (
    summary_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    snapshot_month DATE NOT NULL COMMENT 'First day of the month, e.g., 2025-07-01',
    unit_id INT UNSIGNED NOT NULL,
    contractual_fte DECIMAL(6, 2) NOT NULL,
    deployed_fte DECIMAL(6, 2) NOT NULL,
    floating_fte_total DECIMAL(6, 2) NOT NULL,
    floating_fte_deployed DECIMAL(6, 2) NOT NULL,
    ticket_manager_adjustment_pct INT NOT NULL DEFAULT 0 COMMENT 'Global manager adjustment percentage for items without a specific override',
    
    -- Audit and Approval Fields
    approval_status ENUM('Draft', 'Pending Approval', 'Approved') NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT UNSIGNED,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by INT UNSIGNED,
    approved_at DATETIME,
    approved_by INT UNSIGNED,
    
    UNIQUE KEY (snapshot_month, unit_id),
    FOREIGN KEY (unit_id) REFERENCES reporting_units(unit_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (last_modified_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
) COMMENT 'Top-level summary data for a monthly deep dive report with audit trail';

-- This table stores the aggregated ticket data for a given monthly report.
CREATE TABLE monthly_ticket_aggregates (
    aggregate_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    summary_id INT UNSIGNED NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'e.g., Incidents, Changes',
    priority VARCHAR(20) NOT NULL COMMENT 'e.g., P1, Standard',
    ticket_count INT UNSIGNED NOT NULL,
    avg_time_mins DECIMAL(10, 2) NOT NULL,
    p50_time_mins DECIMAL(10, 2),
    p75_time_mins DECIMAL(10, 2),
    p90_time_mins DECIMAL(10, 2),
    adjustment_pct INT NULL DEFAULT NULL COMMENT 'Row-specific percentage adjustment override. If NULL, the global adjustment is used.',
    
    FOREIGN KEY (summary_id) REFERENCES monthly_report_summaries(summary_id) ON DELETE CASCADE,
    INDEX idx_category_priority (category, priority)
) COMMENT 'Monthly aggregated data for ticket-driven work';

-- This table stores the aggregated structured activity data for a given monthly report.
CREATE TABLE monthly_structured_aggregates (
    aggregate_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    summary_id INT UNSIGNED NOT NULL,
    master_activity_id INT NOT NULL COMMENT 'FK to the master_activities table (defined in Admin schema)',
    instances INT UNSIGNED NOT NULL,
    hrs_per_instance DECIMAL(5, 2) NOT NULL,
    adjustment_pct INT NULL DEFAULT NULL COMMENT 'Row-specific percentage adjustment override. If NULL, the global adjustment is used.',
    
    FOREIGN KEY (summary_id) REFERENCES monthly_report_summaries(summary_id) ON DELETE CASCADE
    -- FOREIGN KEY (master_activity_id) REFERENCES master_activities(activity_id)
) COMMENT 'Monthly aggregated data for structured activities';
`;

  towerReportDml = `-- 1. Populate Dimension Tables (should be done once)
INSERT INTO users (user_id, user_name, user_role) VALUES (101, 'Manager A', 'Manager'), (102, 'Analyst B', 'Analyst');
INSERT INTO towers (tower_id, tower_name) VALUES (1, 'Compute');
INSERT INTO reporting_units (unit_id, tower_id, unit_name) VALUES (1, 1, 'Core Infra / Alpha');
-- master_activities table is populated via the Admin panel.

-- 2. Create a summary record for the July 2025 report for the 'Core Infra / Alpha' unit.
INSERT INTO monthly_report_summaries 
    (summary_id, snapshot_month, unit_id, contractual_fte, deployed_fte, floating_fte_total, floating_fte_deployed, ticket_manager_adjustment_pct, approval_status, created_by, last_modified_by)
VALUES 
    (1, '2025-07-01', 1, 16.0, 15.0, 10.0, 4.0, 0, 'Draft', 102, 102);

-- 3. Populate the aggregated ticket data for that summary (summary_id = 1).
INSERT INTO monthly_ticket_aggregates (summary_id, category, priority, ticket_count, avg_time_mins, p50_time_mins, p75_time_mins, p90_time_mins, adjustment_pct) VALUES
(1, 'Incidents', 'P1', 10, 120.0, 110.0, 150.0, 180.0, NULL),
(1, 'Incidents', 'P2', 50, 60.0, 55.0, 75.0, 90.0, 10), -- A 10% specific override
(1, 'Incidents', 'P3', 200, 30.0, 25.0, 40.0, 50.0, NULL),
(1, 'Changes', 'Standard', 80, 45.0, 40.0, 55.0, 65.0, NULL),
(1, 'Tasks', 'Standard', 150, 15.0, 12.0, 20.0, 25.0, NULL);

-- 4. Populate the aggregated structured activity data for that summary (summary_id = 1).
-- The master_activity_id corresponds to the IDs in the admin.service.ts mock data.
INSERT INTO monthly_structured_aggregates (summary_id, master_activity_id, instances, hrs_per_instance, adjustment_pct) VALUES
(1, 1, 2, 8.0, NULL),   -- Major Incident Command
(1, 3, 1, 16.0, NULL),  -- Healthcheck Scripting
(1, 5, 2, 20.0, -15); -- A -15% specific override
`;

  towerReportApiLogic = `
<h3>Endpoint: <code>GET /api/tower-report?month=2025-07-01&unit_id=1</code></h3>
<p>Retrieves all the aggregated data for a specific Tower Deep Dive report.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>Get <code>month</code> and <code>unit_id</code> from query parameters.</li>
  <li>Find the report summary from the <code>monthly_report_summaries</code> table. JOIN with <code>users</code> to get names for audit fields.</li>
  <li>Fetch all related ticket aggregates from <code>monthly_ticket_aggregates</code> for that summary.</li>
  <li>Fetch all related structured aggregates from <code>monthly_structured_aggregates</code>. JOIN with <code>master_activities</code> to get activity names and categories.</li>
  <li>Group the structured activities by their category.</li>
  <li>Construct the final JSON payload matching the frontend model, ensuring all nested objects are correctly formed.</li>
</ol>
<hr>
<h3>Endpoint: <code>PATCH /api/reports/ticket-aggregates/:id</code></h3>
<p>Updates the adjustment override for a single ticket-driven work item.</p>
<h4>Request Body: <code>{ "adjustment_pct": 15 }</code></h4>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>Get aggregate ID from the URL parameter.</li>
  <li>Get adjustment percentage from the request body.</li>
  <li>Execute an <code>UPDATE</code> statement on the <code>monthly_ticket_aggregates</code> table.</li>
  <li>Return a <code>200 OK</code> status with the updated record.</li>
</ol>
<h4>Sample SQL Query:</h4>
<pre><code>-- Parameters: $adjustment_pct, $aggregate_id
UPDATE monthly_ticket_aggregates
SET adjustment_pct = $adjustment_pct
WHERE aggregate_id = $aggregate_id;
</code></pre>
`;

  towerReportTrendsApiLogic = `
<h3>Endpoint: <code>GET /api/tower-report/trends?unit_id=1&months=6</code></h3>
<p>Retrieves historical data for the Deep Dive Trends dashboard.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
    <li>Get <code>unit_id</code> and number of <code>months</code> from query parameters.</li>
    <li>Query the <code>monthly_report_summaries</code> table for the last N months for the specified unit.</li>
    <li>For each month's summary, perform aggregations on its related <code>monthly_ticket_aggregates</code> and <code>monthly_structured_aggregates</code> to calculate the total required FTE for that month.</li>
    <li>The FTE calculation logic should mirror the one used in the frontend's <code>TowerReportService</code> (taking into account global and row-level adjustments).</li>
    <li>Structure the results into a JSON array, with one object per month, matching the frontend's <code>MonthlyTrendData</code> model.</li>
</ol>
<h4>Sample SQL Query (Simplified):</h4>
<p>Note: A real implementation might use a stored procedure or multiple queries for clarity and performance.</p>
<pre><code>-- Parameter: $unit_id, $start_date (e.g., 6 months ago)
SELECT
    mrs.snapshot_month AS month,
    mrs.deployed_fte AS actualDeployedFte,
    
    -- Calculate total ticket FTE for the month
    (
        SELECT SUM(((t.ticket_count * t.avg_time_mins) / 60) / 160 * (1 + (COALESCE(t.adjustment_pct, mrs.ticket_manager_adjustment_pct) / 100.0)))
        FROM monthly_ticket_aggregates t
        WHERE t.summary_id = mrs.summary_id
    )
    +
    -- Calculate total structured FTE for the month
    (
        SELECT SUM(((s.instances * s.hrs_per_instance) / 160) * (1 + (COALESCE(s.adjustment_pct, mrs.ticket_manager_adjustment_pct) / 100.0)))
        FROM monthly_structured_aggregates s
        WHERE s.summary_id = mrs.summary_id
    ) AS totalRequiredFte,

    -- Individual FTE components would need similar subqueries...
    
FROM monthly_report_summaries mrs
WHERE mrs.unit_id = $unit_id AND mrs.snapshot_month >= $start_date
ORDER BY mrs.snapshot_month ASC;
</code></pre>
`;

  fteBalancingDdl = `-- Stores the master list of operational towers
CREATE TABLE towers (
    tower_id VARCHAR(50) PRIMARY KEY,
    tower_name VARCHAR(100) UNIQUE NOT NULL
) COMMENT 'Master list of operational towers';

-- Stores monthly snapshots of FTE requirements and deployments
CREATE TABLE fte_snapshots (
    snapshot_id INT PRIMARY KEY AUTO_INCREMENT,
    tower_id VARCHAR(50),
    snapshot_month DATE, -- e.g., '2025-07-01'
    required_fte DECIMAL(6, 2),
    deployed_fte DECIMAL(6, 2),
    FOREIGN KEY (tower_id) REFERENCES towers(tower_id),
    UNIQUE KEY (tower_id, snapshot_month)
) COMMENT 'Monthly record of required vs deployed FTE per tower';

-- Transactional log of all FTE movements between towers
CREATE TABLE fte_movements (
    movement_id INT PRIMARY KEY AUTO_INCREMENT,
    movement_date DATETIME,
    from_tower_id VARCHAR(50),
    to_tower_id VARCHAR(50),
    fte_amount DECIMAL(5, 2),
    FOREIGN KEY (from_tower_id) REFERENCES towers(tower_id),
    FOREIGN KEY (to_tower_id) REFERENCES towers(tower_id)
) COMMENT 'Logs all FTE reallocations between towers';
`;

  fteBalancingDml = `INSERT INTO towers (tower_id, tower_name) VALUES
('compute', 'Compute'), ('storage', 'Storage'), ('network', 'Network');

-- Sample data for June 2025
INSERT INTO fte_snapshots (tower_id, snapshot_month, required_fte, deployed_fte) VALUES
('compute', '2025-06-01', 15.5, 15.0),
('storage', '2025-06-01', 13.0, 13.5);

-- Sample data for July 2025
INSERT INTO fte_snapshots (tower_id, snapshot_month, required_fte, deployed_fte) VALUES
('compute', '2025-07-01', 16.0, 15.0),
('storage', '2025-07-01', 12.0, 14.0);

-- Sample movement
INSERT INTO fte_movements (movement_date, from_tower_id, to_tower_id, fte_amount) VALUES
('2025-06-15 14:00:00', 'storage', 'compute', 1.0);
`;

  handoversDdl = `-- Stores the master list of application portfolios
CREATE TABLE portfolios (
    portfolio_id VARCHAR(50) PRIMARY KEY,
    portfolio_name VARCHAR(100) NOT NULL
) COMMENT 'Master list of application portfolios';

-- Stores the daily handover reports
CREATE TABLE handover_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id VARCHAR(50),
    report_date DATE,
    health_status ENUM('Healthy', 'Warning', 'Critical'),
    onshore_notes TEXT,
    offshore_notes TEXT,
    manager_rating TINYINT, -- 0-5 stars
    manager_comment TEXT,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id),
    UNIQUE KEY (portfolio_id, report_date)
) COMMENT 'Daily EOD/BOD handover records';

-- Stores the incident-specific notes for each handover
CREATE TABLE handover_incident_gists (
    gist_id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    incident_id VARCHAR(20),
    gist_text TEXT,
    FOREIGN KEY (report_id) REFERENCES handover_reports(report_id)
) COMMENT 'Incident-specific summaries for each handover';
`;

  handoversDml = `INSERT INTO portfolios (portfolio_id, portfolio_name) VALUES
('portfolio-1', 'Core Services'), ('portfolio-2', 'Finance & HR');

-- Sample Handover for T-1
INSERT INTO handover_reports (portfolio_id, report_date, health_status, onshore_notes, offshore_notes, manager_rating, manager_comment) VALUES
('portfolio-1', '2025-07-25', 'Warning', 'EOD T-1: Rolled out patch...', 'BOD T-1: Patch looks stable.', 4, 'Good handover.');

-- Assume the above insert returns report_id = 1
INSERT INTO handover_incident_gists (report_id, incident_id, gist_text) VALUES
(1, 'INC-002', 'Database performance remains a concern.');
`;

  onCallRosterDdl = `-- This schema allows you to manage your on-call schedule in your own database
-- while syncing user profile information from an external source like Azure Active Directory.

-- Defines the high-level operational towers.
CREATE TABLE towers (
    tower_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tower_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'e.g., Core Infrastructure, Applications'
) COMMENT 'Master list of operational towers';

-- Defines specific teams within each tower.
CREATE TABLE teams (
    team_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tower_id INT UNSIGNED NOT NULL,
    team_name VARCHAR(100) NOT NULL COMMENT 'e.g., SRE Team Alpha, Enrollment Hub Support',
    UNIQUE KEY (tower_id, team_name),
    FOREIGN KEY (tower_id) REFERENCES towers(tower_id)
) COMMENT 'Teams responsible for on-call duties within a tower';

-- Stores user information. This table is synced with your Microsoft user directory.
CREATE TABLE users (
    user_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    external_user_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'The Object ID from Azure Active Directory or another unique external identifier.',
    full_name VARCHAR(100) NOT NULL COMMENT 'Synced from external source',
    avatar_url VARCHAR(255) COMMENT 'Synced from external source',
    phone_number VARCHAR(50) COMMENT 'Synced from external source',
    chat_handle VARCHAR(100) COMMENT 'Synced from external source (e.g., Teams UPN)',
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT 'Local cache of user data synced from a Microsoft directory';

-- The core scheduling table where you define who is on-call.
CREATE TABLE on_call_schedules (
    schedule_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    team_id INT UNSIGNED NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    primary_user_id INT UNSIGNED NOT NULL,
    secondary_user_id INT UNSIGNED NOT NULL,
    manager_user_id INT UNSIGNED NOT NULL,

    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (primary_user_id) REFERENCES users(user_id),
    FOREIGN KEY (secondary_user_id) REFERENCES users(user_id),
    FOREIGN KEY (manager_user_id) REFERENCES users(user_id),
    INDEX idx_team_time (team_id, start_time, end_time)
) COMMENT 'Defines the on-call shifts for each team';
`;

  onCallRosterDml = `-- 1. Populate towers and teams (done once or as needed)
INSERT INTO towers (tower_name) VALUES ('Core Infrastructure'), ('Applications');
INSERT INTO teams (tower_id, team_name) VALUES (1, 'SRE Team Alpha'), (2, 'Enrollment Hub Support');

-- 2. Populate the users table.
-- In a real system, a background job would sync this data from Azure AD.
-- The external_user_id is the critical link.
INSERT INTO users (external_user_id, full_name, avatar_url, phone_number, chat_handle) VALUES
('azure-guid-alice', 'Alice Johnson', 'https://picsum.photos/seed/alice/100', '+1 (555) 123-4567', '@alice.j'),
('azure-guid-bob', 'Bob Williams', 'https://picsum.photos/seed/bob/100', '+1 (555) 234-5678', '@bob.w'),
('azure-guid-charlie', 'Charlie Brown', 'https://picsum.photos/seed/charlie/100', '+1 (555) 345-6789', '@charlie.b'),
('azure-guid-diana', 'Diana Miller', 'https://picsum.photos/seed/diana/100', '+1 (555) 456-7890', '@diana.m');
-- ...and so on for all users.

-- 3. Create the on-call schedule for the current week.
-- This is the data you would maintain in your own system.
INSERT INTO on_call_schedules (team_id, start_time, end_time, primary_user_id, secondary_user_id, manager_user_id) VALUES
(
    1, -- SRE Team Alpha
    '2025-07-28 09:00:00', -- Monday 9am
    '2025-08-04 09:00:00', -- Next Monday 9am
    (SELECT user_id FROM users WHERE external_user_id = 'azure-guid-alice'),  -- Primary: Alice
    (SELECT user_id FROM users WHERE external_user_id = 'azure-guid-bob'),    -- Secondary: Bob
    (SELECT user_id FROM users WHERE external_user_id = 'azure-guid-charlie') -- Manager: Charlie
);
`;

  onCallRosterApiLogic = `
<h3>Hybrid Data Model: Your DB + Microsoft Graph API</h3>
<p>This approach gives you full control over your on-call schedule while leveraging your company's official user directory (like Azure Active Directory) as the single source of truth for user profile information. This means you don't have to manually update names, phone numbers, or profile pictures.</p>
<h4>How it Works:</h4>
<ol>
    <li><strong>User Sync:</strong> A background process (e.g., a nightly cron job) connects to the <strong>Microsoft Graph API</strong> to fetch user data. It populates or updates your local <code>users</code> table, matching records based on the <code>external_user_id</code> (Azure AD Object ID). This keeps your local user cache fresh.</li>
    <li><strong>Scheduling:</strong> You manage the <code>on_call_schedules</code> table yourself, creating entries that link a team to specific user IDs for a given time period. This is your on-call calendar.</li>
    <li><strong>API Request:</strong> The frontend calls your API endpoint to get the current roster.</li>
</ol>
<hr>
<h3>Endpoint: <code>GET /api/roster</code></h3>
<p>Retrieves the current on-call roster for all teams.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>The API receives the request. The current timestamp (<code>NOW()</code>) is the key parameter.</li>
  <li>Query the <code>on_call_schedules</code> table to find the active schedule for each team (i.e., where <code>NOW()</code> is between <code>start_time</code> and <code>end_time</code>).</li>
  <li>For each active schedule, perform three <code>JOIN</code> operations with the <code>users</code> table (one for primary, one for secondary, one for manager) to retrieve the profile details for each on-call person.</li>
  <li><code>JOIN</code> with the <code>teams</code> and <code>towers</code> tables to get the tower and team names.</li>
  <li>Structure the results into a JSON array matching the frontend model and return it.</li>
</ol>
<h4>Sample SQL Query:</h4>
<pre><code>SELECT
    towers.tower_name AS tower,
    teams.team_name AS team,
    
    -- Primary Contact Details
    JSON_OBJECT(
        'name', p_user.full_name,
        'avatarUrl', p_user.avatar_url,
        'phone', p_user.phone_number,
        'chat', p_user.chat_handle
    ) AS 'currentShift.primary',
    
    -- Secondary Contact Details
    JSON_OBJECT(
        'name', s_user.full_name,
        'avatarUrl', s_user.avatar_url,
        'phone', s_user.phone_number,
        'chat', s_user.chat_handle
    ) AS 'currentShift.secondary',

    -- Manager Contact Details
    JSON_OBJECT(
        'name', m_user.full_name,
        'avatarUrl', m_user.avatar_url,
        'phone', m_user.phone_number,
        'chat', m_user.chat_handle
    ) AS 'currentShift.manager'

FROM on_call_schedules s
JOIN teams ON s.team_id = teams.team_id
JOIN towers ON teams.tower_id = towers.tower_id
JOIN users p_user ON s.primary_user_id = p_user.user_id
JOIN users s_user ON s.secondary_user_id = s_user.user_id
JOIN users m_user ON s.manager_user_id = m_user.user_id
WHERE NOW() BETWEEN s.start_time AND s.end_time;
</code></pre>
<p class="text-xs text-gray-500">Note: The query above uses MySQL's <code>JSON_OBJECT</code> function for demonstration. Your backend language (e.g., Node.js, Python) would typically construct the nested JSON structure after fetching the flat row data.</p>
`;

  complianceDdl = `-- Logs every EOD/BOD email sent from the Handover Hub
CREATE TABLE email_compliance_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    log_timestamp DATETIME NOT NULL,
    portfolio_id VARCHAR(50),
    email_type ENUM('EOD', 'BOD') NOT NULL,
    recipients TEXT,
    subject VARCHAR(255),
    status ENUM('On Time', 'Late', 'Missed') NOT NULL,
    KEY (portfolio_id, log_timestamp)
) COMMENT 'Audit trail for contractual email compliance';
`;

  complianceDml = `INSERT INTO email_compliance_logs (log_timestamp, portfolio_id, email_type, recipients, subject, status) VALUES
('2025-07-25 17:45:00', 'portfolio-1', 'EOD', 'offshore-team@example.com', 'EOD Handover...', 'On Time'),
('2025-07-25 18:15:00', 'portfolio-3', 'EOD', 'offshore-team@example.com', 'EOD Handover...', 'Late');
`;

  adminDdl = `-- The master list of all possible structured activities
CREATE TABLE master_activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    default_frequency VARCHAR(50),
    default_hrs_per_instance DECIMAL(5, 2)
) COMMENT 'Defines all possible structured activities that can be reported';

-- Tracks suggestions for new master activities
CREATE TABLE activity_suggestions (
    suggestion_id INT PRIMARY KEY AUTO_INCREMENT,
    suggested_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    justification TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_by VARCHAR(100),
    date_submitted DATETIME
) COMMENT 'Workflow for suggesting and approving new activities';
`;
  
  adminDml = `INSERT INTO master_activities (activity_name, category, default_frequency, default_hrs_per_instance) VALUES
('Major Incident Command', 'Response', 'Ad-hoc', 8.0),
('Healthcheck Scripting', 'Proactive', 'Monthly', 16.0);

INSERT INTO activity_suggestions (suggested_name, category, justification, status, submitted_by, date_submitted) VALUES
('Post-Incident Review Meeting', 'Response', 'Need to track time on RCA.', 'pending', 'Charlie', NOW());
`;

  postmortemsDdl = `-- Main table for postmortem reports
CREATE TABLE postmortem_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id VARCHAR(20) NOT NULL,
    incident_title VARCHAR(255),
    root_cause_analysis TEXT,
    executive_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY (incident_id)
) COMMENT 'Stores the core details of each postmortem analysis';

-- Timeline of events for each postmortem
CREATE TABLE postmortem_timeline_events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    event_time DATETIME NOT NULL,
    description TEXT,
    FOREIGN KEY (report_id) REFERENCES postmortem_reports(report_id)
) COMMENT 'Chronological events related to an incident';

-- Action items generated from a postmortem
CREATE TABLE postmortem_action_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    description TEXT,
    owner VARCHAR(100),
    status ENUM('Not Started', 'In Progress', 'Done') DEFAULT 'Not Started',
    FOREIGN KEY (report_id) REFERENCES postmortem_reports(report_id)
) COMMENT 'Tracks follow-up actions to prevent recurrence';
`;

  postmortemsDml = `INSERT INTO postmortem_reports (incident_id, incident_title, root_cause_analysis, executive_summary) VALUES
('INC-001', 'Production server unresponsive', 'A memory leak in the v1.2.3 deployment of the caching service caused the OS to become unresponsive.', 'A software bug caused a critical production outage.');

-- Assume the above returns report_id = 1
INSERT INTO postmortem_timeline_events (report_id, event_time, description) VALUES
(1, '2025-07-26 10:00:00', 'Initial alert received from monitoring.'),
(1, '2025-07-26 10:05:00', 'On-call engineer paged.');

INSERT INTO postmortem_action_items (report_id, description, owner, status) VALUES
(1, 'Add memory usage alerts for the caching service.', 'SRE Team', 'Not Started');
`;

  aiRoiApiLogic = `
<h3>Endpoint: <code>GET /api/analytics/ai-roi</code></h3>
<p>Retrieves aggregated data to populate the AI ROI dashboard.</p>
<h4>Backend Implementation Steps:</h4>
<ol>
  <li>Query the <code>incident_ai_feedback</code> table to calculate three key metrics.</li>
  <li>Use a <code>CASE</code> statement to convert the <code>time_saved_range</code> string into an average numerical value in minutes. Sum these values and divide by 60 to get total hours.</li>
  <li>Calculate the total number of feedbacks and the percentage that were helpful.</li>
  <li>Construct the final JSON payload with the three calculated metrics.</li>
</ol>
<h4>Sample SQL Query:</h4>
<pre><code>SELECT
    -- 1. Total hours saved
    SUM(
        CASE time_saved_range
            WHEN '&lt;5' THEN 2.5
            WHEN '5-10' THEN 7.5
            WHEN '15-30' THEN 22.5
            WHEN '30+' THEN 45.0
            ELSE 0
        END
    ) / 60.0 AS totalTimeSavedHours,
    
    -- 2. Total incidents where feedback was given
    COUNT(*) AS incidentsAnalyzed,
    
    -- 3. Percentage of "helpful" responses
    (SUM(CASE WHEN was_helpful = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100.0 AS helpfulnessRating
    
FROM
    incident_ai_feedback;
</code></pre>
`;
}
