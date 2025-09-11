import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataConfigService {
  
  private configs = signal({
    incidents: {
      title: 'SLA Incidents Dashboard Query',
      description: 'This query should return all high-priority incidents that are being tracked for SLA breaches. The data is used to populate the main "SLA Breach Watchtower" dashboard.',
       query: `-- This is a placeholder for your Databricks SQL query.
-- Replace this with the actual query that pulls data for the main incidents dashboard.
-- The query should return columns matching the 'Incident' model in 'incident.model.ts'.
-- Ensure date columns (createdDate, slaBreachDate) are returned as ISO 8601 strings.

SELECT 
    incident_id AS id,
    title,
    priority,
    assignee AS assignedTo,
    created_timestamp AS createdDate,
    sla_breach_timestamp AS slaBreachDate,
    description,
    affected_services AS affectedServices, -- Assuming this is an ARRAY<STRING>
    last_update_message AS lastUpdate
FROM 
    your_ticketing_database.active_incidents
WHERE
    priority IN ('P1', 'P2') AND status != 'Resolved'
ORDER BY 
    sla_breach_timestamp ASC;
`
    },
    serviceJourney: {
      title: 'Service Health Journey Details Query',
      description: 'This query should return metrics for each step of the user journey, including latency, error rates, and Apdex scores.',
      query: `-- This is a placeholder for your Databricks SQL query.
-- Replace this with the actual query that pulls data for the Service Journey Detail page.
-- The query should return columns matching the data structure used in ObservabilityDataService, such as:
-- step, name, service, status, avgTime, errorRate, p95Latency, apdexScore, etc.

SELECT 
    step_number AS step,
    step_name AS name,
    service_name AS service,
    CASE 
        WHEN error_rate > 3.0 THEN 'critical'
        WHEN error_rate > 2.0 THEN 'warning'
        ELSE 'healthy'
    END AS status,
    avg_latency_ms AS avgTime,
    error_rate_percent AS errorRate,
    p95_latency_ms AS p95Latency,
    apdex_score AS apdexScore
    -- You will need to join tables to get recent errors and historical latency data
FROM 
    your_observability_database.journey_step_metrics
WHERE
    timestamp >= NOW() - INTERVAL '1 DAY'
ORDER BY 
    step_number;
`
    },
    slaCompliance: {
      title: 'SLA Compliance Details Query',
      description: 'This query should return SLA compliance data for critical services, including historical performance and related incidents.',
      query: `-- This is a placeholder for your Databricks SQL query.
-- Replace this with the actual query that pulls data for the SLA Compliance Detail page.
-- The query should return columns matching the data structure in ObservabilityDataService, such as:
-- name, current, limit, status, complianceHistory (as array/struct), relatedIncidents (as array/struct), etc.

SELECT
    service_name AS name,
    current_latency_ms AS current,
    sla_threshold_ms AS limit,
    sla_status AS status,
    -- The following fields might require complex aggregations or separate queries
    '[]' AS complianceHistory, -- Placeholder for historical data array
    '[]' AS relatedIncidents,  -- Placeholder for related incidents array
    ai_generated_insight AS aiInsight
FROM
    your_observability_database.sla_compliance_status
WHERE
    is_critical_service = TRUE
ORDER BY
    service_name;
`
    }
  });

  getConfigs() {
    return this.configs.asReadonly();
  }
}