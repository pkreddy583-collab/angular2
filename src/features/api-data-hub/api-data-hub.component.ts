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
  activeSection = signal<string>('commandCenter');
  activeTab = signal<{ [key: string]: string }>({
    commandCenter: 'guide',
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
  activeIngestionSource = signal<'servicenow' | 'databricks'>('servicenow');

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
  commandCenterSample = computed(() => ({
    "portfolios": [
      { "id": "msp", "name": "Member & Provider Services" },
      { "id": "fco", "name": "Financial & Core Operations" }
    ],
    "topKpis": [
      {"value": "95.5%", "label": "Resolution SLA"},
      {"value": "92Hrs", "label": "Avg TAT"},
      {"value": "111%", "label": "BMI"},
      {"value": "85.29%", "label": "FTR"}
    ],
    "mainKpis": {
      "totalLogged": "3,024",
      "totalResolved": "3,622",
      "reopenedTickets": "2",
      "openTickets": "6,769",
      "achievement": "753"
    },
    "lineChartData": {
      "labels": ["Sep 21", "Sep 22", "Sep 23", "Sep 24", "Sep 25", "Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30"],
      "datasets": [
        { "label": "Logged", "color": "#3b82f6", "data": [4008, 4010, 4082, 2984, 3874, 3490, 4241, 4506, 3622, 3024] },
        { "label": "Resolved", "color": "#22c55e", "data": [4712, 3713, 3713, 4304, 3573, 6377, 5689, 4993, 4015, 3622] },
        { "label": "Open Tickets", "color": "#f97316", "data": [4088, 4019, 3914, 4304, 3874, 6377, 8448, 7938, 6674, 6769] }
      ]
    },
    "pieDataLevelWise": [
      { "name": "Level 1", "value": 3274, "label": "3274 (48%)" },
      { "name": "Level 2", "value": 3150, "label": "3150 (47%)" },
      { "name": "Level 3", "value": 343, "label": "343 (5%)" }
    ],
    "pieDataUnresolved": [
      { "name": "Pending", "value": 956, "label": "956 (32%)" },
      { "name": "Assigned To", "value": 1573, "label": "1573 (53%)" },
      { "name": "Open", "value": 227, "label": "227 (8%)" }
    ],
    "unresolvedMetrics": { "p3": 23, "p4": 52, "openState": 0, "assignedState": 1505 },
    "effectiveness": { "auto": "4%", "l1": "71%", "l2": "21%", "l3": "4%" },
    "allGrids": {
      "ticketSeverity": [
        { "stream": "Sales", "urgent": 7, "high": 4, "medHigh": 285, "medium": 4196 },
        { "stream": "Enrolment", "urgent": 11, "high": 14, "medHigh": 261, "medium": 1712 }
      ],
      "openTicketTrend": [
        { "name": "Sales", "values": [3926, 4300, 5264, 2101, 3813, 2419] },
        { "name": "Enrolment", "values": [1887, 1543, 1725, 1032, 1606, 934] }
      ],
      "unresolvedApplicationTrend": [
        { "name": "CRM", "openTickets": 258, "l1": 0, "l2": 100, "l3": 0, "assignedTo": 80, "open": 0, "pending": 178 },
        { "name": "Producer", "openTickets": 188, "l1": 17, "l2": 83, "l3": 0, "assignedTo": 20, "open": 0, "pending": 156 }
      ]
    }
  }));
  
  commandCenterSampleTables = `
-----------------------------------------
-- Fact_KPIDaily_ByPortfolio (Sample) --
-----------------------------------------
SummaryDate | PortfolioId | TicketsLogged | ResolutionSLA | AvgTAT_Hours | BMI   | FTR
2025-09-30  | msp         | 1834          | 96.2          | 85.5         | 110.5 | 88.1
2025-09-30  | fco         | 1190          | 94.8          | 98.1         | 105.2 | 82.4

-------------------------------------------
-- Fact_TrendDaily_ByDimension (Sample) --
-------------------------------------------
SummaryDate | DimensionType | DimensionName | LoggedCount | ResolvedCount | OpenCount
2025-09-30  | ValueStream   | Sales         | 1697        | 1850          | 3926
2025-09-29  | ValueStream   | Sales         | 2231        | 2105          | 4300
2025-09-30  | Application   | CRM           | 73          | 85            | 258

-----------------------------------------
--       Audit_TableUpdates (Sample)   --
-----------------------------------------
TableName                       | UpdateTimestamp         | Status    | RecordsAffected
usp_ConsolidateServiceNowData   | 2025-10-01 02:05:15.123 | Success   | 5843
  `;

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
  
  selectIngestionSource(source: 'servicenow' | 'databricks') {
    this.activeIngestionSource.set(source);
  }

  // --- Ops Command Center ---
  commandCenterGuide = `
### 1. Set up the Database
- Execute the DDL script from the **Database Schema** tab in your MS SQL Server instance to create all tables.
- This includes staging tables for raw data, dimension tables for your organizational structure (portfolios, apps), and fact tables where pre-calculated daily metrics are stored. This model ensures the dashboard loads quickly.

### 2. Configure & Run the Ingestion Script
- Choose your data source (ServiceNow or Databricks) from the **Ingestion Script** tab.
- Set up the Python script in an environment that can run on a schedule (e.g., a server with cron, a container, or an orchestration tool like Airflow).
- Configure the required environment variables (database credentials, source API keys, etc.) as described in the script's comments.
- Run the script once manually to perform the initial data load, then schedule it to run hourly for incremental updates.

### 3. Schedule the Consolidation Stored Procedure
- The \`usp_ConsolidateServiceNowData\` procedure (from the **Consolidation Logic** tab) does the heavy lifting. It transforms raw staging data into performant, aggregated fact tables. It calculates every KPI for each portfolio.
- Schedule this stored procedure to run **once daily** in your MS SQL Server (e.g., using SQL Server Agent). It should run after business hours to process the completed day's data.
- The procedure also logs its execution to the \`Audit_TableUpdates\` table, giving you a history of all data processing jobs.

### 4. Implement the Backend API
- Create a backend API endpoint (e.g., \`GET /api/command-center\`).
- This endpoint should execute the \`usp_GetCommandCenterDashboardData\` stored procedure (from the **API Logic** tab).
- The procedure accepts a \`@PortfolioId\` parameter, which you should pass from a query string in your API request (e.g., \`/api/command-center?portfolio=msp\`).
- The stored procedure returns a single column containing the complete JSON payload. Your API should return this JSON string directly to the frontend.
  `;
  
  commandCenterIngestionServiceNow = `import os
import requests
import pyodbc
from datetime import datetime, timedelta

# --- Configuration ---
# Load from environment variables for security
SNOW_INSTANCE = os.environ.get("SNOW_INSTANCE") # e.g., "yourinstance.service-now.com"
SNOW_USER = os.environ.get("SNOW_USER")
SNOW_PASSWORD = os.environ.get("SNOW_PASSWORD")
DB_SERVER = os.environ.get("DB_SERVER")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")

# File to store the last run timestamp
LAST_RUN_FILE = "last_run_timestamp.txt"

def get_last_run_time():
    """Reads the timestamp of the last successful run."""
    try:
        with open(LAST_RUN_FILE, "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        # If the file doesn't exist, go back 7 days for the initial load
        return (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

def save_last_run_time(timestamp):
    """Saves the timestamp for the current run."""
    with open(LAST_RUN_FILE, "w") as f:
        f.write(timestamp)

def fetch_servicenow_data(last_run_time):
    """Fetches incremental ticket data from the ServiceNow Table API."""
    all_records = []
    offset = 0
    limit = 1000  # Max records per page

    query = f"sys_updated_on>javascript:gs.dateGenerate('{last_run_time}','yyyy-MM-dd HH:mm:ss')"
    
    # IMPORTANT: Add any other fields required for your KPI calculations.
    fields = "sys_id,number,state,priority,assignment_group,u_resolved_by_assignment_group,opened_at,resolved_at,sys_updated_on,u_value_stream,u_application,reopen_count,reassignment_count,made_sla"

    url = f"https://{SNOW_INSTANCE}/api/now/table/incident"
    print(f"Fetching records updated since {last_run_time}...")

    while True:
        params = { "sysparm_query": query, "sysparm_fields": fields, "sysparm_limit": limit, "sysparm_offset": offset }
        response = requests.get(url, auth=(SNOW_USER, SNOW_PASSWORD), params=params)
        response.raise_for_status() 
        
        records = response.json().get("result", [])
        if not records:
            break 
        
        all_records.extend(records)
        offset += limit
        print(f"Fetched {len(all_records)} records...")

    return all_records

def upsert_to_database(records):
    """Connects to the Smart Database and performs a MERGE operation."""
    conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD}"
    
    with pyodbc.connect(conn_str) as cnxn:
        cursor = cnxn.cursor()
        
        merge_sql = """
        MERGE Staging_ServiceNow_Tickets AS T
        USING (VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)) 
               AS S (SysId, Number, State, Priority, AssignmentGroupName, ResolvedByAssignmentGroup, OpenedAt, ResolvedAt, SysUpdatedOn, ValueStream, Application, ReassignmentCount, MadeSLA, ReopenCount)
        ON (T.SysId = S.SysId)
        WHEN MATCHED AND T.SysUpdatedOn < S.SysUpdatedOn THEN
            UPDATE SET
                T.State = S.State,
                T.Priority = S.Priority,
                T.AssignmentGroupName = S.AssignmentGroupName,
                T.ResolvedByAssignmentGroup = S.ResolvedByAssignmentGroup,
                T.ResolvedAt = S.ResolvedAt,
                T.SysUpdatedOn = S.SysUpdatedOn,
                T.ReassignmentCount = S.ReassignmentCount,
                T.MadeSLA = S.MadeSLA,
                -- If ReopenCount increases, it's a reopen event
                T.ReopenedAt = CASE WHEN ISNULL(T.ReopenCount, 0) < ISNULL(S.ReopenCount, 0) THEN S.SysUpdatedOn ELSE T.ReopenedAt END,
                T.ReopenCount = S.ReopenCount
        WHEN NOT MATCHED THEN
            INSERT (SysId, Number, State, Priority, AssignmentGroupName, ResolvedByAssignmentGroup, OpenedAt, ResolvedAt, SysUpdatedOn, ValueStream, Application, ReassignmentCount, MadeSLA, ReopenCount)
            VALUES (S.SysId, S.Number, S.State, S.Priority, S.AssignmentGroupName, S.ResolvedByAssignmentGroup, S.OpenedAt, S.ResolvedAt, S.SysUpdatedOn, S.ValueStream, S.Application, S.ReassignmentCount, S.MadeSLA, S.ReopenCount);
        """
        
        for record in records:
            # Helper to safely extract linked display values
            def get_display_value(data, key):
                field = data.get(key)
                return field.get('display_value') if isinstance(field, dict) else field

            params = (
                record.get('sys_id'), record.get('number'), record.get('state'), record.get('priority'),
                get_display_value(record, 'assignment_group'),
                get_display_value(record, 'u_resolved_by_assignment_group'),
                record.get('opened_at'), record.get('resolved_at'), record.get('sys_updated_on'),
                record.get('u_value_stream'), record.get('u_application'),
                int(record.get('reassignment_count', '0')),
                record.get('made_sla') == 'true',
                int(record.get('reopen_count', '0'))
            )
            cursor.execute(merge_sql, params)
        
        cnxn.commit()
        print(f"Merged {len(records)} records into the staging table.")


if __name__ == "__main__":
    start_time = datetime.utcnow()
    last_run = get_last_run_time()
    
    try:
        new_records = fetch_servicenow_data(last_run)
        if new_records:
            upsert_to_database(new_records)
        else:
            print("No new records to process.")
        
        save_last_run_time(start_time.strftime("%Y-%m-%d %H:%M:%S"))
        print("Process completed successfully.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
`;

  commandCenterIngestionDatabricks = `import os
import pyodbc
from databricks import sql
from datetime import datetime, timedelta

# --- Configuration ---
DBRICKS_SERVER_HOSTNAME = os.environ.get("DBRICKS_SERVER_HOSTNAME")
DBRICKS_HTTP_PATH = os.environ.get("DBRICKS_HTTP_PATH")
DBRICKS_TOKEN = os.environ.get("DBRICKS_TOKEN")
DB_SERVER = os.environ.get("DB_SERVER")
# ... other MS SQL connection details

LAST_RUN_FILE = "last_run_timestamp_databricks.txt"
# ... (get_last_run_time and save_last_run_time functions are the same)

def fetch_databricks_data(last_run_time):
    """Fetches incremental ticket data from a Databricks SQL Warehouse."""
    
    query = f"""
    SELECT 
      SysId, Number, State, Priority, AssignmentGroupName, ResolvedByAssignmentGroup, OpenedAt, 
      ResolvedAt, ReopenedAt, SysUpdatedOn, ValueStream, Application, ReassignmentCount, MadeSLA, ReopenCount
    FROM your_catalog.your_schema.refined_tickets
    WHERE SysUpdatedOn > '{last_run_time}'
    """
    
    with sql.connect(
        server_hostname=DBRICKS_SERVER_HOSTNAME,
        http_path=DBRICKS_HTTP_PATH,
        access_token=DBRICKS_TOKEN
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchall()
            return result # Returns a list of rows

def bulk_upsert_to_database(rows):
    """Bulk loads data into a temp table and merges it."""
    conn_str = f"..."
    
    with pyodbc.connect(conn_str) as cnxn:
        cursor = cnxn.cursor()
        
        # Create a temporary table with the same structure as Staging_ServiceNow_Tickets
        cursor.execute("CREATE TABLE #TempTickets (...)")

        # Use fast_executemany for high-performance bulk insert
        cursor.fast_executemany = True
        insert_sql = "INSERT INTO #TempTickets (...) VALUES (?, ?, ...)"
        cursor.executemany(insert_sql, [tuple(row) for row in rows])

        # Perform the MERGE from the temp table (same as ServiceNow version)
        merge_sql = "MERGE Staging_ServiceNow_Tickets AS T USING #TempTickets AS S ON T.SysId = S.SysId WHEN MATCHED THEN UPDATE SET ... WHEN NOT MATCHED THEN INSERT ..."
        cursor.execute(merge_sql)
        cnxn.commit()
        print(f"Merged {cursor.rowcount} rows.")

if __name__ == "__main__":
    # ... main execution logic is the same ...
`;

  commandCenterDdl = `-- =============================================
-- Author:      IT Operations Hub AI
-- Create date: 2025-10-02
-- Description: Complete production-grade schema for the Ops Command Center.
-- =============================================

-- =========================================================================================
-- 1. DIMENSION & CONFIGURATION TABLES
-- =========================================================================================
CREATE TABLE Dim_Portfolio (
    PortfolioId         VARCHAR(50) PRIMARY KEY,
    PortfolioName       VARCHAR(100) NOT NULL UNIQUE,
    ManagerName         VARCHAR(100),
    LeadName            VARCHAR(100)
);

CREATE TABLE Dim_Application (
    ApplicationName     VARCHAR(255) PRIMARY KEY,
    PortfolioId         VARCHAR(50),
    FOREIGN KEY (PortfolioId) REFERENCES Dim_Portfolio(PortfolioId)
);

CREATE TABLE Dim_SupportGroup (
    GroupName           VARCHAR(100) PRIMARY KEY,
    SupportLevel        VARCHAR(10) NOT NULL -- 'L1', 'L2', 'L3', 'Auto'
);

-- =========================================================================================
-- 2. STAGING TABLE (Raw data from ingestion)
-- =========================================================================================
CREATE TABLE Staging_ServiceNow_Tickets (
    SysId                     VARCHAR(32) PRIMARY KEY NOT NULL,
    Number                    VARCHAR(50),
    State                     VARCHAR(50), 
    Priority                  VARCHAR(50),
    AssignmentGroupName       VARCHAR(255),
    ResolvedByAssignmentGroup VARCHAR(255),
    OpenedAt                  DATETIME,
    ResolvedAt                DATETIME,
    ReopenedAt                DATETIME,
    SysUpdatedOn              DATETIME,
    ValueStream               VARCHAR(255),
    Application               VARCHAR(255),
    ReassignmentCount         INT,
    ReopenCount               INT,
    MadeSLA                   BIT
);

-- =========================================================================================
-- 3. FACT & SNAPSHOT TABLES (Aggregated data, populated daily by consolidation)
-- =========================================================================================
CREATE TABLE Fact_KPIDaily_ByPortfolio (
    SummaryDate         DATE,
    PortfolioId         VARCHAR(50),
    TicketsLogged       INT,
    TicketsResolved     INT,
    TicketsReopened     INT,
    SameDayResolved     INT,
    ResolutionSLA       DECIMAL(5, 2),
    AvgTAT_Hours        DECIMAL(10, 2),
    BMI                 DECIMAL(5, 2), -- Backlog Management Index
    FTR                 DECIMAL(5, 2), -- First Time Resolution
    EffectivenessAuto   DECIMAL(5, 2),
    EffectivenessL1     DECIMAL(5, 2),
    EffectivenessL2     DECIMAL(5, 2),
    EffectivenessL3     DECIMAL(5, 2),
    PRIMARY KEY (SummaryDate, PortfolioId),
    FOREIGN KEY (PortfolioId) REFERENCES Dim_Portfolio(PortfolioId)
);

CREATE TABLE Fact_AgingDaily_ByPortfolio (
    SummaryDate         DATE,
    PortfolioId         VARCHAR(50),
    AgeBucket           VARCHAR(20), -- e.g., '0-1 day', '1-3 days'
    TicketCount         INT,
    PRIMARY KEY (SummaryDate, PortfolioId, AgeBucket),
    FOREIGN KEY (PortfolioId) REFERENCES Dim_Portfolio(PortfolioId)
);

CREATE TABLE Fact_Ticket_History (
    HistoryDate         DATE PRIMARY KEY,
    TicketsLogged       INT,
    TicketsResolved     INT,
    OpenTickets         INT
);

CREATE TABLE Fact_TrendDaily_ByDimension (
    SummaryDate       DATE,
    DimensionType     VARCHAR(50), -- 'ValueStream' or 'Application'
    DimensionName     VARCHAR(255),
    LoggedCount       INT,
    ResolvedCount     INT,
    OpenCount         INT,
    PRIMARY KEY (SummaryDate, DimensionType, DimensionName)
);

CREATE TABLE Snap_UnresolvedTickets (
    TicketId              VARCHAR(50) PRIMARY KEY,
    ApplicationName       VARCHAR(255),
    ValueStream           VARCHAR(255),
    PortfolioId           VARCHAR(50),
    AgeDays               INT,
    Priority              VARCHAR(10),
    Status                VARCHAR(100), 
    TicketLevel           VARCHAR(20)
);

-- =========================================================================================
-- 4. AUDIT TABLE (For tracking data pipeline execution)
-- =========================================================================================
CREATE TABLE Audit_TableUpdates (
    AuditId             INT PRIMARY KEY IDENTITY,
    ProcedureName       VARCHAR(128) NOT NULL,
    UpdateTimestamp     DATETIME DEFAULT GETDATE(),
    Status              VARCHAR(20) NOT NULL,
    RecordsAffected     INT,
    DurationSeconds     INT,
    MessageText         VARCHAR(MAX)
);
`;
  
  commandCenterConsolidationSp = `CREATE OR ALTER PROCEDURE usp_ConsolidateServiceNowData
    @SummaryDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @StartTime DATETIME = GETDATE(), @RecordsAffected INT = 0, @Message VARCHAR(MAX);

    BEGIN TRY
        DECLARE @StartDate DATETIME = CAST(@SummaryDate AS DATETIME);
        DECLARE @EndDate DATETIME = DATEADD(day, 1, @StartDate);
        
        -- Idempotency: Clean up previous data for this date
        DELETE FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @SummaryDate;
        DELETE FROM Fact_AgingDaily_ByPortfolio WHERE SummaryDate = @SummaryDate;
        DELETE FROM Fact_TrendDaily_ByDimension WHERE SummaryDate = @SummaryDate;

        -- 1. Sync Dimension Tables (Portfolio, Application)
        MERGE Dim_Portfolio AS T USING (SELECT DISTINCT ValueStream FROM Staging_ServiceNow_Tickets WHERE ValueStream IS NOT NULL) AS S ON T.PortfolioName = S.ValueStream
        WHEN NOT MATCHED THEN INSERT (PortfolioId, PortfolioName) VALUES (LOWER(REPLACE(S.ValueStream, ' ', '')), S.ValueStream);

        MERGE Dim_Application AS T USING (SELECT DISTINCT Application, ValueStream FROM Staging_ServiceNow_Tickets WHERE Application IS NOT NULL) AS S
        ON T.ApplicationName = S.Application
        WHEN NOT MATCHED THEN INSERT (ApplicationName, PortfolioId) VALUES (S.Application, (SELECT PortfolioId FROM Dim_Portfolio WHERE PortfolioName = S.ValueStream));

        -- 2. Unresolved Snapshot (core data for many calculations)
        TRUNCATE TABLE Snap_UnresolvedTickets;
        INSERT INTO Snap_UnresolvedTickets (TicketId, ApplicationName, ValueStream, PortfolioId, AgeDays, Priority, Status, TicketLevel)
        SELECT s.Number, s.Application, s.ValueStream, da.PortfolioId, DATEDIFF(day, s.OpenedAt, @SummaryDate), s.Priority, s.State,
               CASE WHEN s.AssignmentGroupName LIKE '%L1%' THEN 'Level 1' WHEN s.AssignmentGroupName LIKE '%L2%' THEN 'Level 2' WHEN s.AssignmentGroupName LIKE '%L3%' THEN 'Level 3' ELSE 'Unknown' END
        FROM Staging_ServiceNow_Tickets s LEFT JOIN Dim_Application da ON s.Application = da.ApplicationName
        WHERE s.State NOT IN ('Resolved', 'Closed', 'Cancelled');
        SET @RecordsAffected = @RecordsAffected + @@ROWCOUNT;

        -- 3. History Table (for main line chart)
        MERGE Fact_Ticket_History AS T
        USING (SELECT @SummaryDate, COUNT(CASE WHEN OpenedAt >= @StartDate AND OpenedAt < @EndDate THEN 1 END), COUNT(CASE WHEN ResolvedAt >= @StartDate AND ResolvedAt < @EndDate THEN 1 END), (SELECT COUNT(*) FROM Snap_UnresolvedTickets) FROM Staging_ServiceNow_Tickets) AS S (d, l, r, o)
        ON T.HistoryDate = S.d
        WHEN MATCHED THEN UPDATE SET TicketsLogged = S.l, TicketsResolved = S.r, OpenTickets = S.o
        WHEN NOT MATCHED THEN INSERT (HistoryDate, TicketsLogged, TicketsResolved, OpenTickets) VALUES (S.d, S.l, S.r, S.o);

        -- 4. KPIs by Portfolio
        INSERT INTO Fact_KPIDaily_ByPortfolio (SummaryDate, PortfolioId, TicketsLogged, TicketsResolved, TicketsReopened, SameDayResolved, ResolutionSLA, AvgTAT_Hours, BMI, FTR, EffectivenessAuto, EffectivenessL1, EffectivenessL2, EffectivenessL3)
        SELECT @SummaryDate, p.PortfolioId,
            COUNT(CASE WHEN s.OpenedAt >= @StartDate AND s.OpenedAt < @EndDate THEN 1 END) AS Logged,
            COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END) AS Resolved,
            COUNT(CASE WHEN s.ReopenedAt >= @StartDate AND s.ReopenedAt < @EndDate THEN 1 END) AS Reopened,
            COUNT(CASE WHEN s.OpenedAt >= @StartDate AND s.OpenedAt < @EndDate AND s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END) AS SameDay,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND s.MadeSLA = 1 THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS ResSLA,
            AVG(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN CAST(DATEDIFF(hour, s.OpenedAt, s.ResolvedAt) AS FLOAT) END) AS AvgTAT,
            (CAST(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.OpenedAt >= @StartDate AND s.OpenedAt < @EndDate THEN 1 END), 0) AS BMI,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND ISNULL(s.ReassignmentCount, 0) = 0 THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS FTR,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND s.ResolvedByAssignmentGroup LIKE '%Auto%' THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS EffAuto,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND s.ResolvedByAssignmentGroup LIKE '%L1%' THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS EffL1,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND s.ResolvedByAssignmentGroup LIKE '%L2%' THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS EffL2,
            (CAST(SUM(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate AND s.ResolvedByAssignmentGroup LIKE '%L3%' THEN 1 ELSE 0 END) AS FLOAT) * 100.0) / NULLIF(COUNT(CASE WHEN s.ResolvedAt >= @StartDate AND s.ResolvedAt < @EndDate THEN 1 END), 0) AS EffL3
        FROM Dim_Portfolio p JOIN Dim_Application a ON p.PortfolioId = a.PortfolioId JOIN Staging_ServiceNow_Tickets s ON a.ApplicationName = s.Application
        GROUP BY p.PortfolioId;
        SET @RecordsAffected = @RecordsAffected + @@ROWCOUNT;

        -- 5. Daily Trend Data by Dimension
        INSERT INTO Fact_TrendDaily_ByDimension(SummaryDate, DimensionType, DimensionName, LoggedCount, ResolvedCount, OpenCount)
        SELECT @SummaryDate, 'ValueStream', ValueStream, COUNT(CASE WHEN OpenedAt >= @StartDate AND OpenedAt < @EndDate THEN 1 END), COUNT(CASE WHEN ResolvedAt >= @StartDate AND ResolvedAt < @EndDate THEN 1 END), COUNT(CASE WHEN State NOT IN ('Resolved','Closed','Cancelled') THEN 1 END) FROM Staging_ServiceNow_Tickets WHERE ValueStream IS NOT NULL GROUP BY ValueStream
        UNION ALL
        SELECT @SummaryDate, 'Application', Application, COUNT(CASE WHEN OpenedAt >= @StartDate AND OpenedAt < @EndDate THEN 1 END), COUNT(CASE WHEN ResolvedAt >= @StartDate AND ResolvedAt < @EndDate THEN 1 END), COUNT(CASE WHEN State NOT IN ('Resolved','Closed','Cancelled') THEN 1 END) FROM Staging_ServiceNow_Tickets WHERE Application IS NOT NULL GROUP BY Application;
        SET @RecordsAffected = @RecordsAffected + @@ROWCOUNT;

        -- 6. Aging Buckets
        INSERT INTO Fact_AgingDaily_ByPortfolio (SummaryDate, PortfolioId, AgeBucket, TicketCount)
        SELECT @SummaryDate, PortfolioId, CASE WHEN AgeDays <= 1 THEN '0-1 day' WHEN AgeDays <= 3 THEN '1-3 days' WHEN AgeDays <= 5 THEN '3-5 days' WHEN AgeDays <= 10 THEN '5-10 days' WHEN AgeDays <= 30 THEN '10-30 days' ELSE '>30 days' END, COUNT(*)
        FROM Snap_UnresolvedTickets WHERE PortfolioId IS NOT NULL
        GROUP BY PortfolioId, CASE WHEN AgeDays <= 1 THEN '0-1 day' WHEN AgeDays <= 3 THEN '1-3 days' WHEN AgeDays <= 5 THEN '3-5 days' WHEN AgeDays <= 10 THEN '5-10 days' WHEN AgeDays <= 30 THEN '10-30 days' ELSE '>30 days' END;
        SET @RecordsAffected = @RecordsAffected + @@ROWCOUNT;

        -- Log success
        SET @Message = 'Successfully consolidated data for ' + CONVERT(VARCHAR, @SummaryDate);
        INSERT INTO Audit_TableUpdates (ProcedureName, Status, RecordsAffected, DurationSeconds, MessageText)
        VALUES ('usp_ConsolidateServiceNowData', 'Success', @RecordsAffected, DATEDIFF(second, @StartTime, GETDATE()), @Message);

    END TRY
    BEGIN CATCH
        SET @Message = 'Failed to consolidate data. Error: ' + ERROR_MESSAGE();
        INSERT INTO Audit_TableUpdates (ProcedureName, Status, DurationSeconds, MessageText)
        VALUES ('usp_ConsolidateServiceNowData', 'Failed', DATEDIFF(second, @StartTime, GETDATE()), @Message);
        THROW; -- Re-throw error to calling process
    END CATCH
END;
GO`;

  commandCenterApiSp = `CREATE OR ALTER PROCEDURE usp_GetCommandCenterDashboardData
    @PortfolioId VARCHAR(50) = NULL -- NULL or 'all' means no filter
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = (SELECT MAX(SummaryDate) FROM Fact_KPIDaily_ByPortfolio);
    DECLARE @PortfolioFilterId VARCHAR(50) = CASE WHEN @PortfolioId = 'all' THEN NULL ELSE @PortfolioId END;
    
    -- This single SELECT statement builds the entire JSON payload.
    SELECT (
        SELECT
            -- 1. Portfolio Slicer Data
            (SELECT PortfolioId AS id, PortfolioName AS name FROM Dim_Portfolio FOR JSON PATH) AS portfolios,

            -- 2. Top KPIs (system-wide aggregates)
            (SELECT
                (SELECT FORMAT(AVG(ResolutionSLA), 'N1') + '%' AS value, 'Resolution SLA' as label FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                (SELECT FORMAT(AVG(AvgTAT_Hours), 'N0') + 'Hrs' AS value, 'Avg TAT' as label FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                (SELECT FORMAT(AVG(BMI), 'N0') + '%' AS value, 'BMI' as label FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                (SELECT FORMAT(AVG(FTR), 'N2') + '%' AS value, 'FTR' as label FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
            FOR JSON PATH) AS topKpis,

            -- 3. Main KPIs (FILTERED by portfolio)
            (SELECT 
                FORMAT(ISNULL(SUM(TicketsLogged), 0), '#,##0') AS totalLogged,
                FORMAT(ISNULL(SUM(TicketsResolved), 0), '#,##0') AS totalResolved,
                FORMAT(ISNULL(SUM(TicketsReopened), 0), '#,##0') AS reopenedTickets,
                (SELECT FORMAT(COUNT(*), '#,##0') FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS openTickets,
                FORMAT(ISNULL(SUM(SameDayResolved), 0), '#,##0') AS achievement
            FROM Fact_KPIDaily_ByPortfolio
            WHERE SummaryDate = @Today AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) as mainKpis,

            -- 4. Line Chart Data (system-wide)
            (SELECT
                JSON_QUERY('["' + STRING_AGG(FORMAT(HistoryDate, 'MMM dd'), '","' ORDER BY HistoryDate) + '"]') as labels,
                JSON_QUERY('[' +
                    '{"label":"Logged","color":"#3b82f6","data":[' + STRING_AGG(CAST(ISNULL(TicketsLogged, 0) AS VARCHAR), ',' ORDER BY HistoryDate) + ']},' +
                    '{"label":"Resolved","color":"#22c55e","data":[' + STRING_AGG(CAST(ISNULL(TicketsResolved, 0) AS VARCHAR), ',' ORDER BY HistoryDate) + ']},' +
                    '{"label":"Open Tickets","color":"#f97316","data":[' + STRING_AGG(CAST(ISNULL(OpenTickets, 0) AS VARCHAR), ',' ORDER BY HistoryDate) + ']}' +
                ']') as datasets
            FROM (SELECT TOP 10 * FROM Fact_Ticket_History ORDER BY HistoryDate DESC) AS h
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS lineChartData,
            
            -- 5. Pie Charts (FILTERED by portfolio)
            (SELECT JSON_QUERY((SELECT TicketLevel as name, COUNT(*) as value, CAST(COUNT(*) AS VARCHAR) + ' (' + FORMAT(CAST(COUNT(*) AS FLOAT) * 100 / (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)), 'N0') + '%)' as label FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId) GROUP BY TicketLevel FOR JSON PATH))) AS pieDataLevelWise,
            (SELECT JSON_QUERY((SELECT Status as name, COUNT(*) as value, CAST(COUNT(*) AS VARCHAR) + ' (' + FORMAT(CAST(COUNT(*) AS FLOAT) * 100 / (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)), 'N0') + '%)' as label FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId) GROUP BY Status FOR JSON PATH))) AS pieDataUnresolved,
            
            -- 6. Other KPI cards
            (SELECT
                (SELECT ISNULL(FORMAT(AVG(EffectivenessAuto), 'N0'), '0') + '%' FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS auto,
                (SELECT ISNULL(FORMAT(AVG(EffectivenessL1), 'N0'), '0') + '%' FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS l1,
                (SELECT ISNULL(FORMAT(AVG(EffectivenessL2), 'N0'), '0') + '%' FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS l2,
                (SELECT ISNULL(FORMAT(AVG(EffectivenessL3), 'N0'), '0') + '%' FROM Fact_KPIDaily_ByPortfolio WHERE SummaryDate = @Today AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS l3
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS effectiveness,

            (SELECT
                (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE Priority = '3' AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS p3,
                (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE Priority = '4' AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS p4,
                (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE Status = 'Open' AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS openState,
                (SELECT COUNT(*) FROM Snap_UnresolvedTickets WHERE Status = 'Assigned' AND (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId)) AS assignedState
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS unresolvedMetrics,

            -- 7. All Data Grids (FILTERED by portfolio)
            (SELECT 
                (SELECT JSON_QUERY((
                    SELECT ValueStream AS stream, SUM(CASE WHEN Priority = '1' THEN 1 ELSE 0 END) AS urgent, SUM(CASE WHEN Priority = '2' THEN 1 ELSE 0 END) AS high, SUM(CASE WHEN Priority = '3' THEN 1 ELSE 0 END) AS medHigh, SUM(CASE WHEN Priority = '4' THEN 1 ELSE 0 END) AS medium
                    FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId) GROUP BY ValueStream FOR JSON PATH
                ))) AS ticketSeverity,

                (SELECT JSON_QUERY((
                    SELECT t.DimensionName AS name, JSON_QUERY('[' + STRING_AGG(CAST(t.OpenCount AS VARCHAR), ',') WITHIN GROUP (ORDER BY t.SummaryDate ASC) + ']') AS values
                    FROM (SELECT TOP 60 * FROM Fact_TrendDaily_ByDimension WHERE DimensionType = 'ValueStream' AND (@PortfolioFilterId IS NULL OR DimensionName IN (SELECT ValueStream FROM Dim_Application WHERE PortfolioId = @PortfolioFilterId)) ORDER BY SummaryDate DESC) AS t
                    GROUP BY t.DimensionName FOR JSON PATH
                ))) AS openTicketTrend,
                
                (SELECT JSON_QUERY((
                    SELECT ApplicationName AS name, COUNT(*) AS openTickets,
                           FORMAT(CAST(SUM(CASE WHEN TicketLevel = 'Level 1' THEN 1 ELSE 0 END) AS FLOAT) * 100 / COUNT(*), 'N0') AS l1,
                           FORMAT(CAST(SUM(CASE WHEN TicketLevel = 'Level 2' THEN 1 ELSE 0 END) AS FLOAT) * 100 / COUNT(*), 'N0') AS l2,
                           FORMAT(CAST(SUM(CASE WHEN TicketLevel = 'Level 3' THEN 1 ELSE 0 END) AS FLOAT) * 100 / COUNT(*), 'N0') AS l3,
                           SUM(CASE WHEN Status = 'Assigned' THEN 1 ELSE 0 END) as assignedTo,
                           SUM(CASE WHEN Status = 'Open' THEN 1 ELSE 0 END) as open,
                           SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending
                    FROM Snap_UnresolvedTickets WHERE (@PortfolioFilterId IS NULL OR PortfolioId = @PortfolioFilterId) GROUP BY ApplicationName FOR JSON PATH
                ))) AS unresolvedApplicationTrend

                -- Add similar sub-queries for the other data grids (logged trends) using Fact_TrendDaily_ByDimension
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) as allGrids
            
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    ) AS JsonResult;
END;
GO
`;

  commandCenterApiExample = `
<h3>Endpoint: <code>GET /api/command-center?portfolio=msp</code></h3>
<p>Retrieves the consolidated data payload for the Ops Command Center dashboard. The optional <code>portfolio</code> query parameter filters the data.</p>
<h4>Node.js (Express) with <code>mssql</code> package Example:</h4>
<pre><code class="language-javascript">const express = require('express');
const sql = require('mssql');
const app = express();

const dbConfig = { ... };

app.get('/api/command-center', async (req, res) => {
    const portfolioId = req.query.portfolio || null;
    try {
        await sql.connect(dbConfig);
        const request = new sql.Request();
        if (portfolioId &amp;&amp; portfolioId !== 'all') {
            request.input('PortfolioId', sql.VarChar, portfolioId);
        } else {
            request.input('PortfolioId', sql.VarChar, null);
        }
        const result = await request.execute('usp_GetCommandCenterDashboardData');
        
        if (result.recordset.length > 0 && result.recordset[0].JsonResult) {
            res.setHeader('Content-Type', 'application/json');
            res.send(result.recordset[0].JsonResult);
        } else {
            res.status(404).send({ message: 'No dashboard data found.' });
        }
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).send({ message: 'Error fetching dashboard data.' });
    } finally {
        sql.close();
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
</code></pre>
`;

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
<pre><code>import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const historical_data = "..." // String from SQL query results

const prompt = \`
Act as an SRE data scientist. Based on the following 90-day incident history, forecast the likely incident volume for the next 7 days.
History: \${historical_data}
\`;

const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                prediction: {type: Type.STRING},
                confidence: {type: Type.STRING, enum: ["High", "Medium", "Low"]}
            }
        }
    }
});
const incident_forecast = JSON.parse(response.text);
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
