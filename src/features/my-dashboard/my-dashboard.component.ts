import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardCustomizationService } from '../../services/dashboard-customization.service';
import { PieChartComponent, PieChartData } from '../command-center/pie-chart/pie-chart.component';
import { LineChartComponent, LineChartData } from '../command-center/line-chart/line-chart.component';
import { SparklineChartComponent } from '../tower-report/sparkline-chart.component';

@Component({
  selector: 'app-my-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    PercentPipe,
    RouterLink,
    PieChartComponent,
    LineChartComponent,
    SparklineChartComponent,
  ],
  templateUrl: './my-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyDashboardComponent {
  private customizationService = inject(DashboardCustomizationService);
  pinnedWidgets = this.customizationService.pinnedWidgets;
  
  unpin(widgetId: string) {
    this.customizationService.unpin(widgetId);
  }

  // NOTE: Data is copied from command-center.component.ts for this implementation.
  // In a real application, this would come from shared data services.
  
  topKpis = [
    { label: 'Resolution SLA', value: '95%', change: '', changeDirection: 'none' as const, hasChart: true },
    { label: 'Avg TAT', value: '91Hrs', change: '6%', changeDirection: 'up' as const, hasChart: true },
    { label: 'BMI', value: '9%', change: '1%', changeDirection: 'up' as const, hasChart: true },
  ];

  mainKpis = [
    { label: 'Total Tickets Logged', value: '3,024', change: '26%', changeDirection: 'up' as const },
    { label: 'Total Tickets Resolved', value: '3,622', change: '10%', changeDirection: 'up' as const },
    { label: 'Re-opened Tickets', value: '2', change: '67%', changeDirection: 'down' as const },
    { label: 'Open-Tickets', value: '10,320', change: '24%', changeDirection: 'up' as const },
    { label: 'Achievement', value: '753', change: '', changeDirection: 'none' as const },
  ];

  lineChartData: LineChartData = {
    labels: ['Sep 21', 'Sep 22', 'Sep 23', 'Sep 24', 'Sep 25', 'Sep 26', 'Sep 27', 'Sep 28', 'Sep 29'],
    datasets: [
      { label: 'Logged', data: [8608, 4910, 4994, 3984, 3573, 6377, 8448, 7938, 6674], color: '#3b82f6' },
      { label: 'Resolved', data: [4712, 4910, 3713, 4304, 3874, 3663, 5689, 4306, 4093], color: '#22c55e' },
      { label: 'Open Tickets', data: [8608, 4910, 4994, 3984, 3573, 6377, 4241, 4993, 7938], color: '#f97316' },
    ]
  };

  pieDataLevelWise: PieChartData[] = [
    { name: 'Level 1', value: 3274, label: '3274, 48%', color: '#4ade80' },
    { name: 'Level 2', value: 341, label: '341, 5%', color: '#fb923c' },
    { name: 'Level 3', value: 3150, label: '3150, 47%', color: '#3b82f6' },
  ];

  pieDataUnresolved: PieChartData[] = [
    { name: 'Pending', value: 956, label: '956, 32%', color: '#3b82f6' },
    { name: 'Assigned To', value: 227, label: '227, 8%', color: '#fb923c' },
    { name: 'Open', value: 148, label: '148, 5%', color: '#a855f7' },
    { name: 'Work In...', value: 59, label: '59, 2%', color: '#ec4899' },
    { name: 'Others', value: 1583, label: '', color: '#4ade80' },
  ];

  unresolvedMetrics = {
    total: '6,769',
    p3: 23,
    p4: 52,
    open: 0,
    assigned: 1505,
    withLevel2: '48%',
  };

  effectiveness = {
    autoResolved: '4%',
    level1: '71%',
    level2: '21%',
  };

  applicationTrendData = [
    { name: 'CGX', trend: 'same', values: [776, 890, 1215, 5517, 168], sparkline: [10, 15, 12, 18, 14, 16] },
    { name: 'Automated Enrollment', trend: 'same', values: [438, 609, 656, 699, 853], sparkline: [20, 18, 22, 19, 21, 20] },
    { name: 'Customer Interface', trend: 'same', values: [170, 330, 155, 198, 287], sparkline: [5, 8, 6, 9, 7, 8] },
    { name: 'Enterprise Messaging', trend: 'up', values: [124, 117, 142, 143, 232], sparkline: [12, 11, 14, 13, 15, 16] },
    { name: 'Billing', trend: 'down', values: [101, 166, 175, 267, 182], sparkline: [18, 15, 14, 12, 10, 9] },
    { name: 'Claims', trend: 'up', values: [79, 104, 144, 71, 69], sparkline: [8, 10, 12, 9, 11, 13] },
    { name: 'CRM', trend: 'up', values: [73, 28, 24, 47, 19], sparkline: [4, 3, 2, 5, 1, 6] },
    { name: 'Macess', trend: 'up', values: [60, 69, 57, 31, 42], sparkline: [6, 7, 5, 3, 4, 6] },
    { name: 'Verint', trend: 'down', values: [55, 140, 172, 127, 302], sparkline: [25, 14, 17, 12, 30, 5] },
    { name: 'CDF', trend: 'down', values: [55, 107, 92, 42, 117], sparkline: [15, 10, 9, 4, 11, 5] },
  ];

  valueStreamTrendData = [
    { name: 'Sales', trend: 'same', values: [1697, 2231, 2786, 7082, 1864], sparkline: [15, 22, 27, 70, 18] },
    { name: 'Enrollment', trend: 'same', values: [745, 1302, 1214, 880, 1170], sparkline: [7, 13, 12, 8, 11] },
    { name: 'Claims', trend: 'up', values: [221, 135, 109, 152, 121], sparkline: [2, 1, 1, 1.5, 1.2] },
    { name: 'Billing', trend: 'down', values: [125, 169, 207, 120, 141], sparkline: [2, 1.6, 2, 1.2, 1.4] },
    { name: 'Clinical', trend: 'up', values: [121, 102, 124, 61, 91], sparkline: [1.2, 1, 1.2, 0.6, 0.9] },
    { name: 'Security', trend: 'down', values: [95, 148, 101, 131, 99], sparkline: [1, 1.5, 1, 1.3, 1] },
    { name: 'Pharmacy', trend: 'same', values: [20, 18, 25, 22, 20], sparkline: [0.2, 0.18, 0.25, 0.22, 0.2] },
  ];
}