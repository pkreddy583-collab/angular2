import { Injectable, signal } from '@angular/core';
import { ControlMJob } from '../models/controlm.model';

@Injectable({
  providedIn: 'root',
})
export class ControlmService {
  private _failedJobs = signal<ControlMJob[]>(
    (() => {
      const now = new Date();
      return [
        {
          id: 'JOB-001-ORA',
          name: 'ORA_FIN_DAILY_CLOSE',
          application: 'Oracle Financials',
          status: 'Failed' as const,
          startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
          endTime: new Date(now.getTime() - 58 * 60 * 1000),
          errorMessage: 'ORA-01017: invalid username/password; logon denied',
          logOutput: `
Connecting to database: ORCL_PROD...
Executing script: /jobs/scripts/daily_close.sql
...
ERROR at line 1:
ORA-01017: invalid username/password; logon denied

Job failed.
`,
        },
        {
          id: 'JOB-002-ETL',
          name: 'ETL_LOAD_SALES_DATA',
          application: 'Data Warehouse',
          status: 'Failed' as const,
          startTime: new Date(now.getTime() - 35 * 60 * 1000), // 35 minutes ago
          endTime: new Date(now.getTime() - 34 * 60 * 1000),
          errorMessage: 'File not found: /mnt/etl_source/sales_data_20240726.csv',
          logOutput: `
Starting ETL process...
Source directory: /mnt/etl_source/
Looking for file pattern: sales_data_*.csv
Error: File not found: /mnt/etl_source/sales_data_20240726.csv
Process terminated.
`,
        },
        {
          id: 'JOB-003-RPT',
          name: 'RPT_GEN_QUARTERLY_SUMMARY',
          application: 'Reporting Services',
          status: 'Failed' as const,
          startTime: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
          endTime: new Date(now.getTime() - 14 * 60 * 1000),
          errorMessage: 'ORA-00942: table or view does not exist',
          logOutput: `
Generating Quarterly Summary Report...
Connecting to reporting database: RPT_DB
Executing query: SELECT * FROM V_QUARTERLY_SALES_SUMMARY;
...
ORA-00942: table or view does not exist
Query failed. Report generation aborted.
`,
        },
        {
          id: 'JOB-004-BKP',
          name: 'DB_BACKUP_CRM',
          application: 'Database Maintenance',
          status: 'Failed' as const,
          startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          errorMessage: 'Process timed out after 60 minutes.',
          logOutput: `
Starting backup for CRM database...
RMAN> backup database plus archivelog;
Starting backup at 26-JUL-24
...
channel ORA_DISK_1: starting piece 1 at 26-JUL-24
channel ORA_DISK_1: finished piece 1 at 26-JUL-24
piece handle=/u01/app/oracle/backup/crm_df_1.bkp
...
(many more lines)
...
Backup appears to be stalled.
Monitoring process...
Error: Process timed out after 60 minutes.
Terminating backup job.
`,
        },
      ].sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    })()
  );

  getFailedJobs() {
    return this._failedJobs.asReadonly();
  }
}
