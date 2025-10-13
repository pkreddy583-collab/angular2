import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RiskService } from '../../services/risk.service';
import { Risk } from '../../models/risk.model';

@Component({
  selector: 'app-risk-management',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './risk-management.component.html',
  styleUrls: ['./risk-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskManagementComponent {
  private riskService = inject(RiskService);
  
  newRisks = computed(() => this.riskService.getRisksByStatus('New'));
  underReviewRisks = computed(() => this.riskService.getRisksByStatus('Under Review'));
  mitigationPlanRisks = computed(() => this.riskService.getRisksByStatus('Mitigation Plan'));
  acceptedRisks = computed(() => this.riskService.getRisksByStatus('Accepted'));

  // Summary KPIs
  totalOpenRisks = computed(() => this.newRisks().length + this.underReviewRisks().length + this.mitigationPlanRisks().length);
  highImpactRisks = computed(() => 
    this.newRisks().filter(r => r.impact >= 4).length +
    this.underReviewRisks().filter(r => r.impact >= 4).length +
    this.mitigationPlanRisks().filter(r => r.impact >= 4).length
  );
  
  getRiskScore(risk: Risk): number {
    return risk.impact * risk.likelihood;
  }

  getRiskScoreClass(score: number): string {
    if (score >= 15) return 'bg-red-500 text-white';
    if (score >= 8) return 'bg-orange-500 text-white';
    if (score >= 4) return 'bg-yellow-500 text-black';
    return 'bg-gray-500 text-white';
  }
}
