import { Injectable, signal } from '@angular/core';
import { ChangeKpi, ChangeRequest, ValidationCheck } from '../models/change-management.model';

const createChange = (
  id: string,
  title: string,
  app: string,
  dayOffset: number,
  risk: 'Low' | 'Medium' | 'High',
  status: 'Awaiting Approval' | 'Scheduled' | 'Completed' | 'Rolled Back',
  passValidations: boolean
): ChangeRequest => {
  const deploymentDate = new Date();
  deploymentDate.setDate(deploymentDate.getDate() + dayOffset);
  deploymentDate.setHours(2, 0, 0, 0); // 2 AM

  const validations: ValidationCheck[] = [
    { name: 'Unit Tests Passed', status: passValidations ? 'passed' : 'failed', details: passValidations ? 'All 1,258 tests passed.' : '14 tests failed in payment module.' },
    { name: 'Integration Tests Passed', status: passValidations ? 'passed' : 'passed', details: 'All 87 integration tests passed.' },
    { name: 'Dependency Scan Clear', status: 'passed', details: 'No new critical vulnerabilities found.' },
    { name: 'Deployment Plan Verified', status: 'passed', details: 'Plan matches standard template.' },
  ];

  return {
    id,
    title,
    application: app,
    status,
    risk,
    requestedBy: 'AutoDeploy',
    deploymentDate,
    validations,
    aiRiskSummary: passValidations
      ? 'All automated checks passed. AI analysis of code changes indicates low complexity and no overlap with critical modules. Confidence of success is high.'
      : 'Unit test failures detected in a critical module. AI analysis suggests a high probability of this change introducing a payment processing incident. Manual review is strongly recommended.',
  };
};

@Injectable({
  providedIn: 'root',
})
export class ChangeManagementService {
  private _kpis = signal<ChangeKpi[]>([
    { label: 'Change Success Rate', value: '98.5%', trend: '+0.2%', trendDirection: 'up' },
    { label: 'Change Volume (7d)', value: '142', trend: '+15%', trendDirection: 'up' },
    { label: 'Lead Time for Changes', value: '3.1 days', trend: '-8%', trendDirection: 'down' },
    { label: 'Emergency Changes', value: '4.2%', trend: '-1.5%', trendDirection: 'down' },
  ]);

  private _allChanges = signal<ChangeRequest[]>([
    // Awaiting Approval
    createChange('CHG-001', 'Deploy updated payment gateway certificates', 'Payment Gateway', 2, 'High', 'Awaiting Approval', false),
    createChange('CHG-002', 'Minor UI text update for login page', 'Auth Service', 1, 'Low', 'Awaiting Approval', true),

    // Scheduled for today
    createChange('CHG-003', 'Patch for Log4j vulnerability', 'All Services', 0, 'High', 'Scheduled', true),
    
    // Scheduled for tomorrow
    createChange('CHG-004', 'Schema migration for user profiles DB', 'User Service', 1, 'Medium', 'Scheduled', true),
    
    // Scheduled further out
    createChange('CHG-005', 'Enable new feature flag for beta users', 'Enrollment Hub', 3, 'Low', 'Scheduled', true),
    createChange('CHG-006', 'Upgrade Node.js runtime to v22', 'API Gateway', 4, 'Medium', 'Scheduled', true),

    // Completed
    // FIX: Added missing 'risk' argument to the createChange function call. A hotfix is typically high risk.
    createChange('CHG-007', 'Hotfix for INC-123', 'Reporting Service', -1, 'High', 'Completed', true),
    // FIX: Added missing 'risk' argument to the createChange function call. Dependency updates are medium risk.
    createChange('CHG-008', 'Quarterly dependency updates', 'All Services', -2, 'Medium', 'Completed', true),
    // FIX: Added missing 'risk' argument to the createChange function call. A rollback is typically a low risk action.
    createChange('CHG-009', 'Rollback of failed deployment 5021', 'Auth Service', -3, 'Low', 'Rolled Back', true),
  ]);

  getKpis() {
    return this._kpis.asReadonly();
  }

  getChangesAwaitingApproval() {
    return signal(this._allChanges().filter(c => c.status === 'Awaiting Approval'));
  }

  getUpcomingChanges() {
    return signal(this._allChanges().filter(c => c.status === 'Scheduled'));
  }

  getChangeHistory() {
    return signal(this._allChanges().filter(c => c.status !== 'Awaiting Approval' && c.status !== 'Scheduled'));
  }
}
