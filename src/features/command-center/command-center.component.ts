import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { PieChartComponent, PieChartData } from './pie-chart/pie-chart.component';
import { LineChartComponent, LineChartData } from './line-chart/line-chart.component';
import { SparklineChartComponent } from '../tower-report/sparkline-chart.component';
import { DashboardCustomizationService } from '../../services/dashboard-customization.service';
import { AnalyticsService } from '../../services/analytics.service';

// --- Type definitions for table data and sorting ---
type TicketSeverity = { stream: string; urgent: number; high: number; medHigh: number; medium: number; };
type TrendData = { name: string; trend: string; values: number[]; sparkline: number[]; };
type UnresolvedAppTrendDetailed = {
  name: string;
  trend: 'up' | 'down' | 'same';
  openTickets: number;
  l1: number;
  l2: number;
  l3: number;
  assignedTo: number;
  open: number;
  pending: number;
};


type SortDirection = 'asc' | 'desc';
interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
  index?: number; // For sorting array properties like 'values'
}

interface Portfolio {
  id: string;
  name: string;
  valueStreams: string[];
  applications: string[];
}

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PercentPipe, PieChartComponent, LineChartComponent, SparklineChartComponent],
  templateUrl: './command-center.component.html',
  styleUrls: ['./command-center.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandCenterComponent {
  private customizationService = inject(DashboardCustomizationService);
  private analyticsService = inject(AnalyticsService);
  
  isPinned(widgetId: string): boolean {
    return this.customizationService.isPinned(widgetId);
  }

  togglePin(widgetId: string, title: string): void {
    this.customizationService.togglePin(widgetId, title);
  }

  // --- Portfolio Slicer Logic ---
  portfolios: Portfolio[] = [
    { id: 'all', name: 'All Portfolios', valueStreams: [], applications: [] },
    { 
      id: 'msp', 
      name: 'Member & Provider Services', 
      valueStreams: ['Sales', 'Enrolment', 'Clinical', 'Pharmacy'],
      applications: ['Automated Enrollment', 'Customer Interface', 'CRM', 'Macess']
    },
    { 
      id: 'fco', 
      name: 'Financial & Core Operations',
      valueStreams: ['Claims', 'Billing', 'Security', 'Enterprise Services'],
      applications: ['CGX', 'Enterprise Messaging', 'Billing', 'Claims', 'Verint', 'CDF', 'IAM', 'ATLAS', 'EPOST', 'Producer']
    },
  ];
  selectedPortfolioId = signal('all');

  onPortfolioChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPortfolioId.set(selectElement.value);
  }

  // --- New properties for added widgets ---
  activeSeverityAgeTab = signal('Age > 1 day');
  severityAgeTabs = ['Age > 1 day', 'Age > 3 day', 'Age > 5 day', 'Age > 10 day', 'Age > 30 day'];
  trendDates = ['Sep 30', 'Sep 29', 'Sep 28', 'Sep 27', 'Sep 26', 'Sep 25'];

  // --- RAW DATA SIGNALS (private) ---
  private _ticketSeverityData = signal<TicketSeverity[]>([
    { stream: 'Sales', urgent: 7, high: 4, medHigh: 285, medium: 4196 },
    { stream: 'Enrolment', urgent: 11, high: 14, medHigh: 261, medium: 1712 },
    { stream: 'Claims', urgent: 2, high: 19, medHigh: 64, medium: 271 },
    { stream: 'Billing', urgent: 0, high: 9, medHigh: 55, medium: 260 },
    { stream: 'Clinical', urgent: 6, high: 0, medHigh: 47, medium: 200 },
    { stream: 'Security', urgent: 0, high: 10, medHigh: 3, medium: 48 },
    { stream: 'Pharmacy', urgent: 0, high: 0, medHigh: 4, medium: 28 },
    { stream: 'Enterprise Services', urgent: 0, high: 0, medHigh: 0, medium: 4 },
  ]);
  
  private _openTicketTrendData = signal<TrendData[]>([
    { name: 'Sales', trend: 'same', values: [3926, 4300, 5264, 2101, 3813, 2419], sparkline: [39, 43, 52, 21, 38, 24] },
    { name: 'Enrolment', trend: 'same', values: [1887, 1543, 1725, 1032, 1606, 934], sparkline: [18, 15, 17, 10, 16, 9] },
    { name: 'Claims', trend: 'up', values: [345, 296, 342, 222, 362, 206], sparkline: [3.4, 2.9, 3.4, 2.2, 3.6, 2] },
    { name: 'Billing', trend: 'up', values: [289, 215, 252, 110, 184, 60], sparkline: [2.8, 2.1, 2.5, 1.1, 1.8, 0.6] },
    { name: 'Clinical', trend: 'down', values: [233, 240, 267, 156, 280, 177], sparkline: [2.3, 2.4, 2.6, 1.5, 2.8, 1.7] },
    { name: 'Security', trend: 'same', values: [55, 45, 52, 22, 71, 31], sparkline: [5, 4, 5, 2, 7, 3] },
    { name: 'Pharmacy', trend: 'same', values: [30, 31, 32, 19, 55, 37], sparkline: [3, 3, 3, 2, 5, 3] },
    { name: 'Enterprise Services', trend: 'same', values: [4, 4, 4, 1, 6, 10], sparkline: [4, 4, 4, 1, 6, 10] },
  ]);
  
  private _applicationTrendData = signal<TrendData[]>([
    { name: 'CGX', trend: 'same', values: [776, 890, 1215, 5517, 168, 110], sparkline: [7, 8, 12, 55, 1, 1] },
    { name: 'Automated Enrollment', trend: 'same', values: [438, 609, 656, 699, 853, 626], sparkline: [4, 6, 6.5, 7, 8.5, 6] },
    { name: 'Customer Interface', trend: 'same', values: [170, 330, 155, 198, 287, 1026], sparkline: [1.7, 3.3, 1.5, 2, 2.8, 10] },
    { name: 'Enterprise Messaging', trend: 'up', values: [124, 117, 142, 143, 232, 126], sparkline: [1.2, 1.1, 1.4, 1.4, 2.3, 1.2] },
    { name: 'Billing', trend: 'down', values: [101, 166, 175, 267, 182, 124], sparkline: [1, 1.6, 1.7, 2.6, 1.8, 1.2] },
    { name: 'Claims', trend: 'up', values: [79, 104, 144, 71, 69, 52], sparkline: [0.8, 1, 1.4, 0.7, 0.7, 0.5] },
    { name: 'CRM', trend: 'up', values: [73, 28, 24, 47, 19, 6], sparkline: [7, 3, 2, 5, 2, 1] },
    { name: 'Macess', trend: 'up', values: [60, 69, 57, 31, 42, 50], sparkline: [6, 7, 5, 3, 4, 5] },
    { name: 'Verint', trend: 'down', values: [55, 140, 172, 127, 302, 266], sparkline: [5, 14, 17, 12, 30, 26] },
    { name: 'CDF', trend: 'down', values: [55, 107, 92, 42, 117, 67], sparkline: [5, 10, 9, 4, 11, 6] },
  ]);

  private _valueStreamTrendData = signal<TrendData[]>([
    { name: 'Sales', trend: 'same', values: [1697, 2231, 2786, 7082, 1864, 2252], sparkline: [17, 22, 28, 70, 18, 22] },
    { name: 'Enrollment', trend: 'same', values: [745, 1302, 1214, 880, 1170, 817], sparkline: [7, 13, 12, 8, 11, 8] },
    { name: 'Claims', trend: 'up', values: [221, 135, 109, 152, 121, 121], sparkline: [2.2, 1.3, 1.1, 1.5, 1.2, 1.2] },
    { name: 'Billing', trend: 'down', values: [125, 169, 207, 120, 141, 115], sparkline: [1.2, 1.7, 2, 1.2, 1.4, 1.1] },
    { name: 'Clinical', trend: 'up', values: [121, 102, 124, 61, 91, 99], sparkline: [1.2, 1, 1.2, 0.6, 0.9, 1] },
    { name: 'Security', trend: 'down', values: [95, 148, 101, 131, 99, 96], sparkline: [1, 1.5, 1, 1.3, 1, 1] },
    { name: 'Pharmacy', trend: 'same', values: [20, 18, 25, 22, 20, 17], sparkline: [0.2, 0.18, 0.25, 0.22, 0.2, 0.17] },
    { name: 'Enterprise Services', trend: 'same', values: [0, 0, 0, 0, 0, 0], sparkline: [0,0,0,0,0,0] },
  ]);

  private _unresolvedApplicationTrendDataDetailed = signal<UnresolvedAppTrendDetailed[]>([
    { name: 'CRM', trend: 'up', openTickets: 258, l1: 0, l2: 100, l3: 0, assignedTo: 80, open: 0, pending: 178 },
    { name: 'Producer', trend: 'up', openTickets: 188, l1: 17, l2: 83, l3: 0, assignedTo: 20, open: 0, pending: 156 },
    { name: 'Macess', trend: 'up', openTickets: 177, l1: 4, l2: 96, l3: 0, assignedTo: 15, open: 0, pending: 149 },
    { name: 'IAM', trend: 'up', openTickets: 171, l1: 97, l2: 3, l3: 0, assignedTo: 1, open: 0, pending: 163 },
    { name: 'ATLAS', trend: 'up', openTickets: 164, l1: 66, l2: 34, l3: 0, assignedTo: 51, open: 0, pending: 94 },
    { name: 'Billing', trend: 'down', openTickets: 122, l1: 61, l2: 39, l3: 0, assignedTo: 11, open: 0, pending: 109 },
    { name: 'EPOST', trend: 'up', openTickets: 123, l1: 0, l2: 100, l3: 0, assignedTo: 31, open: 80, pending: 2 },
    { name: 'Claims', trend: 'up', openTickets: 399, l1: 4, l2: 80, l3: 16, assignedTo: 332, open: 39, pending: 17 },
    { name: 'Automated Enrollment', trend: 'same', openTickets: 346, l1: 56, l2: 28, l3: 16, assignedTo: 34, open: 0, pending: 298 }
  ]);
  
  // --- FILTERED/COMPUTED DATA SIGNALS (public) ---
  selectedPortfolio = computed(() => this.portfolios.find(p => p.id === this.selectedPortfolioId()));

  filteredTicketSeverityData = computed(() => {
    const portfolio = this.selectedPortfolio();
    if (!portfolio || portfolio.id === 'all') return this._ticketSeverityData();
    return this._ticketSeverityData().filter(item => portfolio.valueStreams.includes(item.stream));
  });

  filteredOpenTicketTrendData = computed(() => {
    const portfolio = this.selectedPortfolio();
    if (!portfolio || portfolio.id === 'all') return this._openTicketTrendData();
    return this._openTicketTrendData().filter(item => portfolio.valueStreams.includes(item.name));
  });

  filteredApplicationTrendData = computed(() => {
    const portfolio = this.selectedPortfolio();
    if (!portfolio || portfolio.id === 'all') return this._applicationTrendData();
    return this._applicationTrendData().filter(item => portfolio.applications.includes(item.name));
  });

  filteredValueStreamTrendData = computed(() => {
    const portfolio = this.selectedPortfolio();
    if (!portfolio || portfolio.id === 'all') return this._valueStreamTrendData();
    return this._valueStreamTrendData().filter(item => portfolio.valueStreams.includes(item.name));
  });

  filteredUnresolvedApplicationTrendDataDetailed = computed(() => {
    const portfolio = this.selectedPortfolio();
    if (!portfolio || portfolio.id === 'all') return this._unresolvedApplicationTrendDataDetailed();
    return this._unresolvedApplicationTrendDataDetailed().filter(item => portfolio.applications.includes(item.name));
  });
  

  // --- Updated data for existing widgets to match images ---
  topKpis = [
    { label: 'Resolution SLA', value: '95%', change: '', changeDirection: 'none' as const, hasChart: true },
    { label: 'Avg TAT', value: '91Hrs', change: '6%', changeDirection: 'up' as const, hasChart: true },
    { label: 'BMI', value: '9%', change: '1%', changeDirection: 'up' as const, hasChart: true },
    { label: 'FTR', value: '99.94%', change: '', changeDirection: 'none' as const, hasChart: true },
  ];

  mainKpis = computed(() => {
    const loggedData = this.filteredValueStreamTrendData();
    const resolvedData = this.filteredValueStreamTrendData(); // Assuming same source for resolved
    const openData = this.filteredOpenTicketTrendData();

    const totalLogged = loggedData.reduce((sum, item) => sum + item.values[0], 0);
    const totalResolved = resolvedData.reduce((sum, item) => sum + item.values[0], 0); // Placeholder, real logic would be different
    const totalOpen = openData.reduce((sum, item) => sum + item.values[0], 0);

    return [
      { label: 'Total Tickets Logged', value: totalLogged.toLocaleString(), change: '26%', changeDirection: 'up' as const },
      { label: 'Total Tickets Resolved', value: totalResolved.toLocaleString(), change: '10%', changeDirection: 'up' as const },
      { label: 'Re-opened Tickets', value: '2', change: '67%', changeDirection: 'down' as const },
      { label: 'Open Tickets', value: totalOpen.toLocaleString(), change: '24%', changeDirection: 'up' as const },
      { label: 'Achievement', value: '753', change: '', changeDirection: 'none' as const },
    ];
  });

  lineChartData: LineChartData = {
    labels: ['Sep 21', 'Sep 22', 'Sep 23', 'Sep 24', 'Sep 25', 'Sep 26', 'Sep 27', 'Sep 28', 'Sep 29', 'Sep 30'],
    datasets: [
      { label: 'Logged', data: [4008, 4010, 4082, 2984, 3874, 3490, 4241, 4506, 3622, 3024], color: '#3b82f6' },
      { label: 'Resolved', data: [4712, 3713, 3713, 4304, 3573, 6377, 5689, 4993, 4015, 3622], color: '#22c55e' },
      { label: 'Open Tickets', data: [4088, 4019, 3914, 4304, 3874, 6377, 8448, 7938, 6674, 6769], color: '#f97316' },
    ]
  };

  pieDataLevelWise: PieChartData[] = [
    { name: 'Level 1', value: 3274, label: '3274, 48%', color: '#3b82f6' },
    { name: 'Level 2', value: 3150, label: '3150, 47%', color: '#4ade80' },
    { name: 'Level 3', value: 343, label: '343, 5%', color: '#fb923c' },
  ];

  pieDataUnresolved: PieChartData[] = [
    { name: 'Pending', value: 956, label: '956, 32%', color: '#3b82f6' },
    { name: 'Assigned To', value: 1573, label: '1573, 53%', color: '#4ade80' },
    { name: 'Open', value: 227, label: '227, 8%', color: '#fb923c' },
    { name: 'Work In Progress', value: 148, label: '148, 5%', color: '#a855f7' },
    { name: 'On Hold', value: 59, label: '59, 2%', color: '#ec4899' },
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
    level3: '4%',
  };
  
  // --- KPI Popup Logic ---
  kpiPopups = {
    'Total Tickets Resolved': {
      'Resolved by L1': '2,582',
      'Resolved by L2': '762',
      'Resolved by L3': '128',
      'Auto-resolved': '150'
    },
    'Open Tickets': {
      'Age > 1 day': '7,520',
      'Age > 3 days': '6,769',
      'Age > 5 days': '2,963'
    }
  };
  hoveredKpi = signal<{ label: string; data: { key: string; value: string }[]; top: number; left: number } | null>(null);

  onKpiMouseEnter(event: MouseEvent, kpiLabel: string) {
    const dataObject = (this.kpiPopups as Record<string, Record<string, string>>)[kpiLabel];
    if (dataObject) {
      const dataArray = Object.keys(dataObject).map(key => ({ key, value: dataObject[key] }));
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.hoveredKpi.set({ 
        label: kpiLabel, 
        data: dataArray, 
        top: rect.bottom + window.scrollY + 5, 
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
  }

  onKpiMouseLeave() {
    this.hoveredKpi.set(null);
  }

  // --- Sorting Logic ---
  sortConfigs = signal({
    severity: { key: 'stream', direction: 'asc' } as SortConfig<TicketSeverity>,
    openTrend: { key: 'name', direction: 'asc' } as SortConfig<TrendData>,
    appTrend: { key: 'name', direction: 'asc' } as SortConfig<TrendData>,
    valueStreamTrend: { key: 'name', direction: 'asc' } as SortConfig<TrendData>,
    unresolvedAppTrendDetailed: { key: 'name', direction: 'asc' } as SortConfig<UnresolvedAppTrendDetailed>,
  });

  handleSort(table: keyof ReturnType<typeof this.sortConfigs>, key: string, index?: number) {
    this.sortConfigs.update(configs => {
      const currentConfig = configs[table];
      const isSameColumn = currentConfig.key === key && (index === undefined || currentConfig.index === index);
      const newDirection: SortDirection = isSameColumn && currentConfig.direction === 'asc' ? 'desc' : 'asc';
      
      const newConfigs = { ...configs };
      (newConfigs as any)[table] = { key, direction: newDirection, index };
      
      return newConfigs;
    });
  }

  private sortData<T>(data: T[], config: SortConfig<T>): T[] {
    const { key, direction, index } = config;
    return [...data].sort((a, b) => {
      const valA = (a as any)[key];
      const valB = (b as any)[key];
  
      let comparison = 0;
      if (Array.isArray(valA) && Array.isArray(valB) && index !== undefined) {
        comparison = (valA[index] ?? 0) - (valB[index] ?? 0);
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }
  
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  sortedSeverityData = computed(() => this.sortData(this.filteredTicketSeverityData(), this.sortConfigs().severity));
  sortedOpenTrendData = computed(() => this.sortData(this.filteredOpenTicketTrendData(), this.sortConfigs().openTrend));
  sortedAppTrendData = computed(() => this.sortData(this.filteredApplicationTrendData(), this.sortConfigs().appTrend));
  sortedValueStreamTrendData = computed(() => this.sortData(this.filteredValueStreamTrendData(), this.sortConfigs().valueStreamTrend));
  sortedUnresolvedAppTrendDataDetailed = computed(() => this.sortData(this.filteredUnresolvedApplicationTrendDataDetailed(), this.sortConfigs().unresolvedAppTrendDetailed));

  // --- Export Logic ---
  exportData(table: string): void {
    let data: any[];
    let filename: string;
    
    switch(table) {
      case 'severity':
        data = this.sortedSeverityData();
        filename = 'ticket_severity_by_value_stream';
        break;
      case 'openTrend':
        data = this.sortedOpenTrendData().map(d => ({ Name: d.name, ...this.trendDates.reduce((obj, date, i) => ({...obj, [date]: d.values[i]}), {})}));
        filename = 'daily_open_ticket_trend_by_value_stream';
        break;
      case 'appTrend':
        data = this.sortedAppTrendData().map(d => ({ Name: d.name, ...this.trendDates.reduce((obj, date, i) => ({...obj, [date]: d.values[i]}), {})}));
        filename = 'daily_logged_ticket_trend_by_app';
        break;
      case 'valueStreamTrend':
        data = this.sortedValueStreamTrendData().map(d => ({ Name: d.name, ...this.trendDates.reduce((obj, date, i) => ({...obj, [date]: d.values[i]}), {})}));
        filename = 'daily_logged_ticket_trend_by_value_stream';
        break;
      case 'unresolvedAppTrendDetailed':
        data = this.sortedUnresolvedAppTrendDataDetailed();
        filename = 'unresolved_ticket_trend_by_app';
        break;
      default:
        return;
    }
    this.analyticsService.exportToCsv(data, filename);
  }
}
