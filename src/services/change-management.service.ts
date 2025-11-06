import { Injectable, signal } from '@angular/core';

// Interfaces moved from model file to satisfy prompt constraints
export interface ChangeKpi {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'same';
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  details: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'Awaiting Approval' | 'Scheduled' | 'Completed' | 'Rolled Back';
  risk: 'Low' | 'Medium' | 'High';
  type: 'Standard' | 'Normal' | 'Emergency';
  requestedBy: string;
  application: string;
  deploymentDate: Date;
  validations: ValidationCheck[];
  aiRiskSummary: string;
}

const createChange = (
  id: string,
  title: string,
  app: string,
  dayOffset: number,
  risk: 'Low' | 'Medium' | 'High',
  type: 'Standard' | 'Normal' | 'Emergency',
  status: 'Awaiting Approval' | 'Scheduled' | 'Completed' | 'Rolled Back',
  passValidations: boolean,
  description: string,
  aiSummary?: string
): ChangeRequest => {
  const deploymentDate = new Date();
  deploymentDate.setDate(deploymentDate.getDate() + dayOffset);
  if (status === 'Scheduled' || status === 'Awaiting Approval') {
    deploymentDate.setHours(2, 0, 0, 0); // Future changes at 2 AM
  }

  const validations: ValidationCheck[] = [
    { name: 'Unit Tests Passed', status: passValidations ? 'passed' : 'failed', details: passValidations ? 'All 1,258 tests passed.' : '14 tests failed in payment module.' },
    { name: 'Integration Tests Passed', status: passValidations ? 'passed' : 'passed', details: 'All 87 integration tests passed.' },
    { name: 'Dependency Scan Clear', status: 'passed', details: 'No new critical vulnerabilities found.' },
    { name: 'Deployment Plan Verified', status: 'passed', details: 'Plan matches standard template.' },
  ];

  return {
    id,
    title,
    description,
    application: app,
    status,
    risk,
    type,
    requestedBy: 'AutoDeploy',
    deploymentDate,
    validations,
    aiRiskSummary: aiSummary ?? (passValidations
      ? 'All automated checks passed. AI analysis of code changes indicates low complexity and no overlap with critical modules. Confidence of success is high.'
      : 'Unit test failures detected in a critical module. AI analysis suggests a high probability of this change introducing a payment processing incident. Manual review is strongly recommended.'),
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
    createChange('CHG-001', 'Deploy updated payment gateway certificates', 'Payment Gateway', 2, 'High', 'Normal', 'Awaiting Approval', false, 'Annual renewal of TLS/SSL certificates for *.payments.core.example.com. This is a high-risk change as it affects a critical production service.'),
    createChange('CHG-002', 'Minor UI text update for login page', 'Auth Service', 1, 'Low', 'Standard', 'Awaiting Approval', true, 'Update the welcome message on the main login page as per marketing request T-123. Involves a single content file change.'),

    // Scheduled for today
    createChange('CHG-003', 'Patch for Log4j vulnerability', 'All Services', 0, 'High', 'Emergency', 'Scheduled', true, 'Urgent patch to address a critical security vulnerability (CVE-2024-XXXX) in the Log4j library across all production Java services.'),
    
    // Scheduled for tomorrow
    createChange('CHG-004', 'Schema migration for user profiles DB', 'User Service', 1, 'Medium', 'Normal', 'Scheduled', true, 'Add a new "last_login_ip" column to the user_profiles table. Migration script has been tested in staging.'),
    
    // Scheduled further out
    createChange('CHG-005', 'Enable new feature flag for beta users', 'Enrollment Hub', 3, 'Low', 'Standard', 'Scheduled', true, 'Activate the "new_enrollment_flow_v2" feature flag for users in the internal beta testing group.'),
    createChange('CHG-006', 'Upgrade Node.js runtime to v22', 'API Gateway', 4, 'Medium', 'Normal', 'Scheduled', true, 'Upgrade the underlying Node.js runtime for the API Gateway from v20 to v22. Includes performance and security improvements.'),

    // Completed
    createChange('CHG-007', 'Hotfix for INC-123', 'Reporting Service', -1, 'High', 'Emergency', 'Completed', true, 'Emergency hotfix to correct a data calculation error in the daily financial report that was causing incorrect summaries.'),
    createChange('CHG-008', 'Quarterly dependency updates', 'All Services', -2, 'Medium', 'Normal', 'Completed', true, 'Routine update of all non-major NPM and Maven dependencies across all services to maintain security posture.'),
    createChange('CHG-009', 'Rollback of failed deployment 5021', 'Auth Service', -3, 'Low', 'Normal', 'Rolled Back', true, 'Rolled back the deployment of release 5021 due to an unexpected increase in login latency post-deployment. The issue is being investigated under PRB-002.'),
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