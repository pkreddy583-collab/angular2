import { Injectable, signal, computed } from '@angular/core';
import { EmailLog } from '../models/compliance.model';

// Helper to create mock dates
const createDate = (dayOffset: number, hour: number, minute: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// EOD deadline is 18:00 (6 PM) local time
const EOD_DEADLINE_HOUR = 18;

const MOCK_EMAIL_LOGS: EmailLog[] = [
  { id: 1, timestamp: createDate(1, 17, 45), portfolioId: 'portfolio-1', portfolioName: 'Core Services', type: 'EOD', recipients: 'offshore-team@example.com', subject: 'EOD Handover: Core Services T-1', status: 'On Time' },
  { id: 2, timestamp: createDate(1, 18, 15), portfolioId: 'portfolio-3', portfolioName: 'Public Facing', type: 'EOD', recipients: 'offshore-team@example.com', subject: 'EOD Handover: Public Facing T-1', status: 'Late' },
  // Missing log for portfolio-2 on T-1
  { id: 3, timestamp: createDate(2, 17, 30), portfolioId: 'portfolio-1', portfolioName: 'Core Services', type: 'EOD', recipients: 'offshore-team@example.com', subject: 'EOD Handover: Core Services T-2', status: 'On Time' },
  { id: 4, timestamp: createDate(2, 17, 55), portfolioId: 'portfolio-2', portfolioName: 'Finance & HR', type: 'EOD', recipients: 'offshore-team@example.com', subject: 'EOD Handover: Finance & HR T-2', status: 'On Time' },
  { id: 5, timestamp: createDate(2, 17, 50), portfolioId: 'portfolio-3', portfolioName: 'Public Facing', type: 'EOD', recipients: 'offshore-team@example.com', subject: 'EOD Handover: Public Facing T-2', status: 'On Time' },
];

@Injectable({
  providedIn: 'root',
})
export class ComplianceService {
  private _emailLogs = signal<EmailLog[]>(MOCK_EMAIL_LOGS);
  emailLogs = this._emailLogs.asReadonly();

  compliancePercentage = computed(() => {
    const logs = this.emailLogs();
    if (logs.length === 0) return 100;

    const onTimeCount = logs.filter(log => log.status === 'On Time').length;
    // Note: A real compliance score might be more complex (e.g., factoring in 'Missed' days)
    // For this dashboard, we'll use a simple on-time percentage of sent emails.
    return (onTimeCount / logs.length) * 100;
  });

  logEmail(logDetails: Omit<EmailLog, 'id' | 'timestamp' | 'status'>): void {
    this._emailLogs.update(logs => {
      const now = new Date();
      const status: 'On Time' | 'Late' = now.getHours() < EOD_DEADLINE_HOUR ? 'On Time' : 'Late';
      
      const newLog: EmailLog = {
        ...logDetails,
        id: logs.length + 1,
        timestamp: now,
        status: status,
      };

      return [newLog, ...logs];
    });
  }
}
