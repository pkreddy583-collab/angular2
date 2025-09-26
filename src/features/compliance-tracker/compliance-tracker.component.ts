import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplianceService } from '../../services/compliance.service';
import { EmailLog } from '../../models/compliance.model';

@Component({
  selector: 'app-compliance-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance-tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceTrackerComponent {
  private complianceService = inject(ComplianceService);

  emailLogs = this.complianceService.emailLogs;
  compliancePercentage = this.complianceService.compliancePercentage;

  getStatusClass(status: EmailLog['status']) {
    switch (status) {
      case 'On Time':
        return 'bg-green-100 text-green-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Missed':
        return 'bg-red-100 text-red-800';
    }
  }
}
