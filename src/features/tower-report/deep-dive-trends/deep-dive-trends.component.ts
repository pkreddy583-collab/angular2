import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrendDataService } from '../../../services/trend-data.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { TrendChartComponent } from './trend-chart/trend-chart.component';
import { MonthlyTrendData } from '../../../models/trend.model';

@Component({
  selector: 'app-deep-dive-trends',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PercentPipe, RouterLink, TrendChartComponent],
  templateUrl: './deep-dive-trends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeepDiveTrendsComponent {
  private trendDataService = inject(TrendDataService);
  private analyticsService = inject(AnalyticsService);

  trendData = this.trendDataService.getDeepDiveTrends();

  // Data formatted for the main comparison chart (Required vs. Deployed FTE)
  comparisonChartData = computed(() => {
    const data = this.trendData();
    return {
      labels: data.map(d => d.monthDisplay),
      datasets: [
        {
          label: 'Total Required FTE',
          data: data.map(d => d.totalRequiredFte),
          color: '#3b82f6' // blue-500
        },
        {
          label: 'Actual Deployed FTE',
          data: data.map(d => d.actualDeployedFte),
          color: '#16a34a' // green-600
        }
      ]
    };
  });

  // Data formatted for the stacked bar chart (Workload Composition)
  compositionChartData = computed(() => {
    const data = this.trendData();
    const categories = [
      { key: 'ticketDrivenFte', label: 'Ticket-Driven', color: '#3b82f6' },
      { key: 'response', label: 'Response', color: '#f97316' },
      { key: 'proactive', label: 'Proactive', color: '#22c55e' },
      { key: 'continuousImprovement', label: 'CI', color: '#8b5cf6' },
      { key: 'shiftLeft', label: 'Shift Left', color: '#ec4899' },
      { key: 'governance', label: 'Governance', color: '#6b7280' },
    ];

    return {
      labels: data.map(d => d.monthDisplay),
      datasets: categories.map(cat => ({
        label: cat.label,
        data: data.map(d => {
          if (cat.key === 'ticketDrivenFte') {
            return d.ticketDrivenFte;
          }
          return d.structuredFteBreakdown[cat.key as keyof MonthlyTrendData['structuredFteBreakdown']];
        }),
        color: cat.color
      }))
    };
  });
  
  // Data for the summary table with MoM changes
  tableData = computed(() => {
    const data = this.trendData();
    return data.map((current, i) => {
      if (i === 0) {
        return { ...current, requiredFteChange: 0, deployedFteChange: 0 };
      }
      const previous = data[i-1];
      const requiredFteChange = (current.totalRequiredFte - previous.totalRequiredFte) / previous.totalRequiredFte;
      const deployedFteChange = (current.actualDeployedFte - previous.actualDeployedFte) / previous.actualDeployedFte;
      return { ...current, requiredFteChange, deployedFteChange };
    });
  });


  exportData(): void {
    const dataToExport = this.trendData().map(d => ({
      Month: d.month,
      Total_Required_FTE: d.totalRequiredFte.toFixed(2),
      Actual_Deployed_FTE: d.actualDeployedFte.toFixed(2),
      Surplus_Deficit: d.surplusDeficit.toFixed(2),
      Ticket_Driven_FTE: d.ticketDrivenFte.toFixed(2),
      Response_FTE: d.structuredFteBreakdown.response.toFixed(2),
      Proactive_FTE: d.structuredFteBreakdown.proactive.toFixed(2),
      CI_FTE: d.structuredFteBreakdown.continuousImprovement.toFixed(2),
      Shift_Left_FTE: d.structuredFteBreakdown.shiftLeft.toFixed(2),
      Governance_FTE: d.structuredFteBreakdown.governance.toFixed(2),
    }));
    this.analyticsService.exportToCsv(dataToExport, 'deep_dive_trends_export');
  }
  
  trackByMonth(index: number, item: { month: string }): string {
    return item.month;
  }
}
